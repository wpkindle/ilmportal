'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import DealOfferCard from './DealOfferCard';
import DealOfferModal from '../tutor/DealOfferModal';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import ReportModal from './ReportModal';
import LoadingSpinner from '../common/LoadingSpinner';

const ChatWindow = ({ conversationId, partner, initialDeal }) => {
  const { user, isTutor, isStudent } = useAuth();
  const { socket, onlineUsers } = useSocket();

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

  const isPartnerOnline = partner?._id && onlineUsers.includes(partner._id);

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
  }, [conversationId]);

  // Socket listener for new incoming messages and deal status updates
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit('join-conversation', conversationId);

    const handleReceiveMessage = (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleDealStatusUpdated = (updatedDeal) => {
      setPartnerDeal(updatedDeal);
      setMessages((prev) =>
        prev.map((m) => {
          const match =
            m.deal?._id === updatedDeal._id ||
            m.deal === updatedDeal._id ||
            m.dealOfferData?.dealId === updatedDeal._id ||
            m.dealOfferData?._id === updatedDeal._id;
          if (match) {
            return {
              ...m,
              deal: updatedDeal,
              dealOfferData: { ...m.dealOfferData, ...updatedDeal, status: updatedDeal.status }
            };
          }
          return m;
        })
      );
    };

    socket.on('new-message', handleReceiveMessage);
    socket.on('receive-message', handleReceiveMessage);
    socket.on('deal-status-updated', handleDealStatusUpdated);

    return () => {
      socket.off('new-message', handleReceiveMessage);
      socket.off('receive-message', handleReceiveMessage);
      socket.off('deal-status-updated', handleDealStatusUpdated);
    };
  }, [socket, conversationId]);

  // Scroll only the internal messages container when messages list updates
  useEffect(() => {
    scrollToBottom(true);
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentText = inputText;
    setInputText('');

    try {
      const res = await api.sendChatMessage({
        conversationId,
        recipientId: partner?._id,
        text: currentText,
        messageType: 'text'
      });

      if (res.success && res.chatMessage) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.chatMessage._id)) return prev;
          return [...prev, res.chatMessage];
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setInputText(currentText);
    }
  };

  // --- Voice Note Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      recordIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required to record voice messages.');
    }
  };

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

  const sendVoiceRecording = () => {
    if (!mediaRecorderRef.current) return;

    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    const finalDuration = recordDuration;

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio = reader.result;

        try {
          // Send Voice Message via API (persists to MongoDB and broadcasts via Socket.IO)
          const res = await api.sendChatMessage({
            conversationId,
            recipientId: partner?._id,
            messageType: 'voice',
            voiceData: base64Audio,
            voiceDuration: finalDuration,
            text: '🎙️ Voice Message'
          });

          if (res.success && res.chatMessage) {
            setMessages((prev) => {
              if (prev.some((m) => m._id === res.chatMessage._id)) return prev;
              return [...prev, res.chatMessage];
            });
          }
        } catch (err) {
          console.error('Error sending voice message:', err);
          alert('Failed to send voice note.');
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
      
      {/* Top Chat Header */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={partner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.name || 'User')}&background=059669&color=fff`}
              alt={partner?.name}
              className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
            />
            {isPartnerOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </div>

          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <span>{partner?.name || 'Tutoring Chat'}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200 px-1.5 py-0.2 rounded">
                {partner?.role}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 flex items-center gap-2">
              {isPartnerOnline ? (
                <span className="text-emerald-600 font-semibold">Online now</span>
              ) : (
                <span>{partner?.city || 'Pakistan'}</span>
              )}
              <span>&bull;</span>
              <span className="text-[10px] text-emerald-700 font-medium">Voice Notes Enabled 🎙️</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Report to Admin Button for both Student & Tutor */}
          {partner && (
            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200/80 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Report an issue or safety concern with this user to platform admin"
            >
              <Flag className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Report to Admin</span>
            </button>
          )}

          {/* Tutor Action: Send Course Offer */}
          {isTutor && (
            <button
              type="button"
              onClick={() => setDealModalOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span className="hidden sm:inline">Send Course Offer</span>
              <span className="sm:hidden">Offer</span>
            </button>
          )}
        </div>
      </div>

      {/* Community Safety & Quality Notice Banner */}
      <div className="px-4 py-2.5 bg-emerald-50/80 border-b border-emerald-100/90 flex items-start gap-2.5 text-xs text-emerald-950">
        <div className="p-1 rounded-lg bg-emerald-200/90 text-emerald-800 shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <p className="text-[11px] sm:text-xs text-emerald-900 leading-snug font-medium">
          <strong className="text-emerald-950 font-bold">Safety Notice:</strong> To keep our community safe and high-quality, this conversation is being saved. Please remember not to share or request personal details. This helps protect your account and keeps our platform safe for everyone!
        </p>
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
          const currentUserId = user?._id || user?.id;
          const msgSenderId = msg.sender?._id || msg.sender;
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
                <div
                  className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-emerald-700 text-white rounded-br-none shadow-2xs'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>
              )}

              <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
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
