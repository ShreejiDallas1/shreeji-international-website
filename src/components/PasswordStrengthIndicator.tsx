'use client';

import { useMemo } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const requirements: PasswordRequirement[] = [
    {
      label: 'At least 8 characters',
      test: (p: string) => p.length >= 8
    },
    {
      label: 'One uppercase letter (A-Z)',
      test: (p: string) => /[A-Z]/.test(p)
    },
    {
      label: 'One lowercase letter (a-z)',
      test: (p: string) => /[a-z]/.test(p)
    },
    {
      label: 'One number (0-9)',
      test: (p: string) => /\d/.test(p)
    },
    {
      label: 'One special character (!@#$%^&*)',
      test: (p: string) => /[!@#$%^&*]/.test(p)
    }
  ];

  const { strength, metRequirements, strengthLabel, strengthColor } = useMemo(() => {
    const met = requirements.filter(req => req.test(password));
    const strengthValue = met.length / requirements.length;
    
    let label = '';
    let color = '';
    
    if (strengthValue === 0) {
      label = '';
      color = '';
    } else if (strengthValue < 0.4) {
      label = 'Weak';
      color = 'text-red-400';
    } else if (strengthValue < 0.8) {
      label = 'Medium';
      color = 'text-yellow-400';
    } else {
      label = 'Strong';
      color = 'text-green-400';
    }
    
    return {
      strength: strengthValue,
      metRequirements: met.length,
      strengthLabel: label,
      strengthColor: color
    };
  }, [password, requirements]);

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Password Strength</span>
          {strengthLabel && (
            <span className={`text-xs font-medium ${strengthColor}`}>
              {strengthLabel}
            </span>
          )}
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              strength < 0.4 
                ? 'bg-red-500' 
                : strength < 0.8 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
            }`}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        <span className="text-xs text-gray-400">
          Requirements ({metRequirements}/{requirements.length})
        </span>
        <div className="space-y-1">
          {requirements.map((requirement, index) => {
            const isMet = requirement.test(password);
            return (
              <div key={index} className="flex items-center space-x-2">
                <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                  isMet 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-600 text-gray-400'
                }`}>
                  {isMet ? (
                    <FiCheck className="w-3 h-3" />
                  ) : (
                    <FiX className="w-3 h-3" />
                  )}
                </div>
                <span className={`text-xs ${
                  isMet ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {requirement.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}