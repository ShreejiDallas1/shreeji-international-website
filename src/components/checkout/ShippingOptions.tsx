'use client';

import { FiTruck, FiZap, FiClock } from 'react-icons/fi';

interface ShippingOption {
  id: string;
  service: string;
  cost: number;
  estimatedDays: string;
  carrier: string;
}

interface ShippingOptionsProps {
  options: Record<string, ShippingOption>;
  selectedOption: string;
  onOptionChangeAction: (optionId: string) => void;

  loading?: boolean;
}

export default function ShippingOptions({
  options,
  selectedOption,
  onOptionChangeAction,
  loading
}: ShippingOptionsProps) {
  const getShippingIcon = (service: string) => {
    if (service.toLowerCase().includes('overnight')) return FiZap;
    if (service.toLowerCase().includes('express')) return FiClock;
    return FiTruck;
  };

  const getShippingBadge = (service: string, cost: number) => {
    if (cost === 0) return { text: 'FREE', color: 'bg-green-100 text-green-800' };
    if (service.toLowerCase().includes('overnight')) return { text: 'FASTEST', color: 'bg-red-100 text-red-800' };
    if (service.toLowerCase().includes('express')) return { text: 'FAST', color: 'bg-yellow-100 text-yellow-800' };
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Shipping Options</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Shipping Options</h3>
      
      <div className="grid gap-3">
        {Object.entries(options).map(([key, option]) => {
          const IconComponent = getShippingIcon(option.service);
          const badge = getShippingBadge(option.service, option.cost);
          
          return (
            <label
              key={key}
              className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedOption === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="shipping_option"
                value={key}
                checked={selectedOption === key}
                onChange={(e) => onOptionChangeAction(e.target.value)}
                className="sr-only"
              />
              
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    selectedOption === key ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      selectedOption === key ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900 flex items-center">
                      {option.service}
                      {badge && (
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
                          {badge.text}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <span>{option.estimatedDays}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span>{option.carrier}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ${option.cost.toFixed(2)}
                    </div>
                  </div>
                  
                  {selectedOption === key && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {/* Shipping Notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="text-sm text-blue-800">
          <strong>💡 Pro Tip:</strong> Orders placed before 2 PM EST ship the same day!
        </div>
      </div>
    </div>
  );
}