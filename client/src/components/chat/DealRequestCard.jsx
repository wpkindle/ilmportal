'use client';

import React from 'react';
import { Sparkles, Video, Home, Calendar, BookOpen, CheckCircle2, MessageSquare } from 'lucide-react';

const DealRequestCard = ({ message, isMe, isTutor, onCreateDealOffer }) => {
  const reqData = message?.dealOfferData || {};
  const subject = reqData.subject || message.text || 'Tutoring Course';
  const mode = reqData.mode || 'online';
  const schedule = reqData.schedule;
  const notes = reqData.notes;
  const studentName = message?.sender?.name || 'Student';

  return (
    <div className="my-3 max-w-md w-full bg-white text-[#141c19] rounded-3xl p-5 border-2 border-[#d4a359]/60 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ebe3d3]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#f5f0e6] text-[#b85d34] rounded-xl border border-[#d4a359]/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#b85d34] block">
              Tutoring Deal Request
            </span>
            <h4 className="font-serif font-bold text-sm text-[#0c2217]">
              {subject}
            </h4>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
          Request
        </span>
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#ebe3d3] space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-stone-500">Requested By</span>
          <p className="font-bold text-[#0c2217] truncate">
            {isMe ? 'You' : studentName}
          </p>
        </div>

        <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#ebe3d3] space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-stone-500">Learning Mode</span>
          <p className="font-bold text-[#0c2217] flex items-center gap-1">
            {mode === 'online' ? (
              <>
                <Video className="w-3.5 h-3.5 text-[#b85d34]" />
                <span>Online Video</span>
              </>
            ) : (
              <>
                <Home className="w-3.5 h-3.5 text-[#b85d34]" />
                <span>In-Person</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Schedule */}
      {schedule && (
        <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#ebe3d3] text-xs text-stone-700 space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#b85d34]" />
            <span>Preferred Schedule</span>
          </span>
          <p className="font-medium text-stone-800">{schedule}</p>
        </div>
      )}

      {/* Student's Note */}
      {notes && (
        <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#ebe3d3] text-xs text-stone-700 space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-[#b85d34]" />
            <span>Student Note</span>
          </span>
          <p className="text-stone-800 italic leading-snug">&ldquo;{notes}&rdquo;</p>
        </div>
      )}

      {/* Action / CTA */}
      <div className="pt-2 border-t border-[#ebe3d3]">
        {isTutor ? (
          <button
            type="button"
            onClick={() => {
              if (onCreateDealOffer) {
                onCreateDealOffer({
                  subject,
                  mode,
                  schedule,
                  studentId: message?.sender?._id || message?.sender,
                  studentName
                });
              }
            }}
            className="w-full py-2.5 px-4 bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#874121] text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#d4a359]" />
            <span>Create Deal Offer for {studentName}</span>
          </button>
        ) : (
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-950 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Deal request dispatched to teacher. You will receive an offer here shortly.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealRequestCard;

