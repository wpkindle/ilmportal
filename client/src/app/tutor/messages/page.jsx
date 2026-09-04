'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../../services/api';
import ChatWindow from '../../../components/chat/ChatWindow';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StudentProfileModal from '../../../components/common/StudentProfileModal';
import {
  MessageSquare,
  ArrowLeft,
  User,
  ShieldCheck,
  Clock,
  Check,
  X,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import { soundEngine } from '../../../utils/soundEffects';
import { showNativeNotification } from '../../../utils/notificationManager';

function TutorMessagesContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { socket, onlineStatusMap, refreshUserOnlineStatus } = useSocket();
  const searchParams = useSearchParams();
  const activeConvParam = searchParams.get('conversation');
  const activeRequestParam = searchParams.get('request');

  const [activeTab, setActiveTab] = useState(activeRequestParam ? 'requests' : 'chats');
  const [conversations, setConversations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState('list');

  // Student Profile inspection modal state
  const [inspectStudentId, setInspectStudentId] = useState(null);
  const [inspectStudentData, setInspectStudentData] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [respondingId, setRespondingId] = useState(null);


  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.getConversations();
      if (res.success) {
        setConversations(res.conversations || []);
        return res.conversations || [];
      }
    } catch (err) {
      console.error('Error fetching tutor conversations:', err);
    }
    return [];
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.getChatRequests();
      if (res?.success) {
        setRequests(res.requests || []);
        return res.requests || [];
      }
    } catch (err) {
      console.error('Error fetching tutor chat requests:', err);
    }
    return [];
  }, []);

  const handleRespondRequest = async (requestId, action) => {
    setRespondingId(requestId);
    try {
      const res = await api.respondToChatRequest(requestId, { action });
      if (res?.success) {
        const [updatedRequests, updatedConvs] = await Promise.all([
          fetchRequests(),
          fetchConversations()
        ]);
        if (action === 'accepted') {
          setActiveTab('chats');
          const studentId = res.request?.student?._id || res.request?.student;
          const matchingConv = updatedConvs.find(c => c.partner?._id === studentId);
          if (matchingConv) {
            handleSelectConversation(matchingConv);
          }
        }
      }
    } catch (err) {
      console.error('Error responding to request:', err);
    } finally {
      setRespondingId(null);
    }
  };

  const handleInspectStudent = (student) => {
    setInspectStudentId(student?._id || student);
    setInspectStudentData(typeof student === 'object' ? student : null);
    setProfileModalOpen(true);
  };

  useEffect(() => {
    const init = async () => {
      const [convs, reqs] = await Promise.all([
        fetchConversations(),
        fetchRequests()
      ]);

      if (activeRequestParam) {
        setActiveTab('requests');
      } else if (activeConvParam) {
        let found = convs.find(c => c.conversationId === activeConvParam);
        if (!found && activeConvParam.includes('_')) {
          const [u1, u2] = activeConvParam.split('_');
          const altId = `${u2}_${u1}`;
          found = convs.find(c => 
            c.conversationId === altId ||
            c.partner?._id?.toString() === u1 ||
            c.partner?._id?.toString() === u2
          );
        }
        if (found) {
          setActiveConversation(found);
          setMobileView('chat');
        } else if (activeConvParam.includes('_')) {
          const myId = (user?._id || user?.id)?.toString();
          const [u1, u2] = activeConvParam.split('_');
          const partnerId = u1 === myId ? u2 : u1;
          if (partnerId) {
            const studentRes = await api.getStudentProfileForTutor(partnerId).catch(() => null);
            if (studentRes?.success && studentRes.student) {
              setActiveConversation({
                conversationId: activeConvParam,
                partner: studentRes.student
              });
              setMobileView('chat');
            }
          }
        }
      } else if (convs.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setActiveConversation(convs[0]);
      }
      setLoading(false);
    };
    init();
  }, [activeConvParam, activeRequestParam, fetchConversations, fetchRequests]);

  // Real-time verification of online status for all conversation partners
  useEffect(() => {
    if (conversations.length > 0 && refreshUserOnlineStatus) {
      const partnerIds = conversations.map(c => c.partner?._id).filter(Boolean);
      if (partnerIds.length > 0) refreshUserOnlineStatus(partnerIds);
    }
  }, [conversations.length, refreshUserOnlineStatus]);

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
      fetchConversations().then(convs => {
        setActiveConversation(curr => {
          if (!curr && convs && convs.length > 0) {
            const found = convs.find(c => c.conversationId === msg?.conversationId);
            return found || convs[0];
          }
          return curr;
        });
      });

      const currentUserId = (user?._id || user?.id)?.toString();
      const senderId = (msg?.sender?._id || msg?.sender)?.toString();
      if (currentUserId && senderId && senderId !== currentUserId) {
        if (msg?.conversationId !== activeConversation?.conversationId) {
          soundEngine.playMessageSound();
          showNativeNotification({
            title: `${msg?.sender?.name || 'New Message'}`,
            body: msg?.text || (msg?.voiceData ? 'Sent a voice note' : 'Sent an update'),
            icon: '/icon.png',
            url: `/tutor/messages?conversation=${msg?.conversationId}`,
            tag: `msg-${msg?._id}`,
            soundType: 'none'
          });
        }
      }
    };

    const handleNewChatRequest = (newReq) => {
      fetchRequests();
      soundEngine.playNotificationSound();
      showNativeNotification({
        title: `New Message Request from ${newReq?.student?.name || 'Student'}`,
        body: newReq?.details || 'Sent a new message request.',
        icon: '/icon.png',
        url: `/tutor/messages?request=${newReq?._id}`,
        tag: `req-${newReq?._id}`,
        soundType: 'none'
      });
    };

    const handleDealUpdated = (updatedDeal) => {
      fetchConversations().then((convs) => {
        if (updatedDeal) {
          setActiveConversation((curr) => (curr ? { ...curr, deal: updatedDeal } : curr));
        }
      });
    };

    socket.on('unread-count-updated', handleUnreadUpdate);
    socket.on('new-message', handleNewMessage);
    socket.on('chat-request-received', handleNewChatRequest);
    socket.on('deal-status-updated', handleDealUpdated);

    return () => {
      socket.off('unread-count-updated', handleUnreadUpdate);
      socket.off('new-message', handleNewMessage);
      socket.off('chat-request-received', handleNewChatRequest);
      socket.off('deal-status-updated', handleDealUpdated);
    };
  }, [socket, fetchConversations, fetchRequests, activeConversation]);

  // Optimistically clear unread, emit seen event, then re-fetch
  const handleSelectConversation = async (conv) => {
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
    <div className="bg-slate-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-1.5 sm:px-4 lg:px-8 py-2 sm:py-3 w-full">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6">

          {/* Left Sidebar — full screen on mobile when mobileView=list, hidden when mobileView=chat */}
          <div
            className={`lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200 shadow-sm flex flex-col h-[calc(100dvh-132px)] lg:h-[84vh]
              ${mobileView === 'chat' ? 'hidden lg:flex' : 'flex'}
            `}
          >
            {/* Header Tabs: Chats vs. Message Requests */}
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab('chats')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'chats'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Chats</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full">
                    {conversations.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('requests')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                    activeTab === 'requests'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Requests</span>
                  {requests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="min-w-[16px] h-4 px-1 bg-amber-500 text-white rounded-full text-[9.5px] font-black flex items-center justify-center animate-pulse">
                      {requests.filter(r => r.status === 'pending').length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 mt-3">
              {activeTab === 'requests' ? (
                /* Message Requests Tab Content */
                requests.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400 space-y-1.5">
                    <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <p className="font-bold text-slate-600">No message requests</p>
                    <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                      When students with 100% verified profiles request to connect, they will appear here.
                    </p>
                  </div>
                ) : (
                  requests.map((req) => {
                    const student = req.student || {};
                    const snapshot = req.studentProfileSnapshot || {};
                    const name = student.name || snapshot.name || 'Verified Student';
                    const avatar = student.avatar || snapshot.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0c2217&color=d4a359`;
                    const age = student.age || snapshot.age;
                    const gender = student.gender || snapshot.gender;
                    const city = student.city || snapshot.city || 'Pakistan';
                    const isResponding = respondingId === req._id;

                    return (
                      <div
                        key={req._id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 transition-all hover:border-[#d4a359]/60"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={avatar}
                            alt={name}
                            className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {name}
                              </h4>
                              <span
                                className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  req.status === 'accepted'
                                    ? 'bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40'
                                    : req.status === 'declined'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-900 animate-pulse'
                                }`}
                              >
                                {req.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 mt-0.5">
                              {age && <span>{age} yrs</span>}
                              {age && gender && <span>&bull;</span>}
                              {gender && <span className="capitalize">{gender}</span>}
                              <span>&bull;</span>
                              <span>{city}</span>
                            </div>

                            <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-[#0c2217] bg-[#f0ece1] px-2 py-0.5 rounded-md border border-[#d4a359]/40">
                              <ShieldCheck className="w-3 h-3 text-[#d4a359]" />
                              <span>100% Profile Strength</span>
                            </div>
                          </div>
                        </div>

                        {/* Request reason details */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed italic">
                          &ldquo;{req.details}&rdquo;
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleInspectStudent(student)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <User className="w-3 h-3 text-slate-500" />
                            <span>View Profile</span>
                          </button>

                          {req.status === 'pending' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={isResponding}
                                onClick={() => handleRespondRequest(req._id, 'declined')}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                              <button
                                type="button"
                                disabled={isResponding}
                                onClick={() => handleRespondRequest(req._id, 'accepted')}
                                className="px-3 py-1.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white rounded-xl text-[11px] font-bold shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>Accept</span>
                              </button>
                            </div>
                          ) : req.status === 'accepted' ? (
                            <button
                              type="button"
                              onClick={() => {
                                const currentUserId = user?._id || user?.id;
                                const studentId = student?._id || student;
                                const convId = [currentUserId.toString(), studentId.toString()].sort().join('_');
                                const match = conversations.find(c => c.conversationId === convId);
                                setActiveTab('chats');
                                if (match) {
                                  handleSelectConversation(match);
                                }
                              }}
                              className="px-3 py-1.5 bg-[#f0ece1] hover:bg-[#e6ded1] text-[#0c2217] border border-[#d4a359]/40 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3 text-[#d4a359]" />
                              <span>Open Chat</span>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                /* Conversations Tab Content */
                conversations.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    No active student chats yet.
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isSelected = activeConversation?.conversationId === conv.conversationId;
                    const partnerIdStr = conv.partner?._id ? conv.partner._id.toString() : '';
                    const isStudentOnline = partnerIdStr ? (onlineStatusMap?.[partnerIdStr] === true) : false;

                    return (
                      <button
                        key={conv.conversationId}
                        onClick={() => handleSelectConversation(conv)}
                        className={`w-full p-3 rounded-2xl text-left transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[#f0ece1]/80 border border-[#d4a359]/50 shadow-2xs'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img
                            src={conv.partner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.partner?.name || 'S')}&background=0c2217&color=d4a359`}
                            alt={conv.partner?.name}
                            className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                          />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${
                              isStudentOnline ? 'bg-amber-500 ring-2 ring-amber-500/20' : 'bg-slate-300'
                            }`}
                            title={isStudentOnline ? 'Online' : 'Offline'}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {conv.partner?.name}
                            </h4>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isStudentOnline ? (
                                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-[#0c2217] bg-[#f0ece1] px-2 py-0.5 rounded-full border border-[#d4a359]/40">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4a359] animate-pulse" />
                                  <span>Online</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  <span>Offline</span>
                                </span>
                              )}

                              {conv.unreadCount > 0 && (
                                <span className="min-w-[18px] h-4 px-1.5 bg-[#b85d34] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {conv.lastMessage?.text || (conv.lastMessage?.voiceData ? 'Voice note' : 'Offer sent')}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )
              )}
            </div>
          </div>

          {/* Right Chat Panel */}
          <div className={`lg:col-span-8 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
            {activeConversation ? (
              <ChatWindow
                conversationId={activeConversation.conversationId}
                partner={activeConversation.partner}
                initialDeal={activeConversation.deal}
                onBack={() => setMobileView('list')}
              />
            ) : (
              <div
                className="hidden lg:flex bg-white rounded-3xl border border-slate-200 flex-col items-center justify-center p-8 text-center h-[84vh] min-h-[560px]"
              >
                <MessageSquare className="w-12 h-12 text-slate-200 mb-2" />
                <p className="font-bold text-slate-700 text-sm">No conversation selected</p>
                <p className="text-xs text-slate-400">Select a student inquiry to respond or send a deal offer.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Student Profile Inspection Modal */}
      <StudentProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        studentId={inspectStudentId}
        studentData={inspectStudentData}
      />
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
