'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppContext } from '@/lib/context';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiArrowLeft, FiLock, FiMapPin, FiCreditCard } from 'react-icons/fi';

// Import our new components
import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import OrderSummary from '@/components/checkout/OrderSummary';
import PaymentMethods from '@/components/checkout/PaymentMethods';
import ShippingOptions from '@/components/checkout/ShippingOptions';
import SquarePaymentForm from '@/components/SquarePaymentForm';

// Form validation schema
const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  paymentMethod: z.string(),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function EnhancedCheckoutPage() {
  const router = useRouter();
  const { user, cart, getCartTotal, clearCart } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [shippingRates, setShippingRates] = useState<any>(null);
  const [selectedShipping, setSelectedShipping] = useState<string>('ground');
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<CheckoutFormData | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Redirect if not logged in or cart is empty
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout');
    } else if (cart.length === 0) {
      router.push('/cart');
    }
  }, [user, cart, router]);

  const { register, handleSubmit, watch, trigger, getValues, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'credit_card',
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');

  // Calculate shipping rates
  const calculateShippingRates = async (formData: any) => {
    setCalculatingShipping(true);
    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: 'US'
          },
          cartItems: cart
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShippingRates(data.rates);
      } else {
        // Fallback rates
        setShippingRates({
          ground: { service: 'Standard Shipping', cost: 12.99, estimatedDays: '3-5 business days', carrier: 'UPS' },
          express: { service: 'Express Shipping', cost: 19.99, estimatedDays: '2 business days', carrier: 'UPS' },
          overnight: { service: 'Overnight Shipping', cost: 29.99, estimatedDays: '1 business day', carrier: 'UPS' }
        });
      }
    } catch (error) {
      console.error('❌ Error calculating shipping:', error);
      // Use fallback rates
      setShippingRates({
        ground: { service: 'Standard Shipping', cost: 12.99, estimatedDays: '3-5 business days', carrier: 'UPS' },
        express: { service: 'Express Shipping', cost: 19.99, estimatedDays: '2 business days', carrier: 'UPS' },
        overnight: { service: 'Overnight Shipping', cost: 29.99, estimatedDays: '1 business day', carrier: 'UPS' }
      });
    } finally {
      setCalculatingShipping(false);
    }
  };

  const proceedToPayment = async () => {
    const isValid = await trigger(['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode']);
    
    if (isValid) {
      const formData = getValues();
      setCurrentFormData(formData);
      await calculateShippingRates(formData);
      setStep(2);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setError('Please fill out all required fields correctly before proceeding.');
    }
  };

  const handleSquarePaymentSuccess = async (result: any) => {
    if (!user || !currentFormData) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = currentFormData;
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setCurrentOrderId(orderId);
      
      await setDoc(doc(db, 'orders', orderId), {
        userId: user.uid,
        items: cart.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images?.[0] || ''
        })),
        subtotal: getCartTotal(),
        shipping: shippingRates?.[selectedShipping]?.cost || 0,
        tax: getCartTotal() * 0.0825, // 8.25% TX tax
        total: getCartTotal() + (shippingRates?.[selectedShipping]?.cost || 0) + (getCartTotal() * 0.0825),
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        billingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingMethod: shippingRates?.[selectedShipping] || null,
        paymentMethod: 'credit_card',
        paymentId: result.paymentId,
        notes: formData.notes || '',
        status: 'processing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      clearCart();
      setStep(3);
      
      // Redirect to success page after a moment
      setTimeout(() => {
        router.push(`/order-confirmation/${orderId}`);
      }, 2000);

    } catch (error) {
      console.error('❌ Error creating order:', error);
      setError('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSquarePaymentError = (error: any) => {
    console.error('❌ Payment error:', error);
    setError(error.message || 'Payment failed. Please try again.');
    setIsSubmitting(false);
  };

  if (!user || cart.length === 0) {
    return null; // Will redirect
  }

  const subtotal = getCartTotal();
  const shippingCost = shippingRates?.[selectedShipping]?.cost || 0;
  const tax = subtotal * 0.0825; // Texas sales tax
  const total = subtotal + shippingCost + tax;
  const freeShippingEligible = subtotal >= 75;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <CheckoutProgress currentStep={step} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <FiMapPin className="text-blue-600 mr-3 text-xl" />
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="text-red-700 text-sm">{error}</div>
                  </div>
                )}

                <form className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      {...register('fullName')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      {...register('address')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Main Street"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        {...register('city')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Dallas"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        {...register('state')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="TX"
                        maxLength={2}
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        {...register('zipCode')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="75201"
                      />
                      {errors.zipCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any special instructions for your order..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={proceedToPayment}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    Continue to Shipping Options
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Shipping Options */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <ShippingOptions
                    options={shippingRates || {}}
                    selectedOption={selectedShipping}
                    onOptionChangeAction={setSelectedShipping}
                    loading={calculatingShipping}
                  />
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <PaymentMethods
                    selectedMethod={selectedPaymentMethod}
                    onMethodChange={(method) => {
                      // Update form data
                    }}
                  />
                </div>

                {/* Payment Form */}
                {selectedPaymentMethod === 'credit_card' && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center mb-6">
                      <FiCreditCard className="text-blue-600 mr-3 text-xl" />
                      <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                      <FiLock className="ml-auto text-green-600" />
                    </div>

                    <SquarePaymentForm
                      amount={total}
                      orderId={currentOrderId || undefined}
                      billingContact={currentFormData}
                      shippingContact={currentFormData}
                      onPaymentSuccessAction={handleSquarePaymentSuccess}
                      onPaymentErrorAction={handleSquarePaymentError}
                      isLoading={isSubmitting}
                    />

                    {error && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <div className="text-red-700 text-sm">{error}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                <p className="text-gray-600 mb-4">
                  Thank you for your order. You'll receive a confirmation email shortly.
                </p>
                {currentOrderId && (
                  <p className="text-sm text-gray-500">
                    Order ID: <span className="font-mono">{currentOrderId}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <OrderSummary
                items={cart}
                subtotal={subtotal}
                shipping={shippingCost}
                tax={tax}
                total={total}
                shippingMethod={shippingRates?.[selectedShipping]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}