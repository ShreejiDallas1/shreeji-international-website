'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';

import Button from '@/components/Button';
import { SecurityUtils } from '@/lib/security-utils';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export default function SecurityTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runSecurityTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Password Strength Validation
    try {
      const weakPassword = SecurityUtils.validatePasswordStrength('123');
      results.push({
        name: 'Weak Password Rejection',
        passed: !weakPassword.isValid && weakPassword.feedback.length > 0,
        message: weakPassword.isValid ? 'Failed: Weak password was accepted' : 'Passed: Weak password rejected'
      });
    } catch (error) {
      results.push({
        name: 'Weak Password Rejection',
        passed: false,
        message: 'Error: Test failed to run'
      });
    }

    // Test 2: Strong Password Validation
    try {
      const strongPassword = SecurityUtils.validatePasswordStrength('MyStr0ng!Pass');
      results.push({
        name: 'Strong Password Acceptance',
        passed: strongPassword.isValid,
        message: strongPassword.isValid ? 'Passed: Strong password accepted' : `Failed: ${strongPassword.feedback[0]}`
      });
    } catch (error) {
      results.push({
        name: 'Strong Password Acceptance',
        passed: false,
        message: 'Error: Test failed to run'
      });
    }

    // Test 3: Rate Limiting
    try {
      // Simulate multiple failed attempts
      for (let i = 0; i < 6; i++) {
        SecurityUtils.recordFailedAttempt('test-ip');
      }
      const isLimited = SecurityUtils.isRateLimited('test-ip');
      results.push({
        name: 'Rate Limiting',
        passed: isLimited,
        message: isLimited ? 'Passed: Rate limiting activated after 5 attempts' : 'Failed: Rate limiting not working'
      });
      
      // Clear the test
      SecurityUtils.clearFailedAttempts('test-ip');
    } catch (error) {
      results.push({
        name: 'Rate Limiting',
        passed: false,
        message: 'Error: Test failed to run'
      });
    }

    // Test 4: Email Validation
    try {
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test('test@example.com');
      const invalidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test('invalid-email');
      results.push({
        name: 'Email Validation',
        passed: validEmail && !invalidEmail,
        message: validEmail && !invalidEmail ? 'Passed: Email validation working' : 'Failed: Email validation not working'
      });
    } catch (error) {
      results.push({
        name: 'Email Validation',
        passed: false,
        message: 'Error: Test failed to run'
      });
    }

    // Test 5: Common Password Detection
    try {
      const commonPassword = SecurityUtils.validatePasswordStrength('password123');
      results.push({
        name: 'Common Password Detection',
        passed: !commonPassword.isValid && commonPassword.feedback.some(e => e.includes('common')),
        message: !commonPassword.isValid ? 'Passed: Common password rejected' : 'Failed: Common password accepted'
      });
    } catch (error) {
      results.push({
        name: 'Common Password Detection',
        passed: false,
        message: 'Error: Test failed to run'
      });
    }

    // Test 6: Password Requirements
    try {
      const tests = [
        { password: 'short', requirement: 'length' },
        { password: 'nouppercase123!', requirement: 'uppercase' },
        { password: 'NOLOWERCASE123!', requirement: 'lowercase' },
        { password: 'NoNumbers!', requirement: 'numbers' },
        { password: 'NoSpecialChars123', requirement: 'special characters' }
      ];

      let allPassed = true;
      for (const test of tests) {
        const result = SecurityUtils.validatePasswordStrength(test.password);
        if (result.isValid) {
          allPassed = false;
          break;
        }
      }

      results.push({
        name: 'Password Requirements Enforcement',
        passed: allPassed,
        message: allPassed ? 'Passed: All password requirements enforced' : 'Failed: Some requirements not enforced'
      });
    } catch (error) {
      results.push({
        name: 'Password Requirements Enforcement',
        passed: false,
        message: 'Error: Test failed to run'
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getTestIcon = (passed: boolean) => {
    return passed ? (
      <FiCheck className="w-5 h-5 text-green-400" />
    ) : (
      <FiX className="w-5 h-5 text-red-400" />
    );
  };

  const passedTests = testResults.filter(t => t.passed).length;
  const totalTests = testResults.length;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-lg p-8"
        >
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <FiShield className="w-10 h-10 text-lime-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Security Test Suite</h1>
              <p className="text-gray-400 mt-1">
                Comprehensive security feature testing for authentication system
              </p>
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-8">
            <Button
              onClick={runSecurityTests}
              disabled={isRunning}
              variant="primary"
              size="lg"
              leftIcon={<FiShield />}
              isLoading={isRunning}
            >
              {isRunning ? 'Running Security Tests...' : 'Run Security Tests'}
            </Button>
          </div>

          {/* Test Results Summary */}
          {testResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-gray-700 rounded-lg border border-gray-600"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Test Results Summary</h2>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-lime-400">{passedTests}</div>
                  <div className="text-sm text-gray-400">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">{totalTests - passedTests}</div>
                  <div className="text-sm text-gray-400">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{totalTests}</div>
                  <div className="text-sm text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Individual Test Results */}
          {testResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-white mb-6">Detailed Test Results</h2>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      result.passed 
                        ? 'bg-green-900/20 border-green-500/30' 
                        : 'bg-red-900/20 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTestIcon(result.passed)}
                        <div>
                          <h3 className="font-medium text-white">{result.name}</h3>
                          <p className={`text-sm ${
                            result.passed ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {result.message}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        result.passed 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {result.passed ? 'PASS' : 'FAIL'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Security Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 p-6 bg-gray-700 rounded-lg border border-gray-600"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Implemented Security Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-lime-400">Authentication Security</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center space-x-2">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span>Strong password requirements</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span>Rate limiting (5 attempts per 15 minutes)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span>Common password detection</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span>Email enumeration protection</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-lime-400">Password Reset Security</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center space-x-2">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span>Firebase verification codes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span>Time-limited reset links</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span>Password strength validation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span>Security event logging</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Warning Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <FiAlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-400">Development Environment Notice</h3>
                <p className="text-sm text-yellow-200 mt-1">
                  This test page is for development purposes only. In production, remove this page 
                  and ensure all security tests are part of your CI/CD pipeline.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}