'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../services/api';
import ChatWindow from '../../../components/chat/ChatWindow';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';

function TutorMessagesContent() {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const searchParams = useSearchParams();
  const activeConvParam = searchParams.get('conversation');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.getConversations();
      if (res.success) {
        setConversations(res.conversations);
        return res.conversations;
      }
    } catch (err) {
      console.error('Error fetching tutor conversations:', err);
    }
    return [];
  }, []);

  useEffect(() => {
    const init = async () => {
      const convs = await fetchConversations();
      if (activeConvParam) {
        const found = convs.find(c => c.conversationId === activeConvParam);
        if (found) setActiveConversation(found);
      } else if (convs.length > 0) {
        setActiveConversation(convs[0]);
      }
      setLoading(false);
    };
    init();
  }, [activeConvParam, fetchConversations]);

  // Optimistically clear unread, then re-fetch after backend marks as read
  const handleSelectConversation = async (conv) => {
    setConversations(prev =>
      prev.map(c =>
        c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
    setActiveConversation(conv);
    setTimeout(() => fetchConversations(), 1500);
  };

  if (loading) return <LoadingSpinner text="Loading messages..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm h-[75vh] flex flex-col">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Student Inquiries &amp; Deals</span>
            </h2>

            <div className="flex-1 overflow-y-auto space-y-1.5 mt-3">
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No active student chats yet.
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = activeConversation?.conversationId === conv.conversationId;
                  const isStudentOnline = conv.partner?._id && onlineUsers.includes(conv.partner._id);
                  return (
                    <button
                      key={conv.conversationId}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full p-3 rounded-2xl text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-emerald-50 border border-emerald-200'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Avatar with online dot */}
                      <div className="relative shrink-0">
                        <img
                          src={conv.partner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.partner?.name || 'S')}&background=059669&color=fff`}
                          alt={conv.partner?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {isStudentOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {conv.partner?.name}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            {isStudentOnline && (
                              <span className="text-[9px] font-bold text-emerald-600">Online</span>
                            )}
                            {conv.unreadCount > 0 && (
                              <span className="min-w-[16px] h-4 px-1 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
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

          {/* Chat Panel */}
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
