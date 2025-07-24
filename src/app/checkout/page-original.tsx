'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppContext } from '@/lib/context';
import ComingSoonModal from '@/components/ComingSoonModal';
import ComingSoonBanner from '@/components/ComingSoonBanner';
import Button from '@/components/Button';
import SquarePaymentForm from '@/components/SquarePaymentForm';
import { motion } from 'framer-motion';
import { FiTruck, FiCreditCard, FiCheck, FiAlertCircle } from 'react-icons/fi';

// US States list
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Form validation schema
const checkoutSchema = z.object({
  // Shipping Information
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.enum(['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'] as const, {
    errorMap: () => ({ message: 'Please select a valid US state' })
  }),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid US ZIP code'),
  
  // Payment Information
  paymentMethod: z.enum(['credit_card']),
  
  // Additional Information
  notes: z.string().optional(),
  
  // Save information
  saveInfo: z.boolean().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
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
        console.log('✅ Shipping rates calculated:', data.rates);
      } else {
        console.error('❌ Failed to calculate shipping:', data.error);
        // Use fallback rates
        setShippingRates({
          ground: { service: 'Standard Shipping', cost: 12.99, estimatedDays: '3-5 business days' },
          express: { service: 'Express Shipping', cost: 19.99, estimatedDays: '2 business days' },
          overnight: { service: 'Overnight Shipping', cost: 29.99, estimatedDays: '1 business day' }
        });
      }
    } catch (error) {
      console.error('❌ Error calculating shipping:', error);
      // Use fallback rates
      setShippingRates({
        ground: { service: 'Standard Shipping', cost: 12.99, estimatedDays: '3-5 business days' },
        express: { service: 'Express Shipping', cost: 19.99, estimatedDays: '2 business days' },
        overnight: { service: 'Overnight Shipping', cost: 29.99, estimatedDays: '1 business day' }
      });
    } finally {
      setCalculatingShipping(false);
    }
  };

  const proceedToPayment = async () => {
    try {
      // Trigger form validation
      const isValid = await trigger(['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode']);
      
      if (isValid) {
        const formData = getValues();
        setCurrentFormData(formData);
        await calculateShippingRates(formData);
        setStep(2);
      } else {
        // Scroll to top to show errors
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setError('Please fill out all required fields correctly before proceeding.');
      }
    } catch (error) {
      console.error('Error proceeding to payment:', error);
      setError('An error occurred while processing your information. Please try again.');
    }
  };
  
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
  
  // Handle Square payment success
  const handleSquarePaymentSuccess = async (paymentResult: any) => {
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get current form data
      const formData = getValues();
      
      // Generate order ID
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setCurrentOrderId(orderId);
      
      // Create order in Firestore with payment info
      await setDoc(doc(db, 'orders', orderId), {
        userId: user.uid,
        items: cart.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || '/images/placeholder.svg',
        })),
        total: getCartTotal() + (shippingRates && shippingRates[selectedShipping] ? shippingRates[selectedShipping].cost : 0),
        shipping: shippingRates && shippingRates[selectedShipping] ? shippingRates[selectedShipping].cost : 0,
        shippingMethod: shippingRates && shippingRates[selectedShipping] ? shippingRates[selectedShipping].service : 'Standard',
        status: 'paid',
        paymentMethod: 'credit_card',
        paymentId: paymentResult.paymentId,
        paymentStatus: paymentResult.status,
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        customerInfo: {
          email: formData.email,
          phone: formData.phone,
        },
        notes: formData.notes,
        createdAt: serverTimestamp(),
      });
      
      // Clear the cart
      clearCart();
      
      // Redirect to order confirmation
      router.push(`/checkout/confirmation?orderId=${orderId}&paymentId=${paymentResult.paymentId}`);
    } catch (err) {
      console.error('Error creating order after payment:', err);
      setError('Payment succeeded but failed to create order record. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle Square payment error
  const handleSquarePaymentError = (error: any) => {
    console.error('Square payment error:', error);
    setError(typeof error === 'string' ? error : error.message || 'Payment failed. Please try again.');
  };
  
  const onSubmit = async (data: CheckoutFormData) => {
    if (!user) return;
    
    // All payments are now handled by Square
    setError('Please use the credit card form above to complete your payment.');
  };
  
  // If not logged in or cart is empty, show loading
  if (!user || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Secure Checkout</h1>
      
      {/* Checkout Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className={`flex flex-col items-center ${step >= 1 ? 'text-lime-400' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-lime-900 text-lime-400 border-2 border-lime-400' : 'bg-gray-700 text-gray-500'
            }`}>
              <FiTruck className="h-5 w-5" />
            </div>
            <span className="mt-2 text-sm font-medium">Shipping</span>
          </div>
          
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-lime-500' : 'bg-gray-700'}`}></div>
          
          <div className={`flex flex-col items-center ${step >= 2 ? 'text-lime-400' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-lime-900 text-lime-400 border-2 border-lime-400' : 'bg-gray-700 text-gray-500'
            }`}>
              <FiCreditCard className="h-5 w-5" />
            </div>
            <span className="mt-2 text-sm font-medium">Payment</span>
          </div>
          
          <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-lime-500' : 'bg-gray-700'}`}></div>
          
          <div className={`flex flex-col items-center ${step >= 3 ? 'text-lime-400' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-lime-900 text-lime-400 border-2 border-lime-400' : 'bg-gray-700 text-gray-500'
            }`}>
              <FiCheck className="h-5 w-5" />
            </div>
            <span className="mt-2 text-sm font-medium">Confirmation</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-400 mr-2" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700"
              >
                <h2 className="text-2xl font-bold text-white mb-8">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-200 mb-2">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      {...register('fullName')}
                      className={`w-full p-3 border-2 rounded-lg text-white bg-gray-700 transition-colors ${
                        errors.fullName 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-gray-600 focus:border-lime-500'
                      } focus:outline-none focus:ring-2 focus:ring-lime-900`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="mt-2 text-sm text-red-400 font-medium">{errors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      className={`w-full p-3 border-2 rounded-lg text-white bg-gray-700 transition-colors ${
                        errors.email 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-gray-600 focus:border-lime-500'
                      } focus:outline-none focus:ring-2 focus:ring-lime-900`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-400 font-medium">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-200 mb-2">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      className={`w-full p-3 border-2 rounded-lg text-white bg-gray-700 transition-colors ${
                        errors.phone 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-gray-600 focus:border-lime-500'
                      } focus:outline-none focus:ring-2 focus:ring-lime-900`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-400 font-medium">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-200 mb-2">
                      Street Address *
                    </label>
                    <input
                      id="address"
                      type="text"
                      {...register('address')}
                      className={`w-full p-3 border-2 rounded-lg text-white bg-gray-700 transition-colors ${
                        errors.address 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-gray-600 focus:border-lime-500'
                      } focus:outline-none focus:ring-2 focus:ring-lime-900`}
                      placeholder="123 Main Street"
                    />
                    {errors.address && (
                      <p className="mt-2 text-sm text-red-400 font-medium">{errors.address.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-gray-200 mb-2">
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      {...register('city')}
                      className={`w-full p-3 border-2 rounded-lg text-white bg-gray-700 transition-colors ${
                        errors.city 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-gray-600 focus:border-lime-500'
                      } focus:outline-none focus:ring-2 focus:ring-lime-900`}
                      placeholder="Enter your city"
                    />
                    {errors.city && (
                      <p className="mt-2 text-sm text-red-400 font-medium">{errors.city.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-semibold text-gray-200 mb-2">
                      State *
                    </label>
                    <select
                      id="state"
                      {...register('state')}
                      className={`w-full p-3 border-2 rounded-lg text-white bg-gray-700 transition-colors ${
                        errors.state 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-gray-600 focus:border-lime-500'
                      } focus:outline-none focus:ring-2 focus:ring-lime-900`}
                    >
                      <option value="" className="bg-gray-700 text-white">Select State</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state} className="bg-gray-700 text-white">{state}</option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="mt-2 text-sm text-red-400 font-medium">{errors.state.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-200 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      {...register('zipCode')}
                      className={`w-full p-3 border-2 rounded-lg text-white bg-gray-700 transition-colors ${
                        errors.zipCode 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-gray-600 focus:border-lime-500'
                      } focus:outline-none focus:ring-2 focus:ring-lime-900`}
                      placeholder="12345"
                    />
                    {errors.zipCode && (
                      <p className="mt-2 text-sm text-red-400 font-medium">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>
                
                {/* Save Information Checkbox */}
                <div className="mt-6 p-4 bg-blue-900 rounded-lg border border-blue-700">
                  <div className="flex items-center">
                    <input
                      id="saveInfo"
                      type="checkbox"
                      {...register('saveInfo')}
                      className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor="saveInfo" className="ml-2 block text-sm text-blue-200">
                      Save this information for future orders
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-blue-300">
                    We'll securely save your shipping details to make checkout faster next time.
                  </p>
                </div>
                
                {/* Continue Button */}
                <div className="mt-8 flex justify-end">
                  <Button 
                    type="button"
                    onClick={proceedToPayment}
                    variant="primary" 
                    size="lg"
                    className="px-8 py-3"
                  >
                    Continue to Payment
                  </Button>
                </div>
                
                {/* US Only Notice */}
                <div className="mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded-lg">
                  <div className="flex items-center">
                    <FiAlertCircle className="h-4 w-4 text-yellow-400 mr-2" />
                    <span className="text-sm font-medium text-yellow-200">US Only Shipping</span>
                  </div>
                  <p className="mt-1 text-xs text-yellow-300">
                    We currently only ship within the United States. International shipping coming soon!
                  </p>
                </div>
                

              </motion.div>
            )}
            
            {/* Step 2: Shipping & Payment Information */}
            {step === 2 && (
              <>
                {/* Shipping Options */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 mb-6"
                >
                  <h2 className="text-xl font-semibold mb-6 text-white">Shipping Options</h2>
                  
                  {calculatingShipping ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
                      <span className="ml-3 text-gray-300">Calculating shipping rates...</span>
                    </div>
                  ) : shippingRates ? (
                    <div className="space-y-3">
                      {Object.entries(shippingRates).map(([key, rate]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between p-4 border border-gray-600 rounded-lg hover:border-lime-500 transition-colors">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={`shipping-${key}`}
                              name="shippingMethod"
                              value={key}
                              checked={selectedShipping === key}
                              onChange={(e) => setSelectedShipping(e.target.value)}
                              className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-600 bg-gray-700"
                            />
                            <div className="ml-3">
                              <label htmlFor={`shipping-${key}`} className="text-sm font-medium text-white cursor-pointer">
                                {rate.service}
                              </label>
                              <p className="text-xs text-gray-400">{rate.estimatedDays}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-lime-400">${rate.cost.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      Shipping rates will be calculated based on your address
                    </div>
                  )}
                </motion.div>

                {/* Payment Method */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700"
                >
                  <h2 className="text-xl font-semibold mb-6 text-white">Payment Method</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="credit_card"
                      type="radio"
                      value="credit_card"
                      {...register('paymentMethod')}
                      className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-600 bg-gray-700"
                      defaultChecked
                    />
                    <label htmlFor="credit_card" className="ml-3 block text-sm font-medium text-gray-200">
                      Credit/Debit Card (Secure Payment via Square)
                    </label>
                  </div>
                </div>
                

                
                {selectedPaymentMethod === 'credit_card' && (
                  <div className="mt-4">
                    <SquarePaymentForm
                      amount={getCartTotal()}
                      orderId={currentOrderId || undefined}
                      billingContact={currentFormData}
                      shippingContact={currentFormData}
                      onPaymentSuccessAction={handleSquarePaymentSuccess}
                      onPaymentErrorAction={handleSquarePaymentError}
                      isLoading={isSubmitting}
                    />
                  </div>
                )}
                
                <div className="mt-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-200 mb-1">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    {...register('notes')}
                    className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    placeholder="Special instructions for delivery or any other notes"
                  ></textarea>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back to Shipping
                  </Button>
                  
                  {selectedPaymentMethod === 'credit_card' && (
                    <div className="w-full">
                      <SquarePaymentForm
                        amount={getCartTotal() + (shippingRates && shippingRates[selectedShipping] ? shippingRates[selectedShipping].cost : 0)}
                        orderId={currentOrderId || undefined}
                        billingContact={currentFormData}
                        shippingContact={currentFormData}
                        onPaymentSuccessAction={handleSquarePaymentSuccess}
                        onPaymentErrorAction={handleSquarePaymentError}
                        isLoading={isSubmitting}
                      />
                    </div>
                  )}
                  
                  {selectedPaymentMethod !== 'credit_card' && (
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Place Order'}
                    </Button>
                  )}
                </div>
              </motion.div>
              </>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-md p-6 sticky top-24 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-white">Order Summary</h2>
              
              <div className="divide-y divide-gray-700">
                {cart.map((item: any) => (
                  <div key={item.id} className="py-3 flex justify-between">
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-white">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="font-medium text-white">${getCartTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-300">Shipping</span>
                  {shippingRates && shippingRates[selectedShipping] ? (
                    <span className="font-medium text-white">${shippingRates[selectedShipping].cost.toFixed(2)}</span>
                  ) : (
                    <span className="font-medium text-gray-400">TBD</span>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-300">Tax</span>
                  <span className="font-medium text-gray-400">$0.00</span>
                </div>
                
                <div className="border-t border-gray-700 pt-4 flex justify-between">
                  <span className="text-lg font-semibold text-white">Total</span>
                  <span className="text-lg font-bold text-lime-400">
                    ${(getCartTotal() + (shippingRates && shippingRates[selectedShipping] ? shippingRates[selectedShipping].cost : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}