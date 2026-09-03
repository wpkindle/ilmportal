/**
 * IlmPortal Web Audio Chime Engine
 * Generates instant, crystal-clear audio notifications (like WhatsApp, Messenger, and TikTok)
 * using the browser's native Web Audio API (zero external assets, zero 404s, works offline & PWA).
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ilmportal_sound_enabled');
      this.soundEnabled = stored !== null ? stored === 'true' : true;

      // Unlock AudioContext on first user interaction to satisfy browser autoplay policies
      const unlock = () => {
        this.getAudioContext();
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
    }
  }

  getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  isSoundEnabled() {
    return this.soundEnabled;
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = !!enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ilmportal_sound_enabled', this.soundEnabled ? 'true' : 'false');
    }
  }

  /**
   * WhatsApp/Messenger-style message pop chime (Double bell tone)
   */
  playMessageSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1: 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.08);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.28, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.2);

      // Note 2: 880 Hz (A5) - higher cheerful acoustic bounce
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.0, now + 0.09);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18);

      gain2.gain.setValueAtTime(0, now + 0.09);
      gain2.gain.linearRampToValueAtTime(0.24, now + 0.11);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.09);
      osc2.stop(now + 0.4);
    } catch (err) {
      console.warn('Audio chime playback note:', err);
    }
  }

  /**
   * Modern crisp notification chime for safety alerts & deals
   */
  playNotificationSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Harmonic chime (Three-tone rapid rise: C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const noteTime = now + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.3);
      });
    } catch (err) {
      console.warn('Notification chime error:', err);
    }
  }
}

export const soundEngine = new SoundEngine();
