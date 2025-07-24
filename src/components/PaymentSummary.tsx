'use client';

import { useState, useEffect } from 'react';
import { FiCreditCard, FiCheckCircle, FiAlertCircle, FiExternalLink } from 'react-icons/fi';

interface PaymentSummaryProps {
  paymentId: string;
  onClose?: () => void;
}

interface PaymentDetails {
  id: string;
  status: string;
  amount: number;
  currency: string;
  sourceType: string;
  orderId?: string;
  receiptUrl?: string;
  receiptNumber?: string;
  createdAt: string;
  cardDetails?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    cardholderName?: string;
  };
  processingFee: Array<{
    amount: number;
    currency: string;
    type: string;
  }>;
}

export default function PaymentSummary({ paymentId, onClose }: PaymentSummaryProps) {
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`/api/payments/status/${paymentId}`);
        const result = await response.json();

        if (result.success) {
          setPayment(result.payment);
        } else {
          setError(result.error || 'Failed to fetch payment details');
        }
      } catch (err) {
        setError('Failed to fetch payment details');
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading payment details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center text-red-600 mb-4">
            <FiAlertCircle className="text-xl mr-3" />
            <h2 className="text-lg font-semibold">Payment Error</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!payment) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'FAILED':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <FiCheckCircle className="text-green-600" />;
      case 'FAILED':
        return <FiAlertCircle className="text-red-600" />;
      default:
        return <FiCreditCard className="text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {getStatusIcon(payment.status)}
              <h2 className="text-xl font-bold text-gray-800 ml-3">Payment Receipt</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Status */}
          <div className={`p-3 rounded-lg border mb-6 ${getStatusColor(payment.status)}`}>
            <div className="font-medium">
              Payment {payment.status.charAt(0) + payment.status.slice(1).toLowerCase()}
            </div>
            {payment.receiptNumber && (
              <div className="text-sm mt-1">Receipt #{payment.receiptNumber}</div>
            )}
          </div>

          {/* Amount */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">
                ${payment.amount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">{payment.currency}</div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="text-sm font-medium text-gray-700">Payment ID</div>
              <div className="text-sm text-gray-600 font-mono break-all">{payment.id}</div>
            </div>

            {payment.orderId && (
              <div>
                <div className="text-sm font-medium text-gray-700">Order ID</div>
                <div className="text-sm text-gray-600">{payment.orderId}</div>
              </div>
            )}

            <div>
              <div className="text-sm font-medium text-gray-700">Payment Method</div>
              <div className="text-sm text-gray-600 capitalize">
                {payment.sourceType.replace('_', ' ')}
              </div>
            </div>

            {payment.cardDetails && (
              <div>
                <div className="text-sm font-medium text-gray-700">Card Details</div>
                <div className="text-sm text-gray-600">
                  {payment.cardDetails.brand} •••• {payment.cardDetails.last4}
                  <div className="text-xs text-gray-500">
                    Expires {payment.cardDetails.expMonth}/{payment.cardDetails.expYear}
                  </div>
                  {payment.cardDetails.cardholderName && (
                    <div className="text-xs text-gray-500">
                      {payment.cardDetails.cardholderName}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <div className="text-sm font-medium text-gray-700">Transaction Date</div>
              <div className="text-sm text-gray-600">
                {new Date(payment.createdAt).toLocaleString()}
              </div>
            </div>

            {payment.processingFee.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700">Processing Fees</div>
                {payment.processingFee.map((fee, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    ${fee.amount.toFixed(2)} ({fee.type})
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {payment.receiptUrl && (
              <a
                href={payment.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FiExternalLink className="mr-2" />
                View Official Receipt
              </a>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}