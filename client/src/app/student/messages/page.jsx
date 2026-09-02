'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../services/api';
import ChatWindow from '../../../components/chat/ChatWindow';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';

function StudentMessagesContent() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const searchParams = useSearchParams();
  const activeConvParam = searchParams.get('conversation');
  const tutorIdParam = searchParams.get('tutorId');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.getConversations();
      if (res.success) {
        setConversations(res.conversations || []);
        return res.conversations || [];
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
    return [];
  }, []);

  useEffect(() => {
    const init = async () => {
      const convs = await fetchConversations();
      if (activeConvParam) {
        const found = convs.find(c => c.conversationId === activeConvParam);
        if (found) {
          setActiveConversation(found);
        } else if (tutorIdParam) {
          const tutorRes = await api.getTutorById(tutorIdParam).catch(() => null);
          if (tutorRes?.success) {
            setActiveConversation({
              conversationId: activeConvParam,
              partner: tutorRes.tutor.user
            });
          }
        }
      } else if (convs.length > 0) {
        setActiveConversation(convs[0]);
      }
      setLoading(false);
    };
    init();
  }, [activeConvParam, tutorIdParam, fetchConversations]);

  // Real-time socket sync for unread badges and new messages
  useEffect(() => {
    if (!socket) return;

    const handleUnreadUpdate = ({ totalUnread, conversationId: updatedConvId }) => {
      setConversations(prev =>
        prev.map(c =>
          c.conversationId === updatedConvId ? { ...c, unreadCount: 0 } : c
        )
      );
    };

    const handleNewMessage = (msg) => {
      fetchConversations();
    };

    socket.on('unread-count-updated', handleUnreadUpdate);
    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('unread-count-updated', handleUnreadUpdate);
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, fetchConversations]);

  // Select conversation and mark as seen
  const handleSelectConversation = (conv) => {
    setConversations(prev =>
      prev.map(c =>
        c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
    setActiveConversation(conv);
    if (socket && user) {
      socket.emit('mark-messages-seen', {
        conversationId: conv.conversationId,
        readerId: user._id || user.id
      });
    }
    setTimeout(() => fetchConversations(), 1200);
  };

  if (loading) return <LoadingSpinner text="Loading messages..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Sidebar: Conversations Threads List */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm h-[75vh] flex flex-col">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Messages &amp; Tutors</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">
                {conversations.length} Active
              </span>
            </h2>

            <div className="flex-1 overflow-y-auto space-y-1.5 mt-3">
              {conversations.length === 0 && !activeConversation ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No chat conversations yet.
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = activeConversation?.conversationId === conv.conversationId;
                  const partnerIdStr = conv.partner?._id ? conv.partner._id.toString() : '';
                  const isTutorOnline = partnerIdStr ? onlineUsers.some(id => id.toString() === partnerIdStr) : false;

                  return (
                    <button
                      key={conv.conversationId}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full p-3 rounded-2xl text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/90 border border-emerald-300/80 shadow-2xs'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {/* Avatar with Fiverr / Upwork style indicator */}
                      <div className="relative shrink-0">
                        <img
                          src={conv.partner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.partner?.name || 'T')}&background=059669&color=fff`}
                          alt={conv.partner?.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                        />
                        {isTutorOnline ? (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full ring-2 ring-emerald-500/20"
                            title="Online"
                          />
                        ) : (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-slate-300 border-2 border-white rounded-full"
                            title="Offline"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {conv.partner?.name}
                          </h4>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Fiverr / Upwork Presence Badge */}
                            {isTutorOnline ? (
                              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.2 rounded-full border border-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                <span>Online</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span>Offline</span>
                              </span>
                            )}

                            {conv.unreadCount > 0 && (
                              <span className="min-w-[18px] h-4 px-1.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {conv.lastMessage?.text || (conv.lastMessage?.voiceData ? '🎙️ Voice note' : 'Sent an offer')}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Main Chat Window */}
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
                <p className="font-bold text-slate-700 text-sm">Select a conversation</p>
                <p className="text-xs text-slate-400">Choose a tutor from the list to start messaging.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function StudentMessagesPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading messages..." />}>
      <StudentMessagesContent />
    </Suspense>
  );
}
