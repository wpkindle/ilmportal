'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import TrialBanner from '../../../components/common/TrialBanner';
import TutorPaymentModal from '../../../components/tutor/TutorPaymentModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { BookOpen, MessageSquare, Plus, Video } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function TutorDealsPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDealForPay, setSelectedDealForPay] = useState(null);

  const fetchDeals = async () => {
    try {
      const res = await api.getMyDeals();
      if (res.success) setDeals(res.deals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  if (loading) return <LoadingSpinner text="Loading deals..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Student Deals & Trial Monitoring</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review active student courses, trial durations, and verified fee payments.
            </p>
          </div>

          <Link
            href="/tutor/messages"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Send New Course Offer</span>
          </Link>
        </div>

        {deals.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/90 text-center text-xs text-slate-400">
            No deals currently active. Open messages to compose a course offer for an interested student.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {deals.map((deal) => (
              <div key={deal._id} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={deal.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(deal.student?.name || 'S')}&background=059669&color=fff`}
                      alt="Student"
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{deal.subject}</h3>
                      <p className="text-xs text-slate-500">
                        Student: <strong>{deal.student?.name}</strong> ({deal.student?.city || 'Pakistan'}) &bull; PKR {deal.price?.toLocaleString()} / {deal.priceUnit === 'per_hour' ? 'hr' : 'mo'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {deal.mode !== 'in_person' && ['active_trial', 'continuation_agreed', 'active_paid'].includes(deal.status) && !deal.accessRestricted && (
                      <Link
                        href={`/classroom/${[user?.id || user?._id, deal.student?._id].sort().join('_')}`}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Live Class</span>
                      </Link>
                    )}
                    <Link
                      href={`/tutor/messages?conversation=${[user?.id || user?._id, deal.student?._id].sort().join('_')}`}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Open Chat</span>
                    </Link>
                  </div>
                </div>

                <TrialBanner
                  deal={deal}
                  onPayClick={() => setSelectedDealForPay(deal)}
                />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Tutor Platform Fee Payment Proof Modal */}
      {selectedDealForPay && (
        <TutorPaymentModal
          deal={selectedDealForPay}
          isOpen={!!selectedDealForPay}
          onClose={() => setSelectedDealForPay(null)}
          onSuccess={fetchDeals}
        />
      )}
    </div>
  );
}

