'use client';

import React, { useState } from 'react';
import { Video, ExternalLink, Play, AlertCircle, RefreshCw } from 'lucide-react';
import { getVideoEmbedInfo } from '../../utils/videoHelpers';

export default function VideoIntroPlayer({
  videoUrl,
  title = 'Tutor Video Introduction',
  tutorName = 'Tutor',
  className = ''
}) {
  const [hasError, setHasError] = useState(false);
  const [isPlayingDirect, setIsPlayingDirect] = useState(false);

  const videoInfo = getVideoEmbedInfo(videoUrl);

  if (!videoInfo || !videoUrl) {
    return null;
  }

  if (hasError) {
    return (
      <div className={`aspect-video w-full rounded-2xl bg-stone-900 border border-stone-800 flex flex-col items-center justify-center p-6 text-center text-white ${className}`}>
        <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
        <h4 className="text-sm font-bold">Unable to display video preview</h4>
        <p className="text-xs text-stone-300 max-w-sm mt-1 mb-3">
          The video intro link could not be loaded directly. You can view the original video on its host platform.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHasError(false)}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
          {videoInfo.originalUrl && (
            <a
              href={videoInfo.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#b85d34] hover:bg-[#9e4e2a] text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>Watch Video</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // Embeddable Iframe Players (YouTube, Vimeo, Loom, Google Drive)
  if (videoInfo.embedUrl) {
    return (
      <div className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-sm border border-[#e6ded1] ${className}`}>
        <iframe
          src={videoInfo.embedUrl}
          title={`${tutorName} - ${title}`}
          className="absolute inset-0 w-full h-full border-0 rounded-2xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Direct Video Stream / Uploaded MP4 / WebM / MOV
  return (
    <div className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-sm border border-[#e6ded1] ${className}`}>
      <video
        controls
        playsInline
        preload="metadata"
        className="w-full h-full object-contain rounded-2xl bg-black"
        src={videoInfo.src}
        onError={() => setHasError(true)}
        onPlay={() => setIsPlayingDirect(true)}
      >
        <source src={videoInfo.src} type="video/mp4" />
        <source src={videoInfo.src} type="video/webm" />
        Your browser does not support HTML5 video playback.
      </video>
    </div>
  );
}

