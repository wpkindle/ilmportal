'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Mic } from 'lucide-react';

export default function VoiceMessagePlayer({
  voiceData,
  duration = 0,
  isMe = false
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!voiceData) return;

    const audio = new Audio(voiceData);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Math.round(audio.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [voiceData]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Audio playback error:', e);
      });
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || totalDuration === 0) return;
    const seekTime = Number(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl min-w-[240px] max-w-sm ${
        isMe
          ? 'bg-emerald-800/90 text-white'
          : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
      }`}
    >
      {/* Play / Pause Toggle Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-md ${
          isMe
            ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform & Scrubber Area */}
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="flex items-center justify-between text-[10px] font-bold opacity-85">
          <span className="flex items-center gap-1">
            <Mic className="w-3 h-3 text-emerald-400" />
            <span>Voice Note</span>
          </span>
          <span className="font-mono">
            {formatTime(currentTime)} / {formatTime(totalDuration || duration || 0)}
          </span>
        </div>

        {/* Custom Progress Scrubber */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={totalDuration || duration || 1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-200/50 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Animated Waveform Visualizer bars */}
        <div className="flex items-center gap-0.5 h-3 pt-0.5">
          {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 65, 35, 75, 50, 85, 40, 60].map((height, idx) => (
            <div
              key={idx}
              style={{
                height: isPlaying ? `${Math.max(20, (height * Math.random()).toFixed(0))}%` : `${height * 0.4}%`,
                transition: 'height 0.15s ease'
              }}
              className={`w-1 rounded-full ${
                isMe ? 'bg-emerald-300/70' : 'bg-emerald-600/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

