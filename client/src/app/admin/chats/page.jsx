'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import { MessageSquare, Eye, X, User, Trash2, FileText, Download, ExternalLink } from 'lucide-react';

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

  const handleDeleteConversation = async (conversationId) => {
    if (!conversationId) return;
    const ok = window.confirm(
      'Are you sure you want to permanently delete this chat conversation as Admin?\n\nThis will remove all messages in this conversation for both student and tutor.'
    );
    if (!ok) return;

    try {
      const res = await api.adminDeleteConversation(conversationId);
      if (res?.success) {
        setConversations((prev) => prev.filter((c) => c.conversationId !== conversationId));
        if (selectedConv?.conversationId === conversationId) {
          setSelectedConv(null);
          setTranscript([]);
        }
      } else {
        alert(res?.message || 'Failed to delete conversation');
      }
    } catch (err) {
      alert(err.message || 'Error deleting conversation');
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
                      <td className="p-4 font-bold text-[#0c2217]">
                        {conv.messageCount} messages
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openTranscript(conv)}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-xl border border-purple-200 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Transcript</span>
                          </button>
                          <button
                            onClick={() => handleDeleteConversation(conv.conversationId)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                            title="Delete Conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteConversation(selectedConv.conversationId)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Delete this entire conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Chat</span>
                </button>
                <button
                  onClick={() => setSelectedConv(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                    {msg.text && <p className="text-slate-700">{msg.text}</p>}
                    {msg.fileUrl && (
                      <div className="mt-1.5">
                        {msg.fileType?.startsWith('image/') || /\.(png|jpg|jpeg)$/i.test(msg.fileName || msg.fileUrl) ? (
                          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={msg.fileUrl}
                              alt={msg.fileName || 'Attachment'}
                              className="max-h-48 max-w-full rounded-lg object-contain border border-slate-200"
                            />
                          </a>
                        ) : (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={msg.fileName}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                          >
                            <FileText className="w-4 h-4 text-red-500" />
                            <span className="font-semibold truncate">{msg.fileName || 'Document.pdf'}</span>
                            <Download className="w-3.5 h-3.5 text-slate-400" />
                          </a>
                        )}
                      </div>
                    )}
                    {msg.dealOfferData && (
                      <div className="p-2 bg-[#f0ece1] border border-[#d4a359]/40 rounded-lg text-[11px] text-[#0c2217] font-medium mt-1">
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

