'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { accounts, contacts, getFavoriteContacts } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Send, Search, Star, Clock, ChevronRight, Zap, CheckCircle } from 'lucide-react';

export default function TransfersPage() {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const favoriteContacts = getFavoriteContacts();
  const checkingAccount = accounts.find((a) => a.type === 'checking');

  const handleTransfer = () => {
    setShowConfirmation(true);
    // Reset after 3 seconds
    setTimeout(() => {
      setShowConfirmation(false);
      setSelectedContact(null);
      setAmount('');
      setMemo('');
    }, 3000);
  };

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Send Money</h1>
          <p className="text-gray-500 mt-1">Transfer funds to friends, family, or other accounts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transfer Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* From Account */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">From Account</h3>
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{checkingAccount?.name}</p>
                  <p className="text-sm text-gray-500">{checkingAccount?.accountNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(checkingAccount?.availableBalance ?? 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* To Contact */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">To</h3>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts or enter email..."
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Favorites */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <Star className="w-4 h-4" /> Favorites
                </p>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {favoriteContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedContact(contact.id)}
                      className={`flex flex-col items-center p-3 rounded-lg transition-all min-w-[80px] ${
                        selectedContact === contact.id
                          ? 'bg-indigo-100 ring-2 ring-indigo-500'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {contact.name.charAt(0)}
                      </div>
                      <p className="mt-2 text-sm font-medium text-gray-900 text-center truncate w-full">
                        {contact.name.split(' ')[0]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* All Contacts */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">All Contacts</p>
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedContact(contact.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        selectedContact === contact.id
                          ? 'bg-indigo-100 ring-2 ring-indigo-500'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      </div>
                      {contact.isFavorite && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Amount & Memo */}
            {selectedContact && (
              <div className="bg-white rounded-xl border shadow-sm p-6 animate-fade-in">
                <h3 className="font-semibold text-gray-900 mb-4">Amount & Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">
                        $
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-4 text-2xl font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Memo (optional)
                    </label>
                    <input
                      type="text"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="What's this for?"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    onClick={handleTransfer}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Send Money Instantly
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500" />
                Instant Transfers
              </h3>
              <p className="text-sm text-gray-600">
                Money arrives in seconds, 24/7. No fees for transfers to contacts using AgentBank.
              </p>
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm font-medium text-indigo-700">
                  Nova is standing by to help with any transfer questions!
                </p>
              </div>
            </div>

            {/* Recent Transfers */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Recent Transfers
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                    S
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Sarah Chen</p>
                    <p className="text-sm text-gray-500">Jan 15</p>
                  </div>
                  <p className="font-medium text-gray-900">-$50.00</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                    M
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Michael R.</p>
                    <p className="text-sm text-gray-500">Jan 10</p>
                  </div>
                  <p className="font-medium text-gray-900">-$120.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 animate-fade-in text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">Transfer Complete!</h2>
              <p className="mt-2 text-gray-600">
                ${amount} has been sent to{' '}
                {contacts.find((c) => c.id === selectedContact)?.name}
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Transaction ID: TXN-{Date.now().toString().slice(-8)}
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
