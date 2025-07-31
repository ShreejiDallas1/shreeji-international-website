'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Button from '@/components/Button';

export default function PasswordResetTestPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testPasswordReset = async () => {
    if (!email) {
      setResult('Please enter an email');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      console.log('Testing verification code system for:', email);
      
      // Test via API route to ensure it works in production
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          type: 'verification-code'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setResult('✅ SUCCESS: Verification code sent successfully! Check your email inbox.');
      } else {
        setResult(`❌ ERROR: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Password reset test error:', error);
      setResult(`❌ ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testEmailConfig = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          type: 'config-test'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setResult('✅ SUCCESS: Email configuration is working correctly!');
      } else {
        setResult(`❌ ERROR: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Email config test error:', error);
      setResult(`❌ ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!email) {
      setResult('Please enter an email');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          type: 'send-test'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setResult('✅ SUCCESS: Test email sent successfully! Check your inbox.');
      } else {
        setResult(`❌ ERROR: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Test email error:', error);
      setResult(`❌ ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-6">Verification Code System Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Test Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
              placeholder="Enter email to test"
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={testEmailConfig}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Email Configuration'}
            </Button>

            <Button
              onClick={sendTestEmail}
              disabled={loading || !email}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Test Email'}
            </Button>

            <Button
              onClick={testPasswordReset}
              disabled={loading || !email}
              variant="primary"
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </div>

          {result && (
            <div className={`p-4 rounded-md ${
              result.includes('SUCCESS') 
                ? 'bg-green-900 text-green-200 border border-green-500' 
                : 'bg-red-900 text-red-200 border border-red-500'
            }`}>
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-700 rounded-md border border-gray-600">
            <h3 className="text-lg font-medium text-white mb-2">Debug Info:</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <div>App URL: {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</div>
              <div>Current URL: {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</div>
              <div>Firebase Project: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</div>
              <div>Email Host: {process.env.EMAIL_HOST || 'Not configured'}</div>
              <div>Email User: {process.env.EMAIL_USER || 'Not configured'}</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-900 text-yellow-200 rounded-md border border-yellow-500">
            <h4 className="font-medium mb-2">📧 Email Setup Required:</h4>
            <div className="text-sm space-y-2">
              <p>To send real emails, update your <code>.env.local</code> file:</p>
              <div className="bg-yellow-800 p-2 rounded text-xs font-mono">
                EMAIL_USER=your-gmail@gmail.com<br/>
                EMAIL_PASS=your-app-password<br/>
                EMAIL_FROM=Shreeji International &lt;noreply@shreejimalta.com&gt;
              </div>
              <p className="text-xs">
                <strong>Gmail Setup:</strong> Enable 2FA and create an App Password in your Google Account settings.
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-900 text-blue-200 rounded-md border border-blue-500">
            <h4 className="font-medium mb-2">Test Instructions:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li><strong>Test Email Configuration:</strong> Check if email server is working</li>
              <li><strong>Send Test Email:</strong> Send a simple test email to verify delivery</li>
              <li><strong>Send Verification Code:</strong> Test the full verification code system</li>
              <li>Check your email inbox for the professional verification code email</li>
              <li>Go to /auth/forgot-password to test the complete user flow</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}