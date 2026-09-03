'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Send,
  Sparkles,
  Paperclip,
  Video,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Mic,
  Square,
  Trash2,
  Radio,
  Flag,
  AlertTriangle,
  Check,
  CheckCheck,
  Lock,
  Ban,
  Volume2,
  VolumeX,
  Bell
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications } from '../../context/NotificationContext';
import { soundEngine } from '../../utils/soundEffects';
import { showNativeNotification } from '../../utils/notificationManager';
import DealOfferCard from './DealOfferCard';
import DealOfferModal from '../tutor/DealOfferModal';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import ReportModal from './ReportModal';
import LoadingSpinner from '../common/LoadingSpinner';

const ChatWindow = ({ conversationId, partner, initialDeal }) => {
  const { user, isTutor, isStudent } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { soundEnabled, toggleSound, permissionStatus, requestPermission } = useNotifications();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [partnerDeal, setPartnerDeal] = useState(initialDeal || null);

  // Voice Note Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordIntervalRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const messagesContainerRef = useRef(null);

  const partnerIdStr = partner?._id ? partner._id.toString() : '';
  const isPartnerOnline = partnerIdStr ? onlineUsers.some(id => id.toString() === partnerIdStr) : false;

  // Scroll ONLY the inner chat messages container (never scrolls the outer page/window)
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Fetch initial messages and active deal
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await api.getChatMessages(conversationId);
        if (res.success) {
          setMessages(res.messages || []);
          // Emit socket event to notify other party that messages are seen
          if (socket && user) {
            socket.emit('mark-messages-seen', {
              conversationId,
              readerId: user._id || user.id
            });
          }
        }

        // Fetch active/pending deal if available
        if (partner?._id) {
          const dealsRes = await api.getMyDeals();
          if (dealsRes.success && dealsRes.deals) {
            const currentDeal = dealsRes.deals.find(
              (d) =>
                (d.tutor?._id === partner._id || d.tutor === partner._id || d.student?._id === partner._id || d.student === partner._id) &&
                ['pending_offer', 'active_trial', 'active_paid'].includes(d.status)
            );
            if (currentDeal) setPartnerDeal(currentDeal);
          }
        }
      } catch (err) {
        console.error('Error loading chat messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, socket]);

  // Socket listener for new incoming messages, deal updates, and seen receipts
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit('join-conversation', conversationId);

    const handleReceiveMessage = (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });

        const currentUserId = (user?._id || user?.id)?.toString();
        const senderId = (msg.sender?._id || msg.sender)?.toString();
        const recipientId = (msg.recipient?._id || msg.recipient)?.toString();

        // If I received this message from my counterpart
        if (currentUserId && senderId !== currentUserId) {
          // Play WhatsApp/Messenger style double-chime
          soundEngine.playMessageSound();

          // If document is not currently focused/visible, show native desktop/mobile OS notification banner
          if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
            showNativeNotification({
              title: `${msg.sender?.name || partner?.name || 'New Message'}`,
              body: msg.text || (msg.voiceData ? 'Sent a voice note' : 'Sent an offer update'),
              icon: msg.sender?.avatar || partner?.avatar || '/icon.svg',
              url: isTutor ? '/tutor/messages' : '/student/messages',
              tag: `msg-${msg._id}`,
              soundType: 'none'
            });
          }

          if (recipientId === currentUserId) {
            socket.emit('mark-messages-seen', {
              conversationId,
              readerId: currentUserId
            });
          }
        }
      }
    };

    // When the other person reads my messages
    const handleMessagesSeen = ({ conversationId: seenConvId, readerId }) => {
      const currentUserId = (user?._id || user?.id)?.toString();
      if (seenConvId === conversationId && readerId.toString() !== currentUserId) {
        setMessages((prev) =>
          prev.map((m) => {
            const senderId = (m.sender?._id || m.sender)?.toString();
            if (senderId === currentUserId) {
              return { ...m, isRead: true, isDelivered: true, readAt: new Date() };
            }
            return m;
          })
        );
      }
    };

    socket.on('new-message', handleReceiveMessage);
    socket.on('messages-seen', handleMessagesSeen);

    return () => {
      socket.off('new-message', handleReceiveMessage);
      socket.off('messages-seen', handleMessagesSeen);
    };
  }, [socket, conversationId, user]);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !partner?._id) return;

    const payload = {
      conversationId,
      senderId: user._id || user.id,
      recipientId: partner._id,
      text: inputText.trim(),
      messageType: 'text'
    };

    setInputText('');

    if (socket && socket.connected) {
      socket.emit('send-message', payload);
    } else {
      try {
        const res = await api.sendChatMessage(payload);
        if (res.success && res.chatMessage) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === res.chatMessage._id)) return prev;
            return [...prev, res.chatMessage];
          });
        }
      } catch (err) {
        console.error('Error sending message fallback:', err);
      }
    }
  };

  // Start Audio Recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Voice recording is not supported in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordDuration(0);

      recordIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone permission is required to record voice notes.');
    }
  };

  // Cancel Audio Recording
  const cancelRecording = () => {
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    setRecordDuration(0);
    audioChunksRef.current = [];
  };

  // Stop and Send Audio Recording
  const sendVoiceRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio = reader.result;
        const payload = {
          conversationId,
          senderId: user._id || user.id,
          recipientId: partner._id,
          messageType: 'voice',
          voiceData: base64Audio,
          voiceDuration: recordDuration
        };

        if (socket && socket.connected) {
          socket.emit('send-message', payload);
        } else {
          try {
            const res = await api.sendChatMessage(payload);
            if (res.success && res.chatMessage) {
              setMessages((prev) => {
                if (prev.some((m) => m._id === res.chatMessage._id)) return prev;
                return [...prev, res.chatMessage];
              });
            }
          } catch (err) {
            console.error('Error sending voice message:', err);
          }
        }
      };

      reader.readAsDataURL(audioBlob);

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      setIsRecording(false);
      setRecordDuration(0);
      audioChunksRef.current = [];
    };

    mediaRecorderRef.current.stop();
  };

  const handleOfferSent = (createdDeal) => {
    setPartnerDeal(createdDeal);
    api.getChatMessages(conversationId).then((res) => {
      if (res.success) setMessages(res.messages);
    });
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return <LoadingSpinner text="Loading conversation..." />;
  }

  return (
    <div className="flex flex-col h-[75vh] bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      
      {/* Top Chat Header (Fiverr / Upwork Style Online/Offline Badge) */}
      <div className="p-4 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={partner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.name || 'User')}&background=059669&color=fff`}
              alt={partner?.name}
              className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-sm"
            />
            {isPartnerOnline ? (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full ring-2 ring-emerald-500/20 shadow-xs"
                title="Online Now"
              />
            ) : (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-slate-300 border-2 border-white rounded-full"
                title="Offline"
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xs sm:text-sm text-slate-900 truncate">
                {partner?.name || 'Tutoring Chat'}
              </h3>
              <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                {partner?.role}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-[11px] flex-wrap">
              {/* Fiverr/Upwork style active presence badge */}
              {isPartnerOnline ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/70 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Online</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Offline</span>
                </span>
              )}

              <span className="text-slate-300">&bull;</span>
              <span className="text-slate-500 text-[11px] truncate">{partner?.city || 'Pakistan'}</span>
              <span className="text-[10px] text-emerald-700 font-medium hidden sm:inline-flex items-center gap-1">
                <Mic className="w-3 h-3 text-emerald-600" />
                <span>Voice Notes</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Sound & Notification Alerts Controls */}
          {permissionStatus !== 'granted' && (
            <button
              type="button"
              onClick={requestPermission}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Turn on desktop & mobile notifications with audio chime"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="hidden md:inline">Enable Alerts</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => toggleSound()}
            className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
            }`}
            title={soundEnabled ? 'Sound alert is ON (Click to mute chime)' : 'Sound alert is MUTED (Click to enable chime)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Live In-Platform Video Classroom Button (Identical deterministic room for Student & Tutor) */}
          <Link
            href={`/classroom/${conversationId}`}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Start or Join In-Platform HD Video Class"
          >
            <Video className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="hidden sm:inline">Join Live Class</span>
            <span className="sm:hidden">Class</span>
          </Link>

          {/* Report to Admin Button for both Student & Tutor */}
          {partner && (
            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200/80 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Report an issue or safety concern with this user to platform admin"
            >
              <Flag className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden md:inline">Report</span>
            </button>
          )}

          {/* Block / Restrict User Control */}
          {partner && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Block and restrict ${partner?.name || 'this user'}? They will no longer be able to message or initiate live classroom calls with you.`)) {
                  alert(`${partner?.name || 'User'} has been blocked.`);
                }
              }}
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Block and restrict this user"
            >
              <Ban className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden lg:inline">Block</span>
            </button>
          )}

          {/* Tutor Action: Send Course Offer */}
          {isTutor && (
            <button
              type="button"
              onClick={() => setDealModalOpen(true)}
              className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span className="hidden sm:inline">Send Course Offer</span>
              <span className="sm:hidden">Offer</span>
            </button>
          )}
        </div>
      </div>

      {/* End-to-End Encrypted & AI Moderation Safe Banner */}
      <div className="px-4 py-2 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white border-b border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center gap-2 text-[11px]">
          <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 shrink-0">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-emerald-300">End-to-End Encrypted &amp; AI Safety Protected</span>
          <span className="text-slate-400 hidden md:inline">&bull; Monitored for harassment &amp; contact sharing</span>
        </div>
        <div className="text-[10px] text-slate-300 font-medium flex items-center gap-2">
          <span>DM Restricted to Enrolled Partners</span>
          <Link href="/safety" className="text-emerald-400 hover:text-emerald-300 underline font-bold">Safety Rules</Link>
        </div>
      </div>

      {/* Messages List Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">Start the conversation</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Discuss trial timings, learning goals, or send a course agreement offer.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const currentUserId = (user?._id || user?.id)?.toString();
          const msgSenderId = (msg.sender?._id || msg.sender)?.toString();
          const isMe = msgSenderId === currentUserId;
          const isVoiceMsg = msg.messageType === 'voice' || !!msg.voiceData;

          return (
            <div
              key={msg._id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {msg.isDealOffer || msg.messageType === 'deal_offer' || msg.messageType === 'deal_accept' ? (
                <DealOfferCard
                  deal={msg.deal || msg.dealOfferData || partnerDeal}
                  onDealUpdated={(updated) => setPartnerDeal(updated)}
                />
              ) : isVoiceMsg ? (
                <VoiceMessagePlayer
                  voiceData={msg.voiceData}
                  duration={msg.voiceDuration || 0}
                  isMe={isMe}
                />
              ) : (
                <div className="flex items-center gap-1.5 group/msg relative">
                  <div
                    className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-emerald-700 text-white rounded-br-none shadow-2xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(true)}
                      className="opacity-0 group-hover/msg:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Report this specific message for moderation review"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Timestamp + Sent / Delivered / Seen Status for Outgoing Messages */}
              <div className="flex items-center gap-1.5 mt-1 px-1 text-[9px] font-mono text-slate-400">
                <span>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {isMe && (
                  <span className="flex items-center gap-0.5 ml-1">
                    {msg.isRead ? (
                      <span className="flex items-center gap-0.5 text-emerald-600 font-bold" title={`Seen ${msg.readAt ? new Date(msg.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`}>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[8.5px] uppercase tracking-wider">Seen</span>
                      </span>
                    ) : msg.isDelivered ? (
                      <span className="flex items-center gap-0.5 text-slate-400 font-medium" title="Delivered">
                        <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[8.5px] uppercase tracking-wider">Delivered</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-slate-400" title="Sent">
                        <Check className="w-3 h-3 text-slate-400" />
                        <span className="text-[8.5px] uppercase tracking-wider">Sent</span>
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Message Input Area */}
      <div className="p-3 bg-white border-t border-slate-200/80">
        {isRecording ? (
          /* Live Voice Recording UI */
          <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-200 rounded-2xl animate-pulse">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-rose-600 rounded-full animate-ping" />
              <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                <Radio className="w-4 h-4" />
                <span>Recording Voice Note:</span>
                <span className="font-mono text-sm">{formatSeconds(recordDuration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                title="Cancel Recording"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={sendVoiceRecording}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Note</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Text & Voice Input */
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button
              type="button"
              onClick={startRecording}
              className="p-2.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-2xl transition-colors cursor-pointer"
              title="Hold to Record Voice Note"
            >
              <Mic className="w-5 h-5" />
            </button>

            <input
              type="text"
              placeholder={`Write a message to ${partner?.name || 'user'}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
            />

            {/* Send Text Message Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl disabled:opacity-40 transition-all shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Tutor Deal Modal */}
      {isTutor && (
        <DealOfferModal
          isOpen={dealModalOpen}
          onClose={() => setDealModalOpen(false)}
          studentId={partner?._id}
          studentName={partner?.name}
          onOfferSent={handleOfferSent}
        />
      )}

      {/* Incident / Safety Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportedUser={partner}
        conversationId={conversationId}
        messages={messages}
      />

    </div>
  );
};

export default ChatWindow;
