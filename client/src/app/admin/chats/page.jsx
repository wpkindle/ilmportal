'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import { MessageSquare, Eye, X, User } from 'lucide-react';

export default function ChatAuditPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.getAdminChats();
        if (res.success) setConversations(res.conversations);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const openTranscript = async (conv) => {
    setSelectedConv(conv);
    setLoadingTranscript(true);
    try {
      const res = await api.getAdminTranscript(conv.conversationId);
      if (res.success) setTranscript(res.messages);
    } catch (err) {
      alert(err.message || 'Error fetching transcript');
    } finally {
      setLoadingTranscript(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading chat oversight logs..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Chat Oversight & Full Transcripts</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect complete conversation transcripts between any student and tutor for platform safety.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Participants</th>
                    <th className="p-4">Last Activity</th>
                    <th className="p-4">Total Messages</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {conversations.map((conv) => (
                    <tr key={conv.conversationId} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">
                          {conv.user1?.name} <span className="text-slate-400 font-normal">({conv.user1?.role})</span>
                          {' & '}
                          {conv.user2?.name} <span className="text-slate-400 font-normal">({conv.user2?.role})</span>
                        </p>
                        <p className="text-slate-500 text-[11px] truncate max-w-sm mt-0.5">
                          Last: "{conv.lastMessage?.text || 'Deal offer'}"
                        </p>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(conv.lastMessage?.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-emerald-800">
                        {conv.messageCount} messages
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openTranscript(conv)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-xl border border-purple-200 inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Transcript</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>

        </div>
      </div>

      {/* Transcript Modal */}
      {selectedConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Chat Transcript: {selectedConv.user1?.name} & {selectedConv.user2?.name}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Conv ID: {selectedConv.conversationId}
                </p>
              </div>
              <button
                onClick={() => setSelectedConv(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 rounded-2xl my-3">
              {loadingTranscript ? (
                <div className="text-center text-xs text-slate-400 py-8">Loading messages...</div>
              ) : (
                transcript.map((msg) => (
                  <div key={msg._id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {msg.sender?.name} <span className="text-[10px] text-slate-400 font-normal">({msg.sender?.role})</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-700">{msg.text}</p>
                    {msg.dealOfferData && (
                      <div className="p-2 bg-emerald-50 rounded-lg text-[11px] text-emerald-900 font-medium mt-1">
                        Deal Offer: {msg.dealOfferData.subject} - PKR {msg.dealOfferData.price} ({msg.dealOfferData.mode})
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedConv(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

