'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../services/api';
import ChatWindow from '../../../components/chat/ChatWindow';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import { soundEngine } from '../../../utils/soundEffects';
import { showNativeNotification } from '../../../utils/notificationManager';

function StudentMessagesContent() {
  const { user } = useAuth();
  const { socket, onlineStatusMap } = useSocket();
  const searchParams = useSearchParams();
  const activeConvParam = searchParams.get('conversation');
  const tutorIdParam = searchParams.get('tutorId');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  // Mobile navigation: 'list' shows sidebar, 'chat' shows chat window
  const [mobileView, setMobileView] = useState('list');

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
          setMobileView('chat');
        } else if (tutorIdParam) {
          const tutorRes = await api.getTutorById(tutorIdParam).catch(() => null);
          if (tutorRes?.success) {
            setActiveConversation({
              conversationId: activeConvParam,
              partner: tutorRes.tutor.user
            });
            setMobileView('chat');
          }
        }
      }
      // Do NOT auto-select any conversation — wait for explicit user click
      setLoading(false);
    };
    init();
  }, [activeConvParam, tutorIdParam, fetchConversations]);

  // Real-time socket sync for unread badges and new messages
  useEffect(() => {
    if (!socket) return;

    const handleUnreadUpdate = ({ conversationId: updatedConvId }) => {
      setConversations(prev =>
        prev.map(c =>
          c.conversationId === updatedConvId ? { ...c, unreadCount: 0 } : c
        )
      );
    };

    const handleNewMessage = (msg) => {
      fetchConversations();
      const currentUserId = (user?._id || user?.id)?.toString();
      const senderId = (msg?.sender?._id || msg?.sender)?.toString();
      if (currentUserId && senderId && senderId !== currentUserId) {
        if (msg?.conversationId !== activeConversation?.conversationId) {
          soundEngine.playMessageSound();
          showNativeNotification({
            title: `${msg?.sender?.name || 'New Message'}`,
            body: msg?.text || (msg?.voiceData ? 'Sent a voice note' : 'Sent an update'),
            // Always use local PNG — external avatar URLs are CORS-blocked as notification icons on Windows 11
            icon: '/icon.png',
            url: `/student/messages?conversation=${msg?.conversationId}`,
            tag: `msg-${msg?._id}`,
            soundType: 'none'
          });
        }
      }
    };

    socket.on('unread-count-updated', handleUnreadUpdate);
    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('unread-count-updated', handleUnreadUpdate);
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, fetchConversations, activeConversation]);

  // Explicit user click — mark seen ONLY if window is actually focused at that moment
  const handleSelectConversation = (conv) => {
    setConversations(prev =>
      prev.map(c =>
        c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
    setActiveConversation(conv);
    setMobileView('chat');

    if (
      socket &&
      user &&
      typeof document !== 'undefined' &&
      document.visibilityState === 'visible' &&
      document.hasFocus()
    ) {
      socket.emit('mark-messages-seen', {
        conversationId: conv.conversationId,
        readerId: user._id || user.id
      });
    }
    setTimeout(() => fetchConversations(), 1200);
  };

  if (loading) return <LoadingSpinner text="Loading messages..." />;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">

        {/* Mobile back button — visible only in chat view on small screens */}
        {mobileView === 'chat' && activeConversation && (
          <div className="lg:hidden flex items-center gap-3 mb-3 px-1">
            <button
              onClick={() => setMobileView('list')}
              className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-white border border-emerald-200 rounded-xl px-3 py-2 shadow-sm active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Messages</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6">

          {/* Left Sidebar — full screen on mobile when mobileView=list, hidden when mobileView=chat */}
          <div
            className={`lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col
              ${mobileView === 'chat' ? 'hidden lg:flex' : 'flex'}
            `}
            style={{ height: 'calc(100vh - 160px)', minHeight: '420px', maxHeight: '82vh' }}
          >
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Messages &amp; Tutors</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">
                {conversations.length} Active
              </span>
            </h2>

            <div className="flex-1 overflow-y-auto space-y-1.5 mt-3">
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No chat conversations yet.
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = activeConversation?.conversationId === conv.conversationId;
                  const partnerIdStr = conv.partner?._id ? conv.partner._id.toString() : '';
                  const isTutorOnline = partnerIdStr ? (onlineStatusMap?.[partnerIdStr] === true) : false;

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
                      <div className="relative shrink-0">
                        <img
                          src={conv.partner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.partner?.name || 'T')}&background=059669&color=fff`}
                          alt={conv.partner?.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${
                            isTutorOnline ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-300'
                          }`}
                          title={isTutorOnline ? 'Online' : 'Offline'}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {conv.partner?.name}
                          </h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isTutorOnline ? (
                              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                Offline
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
                          {conv.lastMessage?.text || (conv.lastMessage?.voiceData ? 'Voice note' : 'Sent an offer')}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Chat Window — full screen on mobile when mobileView=chat, hidden when mobileView=list */}
          <div className={`lg:col-span-8 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
            {activeConversation ? (
              <ChatWindow
                conversationId={activeConversation.conversationId}
                partner={activeConversation.partner}
                initialDeal={activeConversation.deal}
              />
            ) : (
              <div
                className="hidden lg:flex bg-white rounded-3xl border border-slate-200 flex-col items-center justify-center p-8 text-center"
                style={{ height: 'calc(100vh - 160px)', minHeight: '420px', maxHeight: '82vh' }}
              >
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
