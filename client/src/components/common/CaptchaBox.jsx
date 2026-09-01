'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CaptchaBox({ onValidate, isVerified, setIsVerified, compact = false }) {
  const canvasRef = useRef(null);
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [touched, setTouched] = useState(false);

  // Generate random 5-character alphanumeric string (avoiding ambiguous chars like 0/O, 1/I)
  const generateRandomCode = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Draw captcha on canvas with noise lines and security distortion
  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f1f5f9');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Random background noise lines
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 150 + 50)}, ${Math.floor(Math.random() * 100)}, 0.35)`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(5, 150, 105, 0.4)`;
      ctx.fill();
    }

    // Draw characters with random rotation and colors
    const colors = ['#047857', '#0f766e', '#1d4ed8', '#7c3aed', '#b45309', '#0f172a'];
    const charWidth = width / (text.length + 1);

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const color = colors[i % colors.length];

      ctx.save();
      const x = (i + 0.8) * charWidth;
      const y = height / 2 + Math.random() * 6 - 3;
      const angle = (Math.random() - 0.5) * 0.4; // -12 to +12 degrees

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = 'bold 20px monospace, sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    const newCode = generateRandomCode();
    setCaptchaCode(newCode);
    setUserInput('');
    setIsVerified(false);
    if (onValidate) onValidate(false);
    setTimeout(() => drawCaptcha(newCode), 50);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setUserInput(val);
    setTouched(true);

    const valid = val.trim().toLowerCase() === captchaCode.toLowerCase();
    setIsVerified(valid);
    if (onValidate) onValidate(valid);
  };

  if (compact) {
    return (
      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-bold text-slate-700 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Security Code *</span>
          </span>
          {isVerified && (
            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Verified</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg border border-slate-200 shrink-0">
            <canvas
              ref={canvasRef}
              width={120}
              height={30}
              className="rounded cursor-pointer"
              onClick={refreshCaptcha}
              title="Click to refresh image"
            />
            <button
              type="button"
              onClick={refreshCaptcha}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
              title="Get new code"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <input
            type="text"
            required
            maxLength={6}
            placeholder="Type code"
            value={userInput}
            onChange={handleInputChange}
            className={`w-full px-2.5 py-1.5 bg-white rounded-lg text-xs font-mono font-bold tracking-wider outline-none ${
              isVerified
                ? 'border border-emerald-500 text-emerald-900'
                : touched && userInput.length >= 4
                ? 'border border-rose-400 text-rose-900'
                : 'border border-slate-200 text-slate-800 focus:border-emerald-500'
            }`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Security Verification (CAPTCHA) *</span>
        </label>
        {isVerified && (
          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified</span>
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        {/* Canvas visual challenge */}
        <div className="relative flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
          <canvas
            ref={canvasRef}
            width={130}
            height={34}
            className="rounded-lg cursor-pointer"
            onClick={refreshCaptcha}
            title="Click to refresh image"
          />
          <button
            type="button"
            onClick={refreshCaptcha}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
            title="Get new code"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User text input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            required
            maxLength={6}
            placeholder="Enter code above"
            value={userInput}
            onChange={handleInputChange}
            className={`w-full px-3 py-1.5 bg-white rounded-xl text-xs font-mono font-bold tracking-wider outline-none transition-all ${
              isVerified
                ? 'border-2 border-emerald-500 text-emerald-900 focus:ring-2 focus:ring-emerald-500'
                : touched && userInput.length >= 4
                ? 'border-2 border-rose-400 text-rose-900'
                : 'border border-slate-200 text-slate-800 focus:border-emerald-500'
            }`}
          />
        </div>
      </div>

      {touched && !isVerified && userInput.length >= 4 && (
        <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Incorrect code. Please type the characters shown above.</span>
        </p>
      )}
    </div>
  );
}

