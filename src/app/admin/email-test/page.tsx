"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Check, X, TestTube } from "lucide-react";

export default function EmailTestPage() {
  const [testResult, setTestResult] = useState<{
    type: 'success' | 'error' | 'loading' | null;
    message: string;
  }>({ type: null, message: '' });

  const [orderTestData, setOrderTestData] = useState({
    customerEmail: 'test@example.com',
    customerName: 'Test Customer',
  });

  const testEmailConnection = async () => {
    setTestResult({ type: 'loading', message: 'Testing email connection...' });
    
    try {
      const response = await fetch('/api/email/send', {
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTestResult({ type: 'success', message: 'Email connection successful!' });
      } else {
        setTestResult({ type: 'error', message: data.error || 'Connection failed' });
      }
    } catch (error) {
      setTestResult({ type: 'error', message: 'Network error: ' + error });
    }
  };

  const testOrderEmail = async () => {
    setTestResult({ type: 'loading', message: 'Sending test order email...' });
    
    const mockOrderData = {
      orderNumber: `TEST-${Date.now()}`,
      customerName: orderTestData.customerName,
      customerEmail: orderTestData.customerEmail,
      total: 850,
      items: [
        {
          name: 'খেজুর বাদাম হালুয়া',
          quantity: 2,
          price: 350,
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300',
        },
        {
          name: 'তিলের লাড্ডু',
          quantity: 1,
          price: 150,
          image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=300',
        },
      ],
      shippingAddress: {
        fullName: orderTestData.customerName,
        street: '১২৩ মেইন স্ট্রিট',
        area: 'ধানমন্ডি',
        city: 'ঢাকা',
        phone: '+৮৮০১৭১১১২৩৪৫৬',
      },
      paymentMethod: 'SSL Commerce',
      orderDate: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'order_confirmation',
          data: mockOrderData,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTestResult({ type: 'success', message: 'Test order email sent successfully!' });
      } else {
        setTestResult({ type: 'error', message: data.error || 'Failed to send email' });
      }
    } catch (error) {
      setTestResult({ type: 'error', message: 'Network error: ' + error });
    }
  };

  const testPasswordResetEmail = async () => {
    setTestResult({ type: 'loading', message: 'Sending test password reset email...' });
    
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'password_reset',
          data: {
            email: orderTestData.customerEmail,
            resetToken: 'test-token-' + Date.now(),
          },
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTestResult({ type: 'success', message: 'Test password reset email sent successfully!' });
      } else {
        setTestResult({ type: 'error', message: data.error || 'Failed to send email' });
      }
    } catch (error) {
      setTestResult({ type: 'error', message: 'Network error: ' + error });
    }
  };

  const testNewsletterEmail = async () => {
    setTestResult({ type: 'loading', message: 'Sending test newsletter email...' });
    
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'newsletter_welcome',
          data: {
            email: orderTestData.customerEmail,
            name: orderTestData.customerName,
          },
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTestResult({ type: 'success', message: 'Test newsletter email sent successfully!' });
      } else {
        setTestResult({ type: 'error', message: data.error || 'Failed to send email' });
      }
    } catch (error) {
      setTestResult({ type: 'error', message: 'Network error: ' + error });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email System Test</h1>
        <p className="text-gray-600">Test the email notification system functionality</p>
      </div>

      {/* Test Results */}
      {testResult.type && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className={`flex items-center gap-3 p-4 rounded-lg ${
              testResult.type === 'success' ? 'bg-green-50 text-green-800' :
              testResult.type === 'error' ? 'bg-red-50 text-red-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              {testResult.type === 'success' && <Check className="h-5 w-5" />}
              {testResult.type === 'error' && <X className="h-5 w-5" />}
              {testResult.type === 'loading' && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
              )}
              <span>{testResult.message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Connection Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Email Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Test if the email server connection is working properly.
          </p>
          <Button onClick={testEmailConnection} className="w-full">
            <Mail className="mr-2 h-4 w-4" />
            Test Email Connection
          </Button>
        </CardContent>
      </Card>

      {/* Test Email Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Email Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Email Address
            </label>
            <Input
              type="email"
              value={orderTestData.customerEmail}
              onChange={(e) => setOrderTestData({ ...orderTestData, customerEmail: e.target.value })}
              placeholder="Enter email to receive test emails"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Customer Name
            </label>
            <Input
              value={orderTestData.customerName}
              onChange={(e) => setOrderTestData({ ...orderTestData, customerName: e.target.value })}
              placeholder="Enter test customer name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Type Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Order Confirmation Email Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Order Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Test order confirmation email with mock data.
            </p>
            <Button onClick={testOrderEmail} className="w-full">
              Send Test Order Email
            </Button>
          </CardContent>
        </Card>

        {/* Password Reset Email Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Password Reset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Test password reset email functionality.
            </p>
            <Button onClick={testPasswordResetEmail} className="w-full">
              Send Test Reset Email
            </Button>
          </CardContent>
        </Card>

        {/* Newsletter Email Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Newsletter Welcome
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Test newsletter welcome email.
            </p>
            <Button onClick={testNewsletterEmail} className="w-full">
              Send Test Newsletter Email
            </Button>
          </CardContent>
        </Card>

        {/* Email Configuration Info */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>SMTP Host:</strong> {process.env.NEXT_PUBLIC_SMTP_HOST || 'Not configured'}</div>
              <div><strong>From Email:</strong> {process.env.NEXT_PUBLIC_SMTP_FROM || 'Not configured'}</div>
              <div><strong>Site Name:</strong> {process.env.NEXT_PUBLIC_SITE_NAME || 'PureBite'}</div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Make sure to configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM in your environment variables.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Environment Setup Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Environment Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Add these environment variables to your .env.local file:</p>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
            <div>SMTP_HOST=smtp.gmail.com</div>
            <div>SMTP_PORT=587</div>
            <div>SMTP_USER=your-email@gmail.com</div>
            <div>SMTP_PASSWORD=your-app-password</div>
            <div>SMTP_FROM=your-email@gmail.com</div>
            <div>SITE_NAME=PureBite</div>
            <div>ADMIN_EMAIL=admin@purebite.com</div>
            <div>SUPPORT_EMAIL=support@purebite.com</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            For Gmail, use App Password instead of your regular password.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}