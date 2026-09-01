'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../services/api';
import ChatWindow from '../../../components/chat/ChatWindow';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

function TutorMessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const activeConvParam = searchParams.get('conversation');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.getConversations();
        if (res.success) {
          setConversations(res.conversations);
          if (activeConvParam) {
            const found = res.conversations.find(c => c.conversationId === activeConvParam);
            if (found) setActiveConversation(found);
          } else if (res.conversations.length > 0) {
            setActiveConversation(res.conversations[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching tutor conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [activeConvParam]);

  if (loading) return <LoadingSpinner text="Loading messages..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm h-[75vh] flex flex-col">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Student Inquiries & Deals</span>
            </h2>

            <div className="flex-1 overflow-y-auto space-y-1.5 mt-3">
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No active student chats yet.
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = activeConversation?.conversationId === conv.conversationId;
                  return (
                    <button
                      key={conv.conversationId}
                      onClick={() => setActiveConversation(conv)}
                      className={`w-full p-3 rounded-2xl text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-emerald-50 border border-emerald-200'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={conv.partner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.partner?.name || 'S')}&background=059669&color=fff`}
                        alt={conv.partner?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {conv.partner?.name}
                          </h4>
                          {conv.unreadCount > 0 && (
                            <span className="w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {conv.lastMessage?.text || 'Offer sent'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-8">
            {activeConversation ? (
              <ChatWindow
                conversationId={activeConversation.conversationId}
                partner={activeConversation.partner}
                initialDeal={activeConversation.deal}
              />
            ) : (
              <div className="h-[75vh] bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 text-slate-200 mb-2" />
                <p className="font-bold text-slate-700 text-sm">No conversation selected</p>
                <p className="text-xs text-slate-400">Select a student inquiry to respond or send a deal offer.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function TutorMessagesPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading messages..." />}>
      <TutorMessagesContent />
    </Suspense>
  );
}

