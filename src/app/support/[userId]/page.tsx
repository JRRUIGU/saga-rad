'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Coffee, Wallet, Building2, CreditCard } from 'lucide-react';

interface Author {
  user_id: number;
  name: string;
  paypal_email: string | null;
  mpesa_number: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_name: string | null;
}

export default function SupportAuthorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  const workId = searchParams.get('workId');
  
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<string>('5');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchAuthorInfo();
    }
  }, [userId]);

  const fetchAuthorInfo = async () => {
    try {
      const response = await fetch(`/api/support/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setAuthor(data.author);
        // Auto-select first available method
        if (data.author.paypal_email) setSelectedMethod('paypal');
        else if (data.author.mpesa_number) setSelectedMethod('mpesa');
        else if (data.author.bank_account_number) setSelectedMethod('bank');
      }
    } catch (error) {
      console.error('Error fetching author info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = () => {
    if (!selectedMethod || !amount) return;
    setShowPaymentForm(true);
  };

  const getAvailableMethods = () => {
    if (!author) return [];
    const methods = [];
    if (author.paypal_email) methods.push({ id: 'paypal', name: 'PayPal', icon: CreditCard, color: 'bg-blue-500' });
    if (author.mpesa_number) methods.push({ id: 'mpesa', name: 'M-Pesa', icon: Wallet, color: 'bg-green-500' });
    if (author.bank_account_number) methods.push({ id: 'bank', name: 'Bank Transfer', icon: Building2, color: 'bg-purple-500' });
    return methods;
  };

  const renderPaymentForm = () => {
    if (!author) return null;

    switch (selectedMethod) {
      case 'paypal':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">You will be redirected to PayPal to complete your donation of ${amount}</p>
              <p className="text-xs text-blue-600">PayPal Email: {author.paypal_email}</p>
            </div>
            <a 
              href={`https://www.paypal.com/paypalme/${author.paypal_email}/${amount}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard size={20} />
              Continue to PayPal
            </a>
          </div>
        );

      case 'mpesa':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 mb-2">Send ${amount} via M-Pesa to:</p>
              <p className="text-lg font-bold text-green-900">{author.mpesa_number}</p>
              <p className="text-xs text-green-600 mt-2">After sending, click confirm below</p>
            </div>
            <button 
              onClick={() => alert('Thank you! The author has been notified of your support.')}
              className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
            >
              <Wallet size={20} />
              I've Sent the Money
            </button>
          </div>
        );

      case 'bank':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800 mb-3">Transfer ${amount} to:</p>
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold">Bank:</span> {author.bank_name}</p>
                <p><span className="font-semibold">Account Name:</span> {author.bank_account_name}</p>
                <p><span className="font-semibold">Account Number:</span> {author.bank_account_number}</p>
              </div>
            </div>
            <button 
              onClick={() => alert('Thank you! Please email receipt to the author.')}
              className="w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all flex items-center justify-center gap-2"
            >
              <Building2 size={20} />
              I've Made the Transfer
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">😕</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Author not found</h3>
          <Link href="/manga" className="text-blue-600 hover:underline">
            Back to Manga
          </Link>
        </div>
      </div>
    );
  }

  const availableMethods = getAvailableMethods();

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support {author.name}</h1>
          <p className="text-gray-600">Choose how you'd like to support this creator</p>
        </div>

        {availableMethods.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-300 text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment methods not set up</h3>
            <p className="text-gray-600">This author hasn't added any payment methods yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount Selection */}
            {!showPaymentForm && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-300">
                  <label className="block text-sm font-semibold text-gray-900 mb-4">
                    Select Amount (USD)
                  </label>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {['1', '5', '10', '20'].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setAmount(amt)}
                        className={`py-3 rounded-lg font-semibold transition-all ${
                          amount === amt 
                            ? 'bg-black text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Custom amount"
                      min="1"
                    />
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-xl p-6 border border-gray-300">
                  <label className="block text-sm font-semibold text-gray-900 mb-4">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    {availableMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                          selectedMethod === method.id
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center text-white`}>
                          <method.icon size={24} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-500">
                            {method.id === 'paypal' && 'Fast & Secure'}
                            {method.id === 'mpesa' && 'Mobile Money'}
                            {method.id === 'bank' && 'Direct Transfer'}
                          </p>
                        </div>
                        {selectedMethod === method.id && (
                          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Support Button */}
                <button
                  onClick={handleSupport}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Coffee size={24} />
                  Support ${amount}
                </button>
              </>
            )}

            {/* Payment Form */}
            {showPaymentForm && (
              <div className="bg-white rounded-xl p-6 border border-gray-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Complete Your Support</h3>
                  <button 
                    onClick={() => setShowPaymentForm(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Change Amount
                  </button>
                </div>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Amount: <span className="font-bold text-gray-900">${amount}</span></p>
                  <p className="text-sm text-gray-600">Method: <span className="font-bold text-gray-900 capitalize">{selectedMethod}</span></p>
                </div>
                {renderPaymentForm()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}