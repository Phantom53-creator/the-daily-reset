// audio.js — The Daily Reset audio engine
// Plays pre-recorded studio MP3s when they exist (listed in audio-manifest.js),
// and falls back to the browser voice (voice.js) when they don't.
// This means voice quality is identical on every computer once recordings are added,
// and the app still works fully before they are.

const AudioEngine = {
  enabled: true,
  gender: 'female',
  player: null,          // HTMLAudioElement for recorded playback
  mode: null,            // 'recorded' | 'tts' | null
  onTimeUpdate: null,
  onEnded: null,

  init() {
    const saved = JSON.parse(localStorage.getItem('reset_voice_settings') || '{}');
    if (saved.gender) this.gender = saved.gender;
    if (saved.enabled !== undefined) this.enabled = saved.enabled;
  },

  manifest() {
    return new Set(window.AUDIO_MANIFEST || []);
  },

  hasRecording(src) {
    return !!src && this.manifest().has(src);
  },

  setGender(gender) {
    this.gender = gender;
    window.VoiceSystem?.setGender(gender);
  },

  setEnabled(enabled) {
    this.enabled = enabled;
    window.VoiceSystem?.setEnabled(enabled);
    if (!enabled) this.stop();
  },

  // --- Path conventions (must match audio-manifest.js) ---

  breakStepSrc(breakId, stepIndex) {
    return `audio/breaks/${breakId}-step${stepIndex + 1}-${this.gender}.mp3`;
  },

  episodeSrc(episodeId) {
    return `audio/learning/${episodeId}-${this.gender}.mp3`;
  },

  // Closing-quote audio: one fixed intro line, plus one file per quote.
  quoteIntroSrc() {
    return `audio/quotes/quote-intro-${this.gender}.mp3`;
  },
  quoteSrc(category, index) {
    return `audio/quotes/quote-${category}-${index}-${this.gender}.mp3`;
  },

  // Label shown in the player so testers can see which source is active
  sourceLabel() {
    return this.mode === 'recorded' ? 'Studio audio' : 'Device voice';
  },

  // --- Short narration (break steps, cues) ---
  // Plays the recorded clip if available, otherwise speaks the text.

  narrate(src, text, onEnd, rate) {
    if (!this.enabled) { if (onEnd) onEnd(); return; }
    this.stop();

    if (this.hasRecording(src)) {
      this.mode = 'recorded';
      this.player = new Audio(src);
      this.player.onended = () => { if (onEnd) onEnd(); };
      this.player.onerror = () => {
        // File listed in manifest but missing/unplayable — fall back to voice
        this.mode = 'tts';
        window.VoiceSystem?.speak(text, onEnd, rate);
      };
      this.player.play().catch(() => {
        this.mode = 'tts';
        window.VoiceSystem?.speak(text, onEnd, rate);
      });
    } else {
      this.mode = 'tts';
      window.VoiceSystem?.speak(text, onEnd, rate);
    }
  },

  // --- Long-form playback (learning episodes) ---
  // Recorded: real audio element with seek/resume.
  // Fallback: browser voice + caller-driven timer (no seek).
  // Returns the mode so the caller knows how to drive progress.

  playEpisode(episode, startAtSeconds, callbacks) {
    if (!this.enabled) return null;
    this.stop();
    const src = this.episodeSrc(episode.id);
    this.onTimeUpdate = callbacks?.onTimeUpdate || null;
    this.onEnded = callbacks?.onEnded || null;

    if (this.hasRecording(src)) {
      this.mode = 'recorded';
      this.player = new Audio(src);
      this.player.currentTime = startAtSeconds || 0;
      this.player.ontimeupdate = () => {
        if (this.onTimeUpdate) this.onTimeUpdate(this.player.currentTime, this.player.duration || episode.duration);
      };
      this.player.onended = () => { if (this.onEnded) this.onEnded(); };
      this.player.play().catch(() => {
        this.mode = 'tts';
        window.VoiceSystem?.speak(episode.transcript, this.onEnded);
      });
      return 'recorded';
    }

    this.mode = 'tts';
    window.VoiceSystem?.speak(episode.transcript, this.onEnded);
    return 'tts';
  },

  pause() {
    if (this.mode === 'recorded' && this.player) this.player.pause();
    else window.VoiceSystem?.pause();
  },

  resume() {
    if (this.mode === 'recorded' && this.player) this.player.play().catch(() => {});
    else window.VoiceSystem?.resume();
  },

  stop() {
    if (this.player) {
      this.player.pause();
      this.player.ontimeupdate = null;
      this.player.onended = null;
      this.player = null;
    }
    window.VoiceSystem?.stop();
    this.mode = null;
  }
};

if (typeof window !== 'undefined') {
  window.AudioEngine = AudioEngine;
  document.addEventListener('DOMContentLoaded', () => AudioEngine.init());
}
