'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DeleteAccountModal({ isOpen, onClose, role = 'student', userName = '' }) {
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deleteAccount(password);
    } catch (err) {
      setError(err.message || 'Failed to delete account. Please verify your password and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-rose-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Delete Account</h3>
              <p className="text-xs text-rose-600 font-bold uppercase tracking-wider mt-0.5">Permanent & Irreversible</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning text */}
        <div className="p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-2xl text-xs text-rose-950 space-y-1.5 leading-relaxed">
          <p className="font-bold">Are you sure you want to delete your account{userName ? `, ${userName}` : ''}?</p>
          <p className="text-[11px] text-rose-900">
            {role === 'tutor'
              ? 'Your public teacher profile, courses, Sanad documents, and student chat histories will be permanently removed from IlmiDunya Pakistan.'
              : 'Your enrolled courses, milestones, chat messages, and learning records will be permanently erased.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-800 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Current Password (Optional if signed up with social login)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Type <span className="font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-black">DELETE</span> to confirm *
            </label>
            <input
              type="text"
              required
              placeholder="Type DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white font-mono font-bold"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || confirmText.trim().toUpperCase() !== 'DELETE'}
              className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{loading ? 'Deleting Account...' : 'Permanently Delete'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
