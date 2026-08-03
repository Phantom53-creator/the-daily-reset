// audio.js — The Daily Reset audio engine
// Plays pre-recorded studio MP3s when they exist (listed in audio-manifest.js),
// and falls back to the browser voice (voice.js) when they don't.
// This means voice quality is identical on every computer once recordings are added,
// and the app still works fully before they are.

// 50ms of true silence (8kHz mono 8-bit WAV) used only to "unlock" the
// shared <audio> element on the first real tap — see unlock() below.
const SILENT_CLIP = 'data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';

const AudioEngine = {
  enabled: true,
  gender: 'female',
  player: null,          // one persistent HTMLAudioElement, reused for every clip
  mode: null,            // 'recorded' | 'tts' | null
  onTimeUpdate: null,
  onEnded: null,
  unlocked: false,

  init() {
    const saved = JSON.parse(localStorage.getItem('reset_voice_settings') || '{}');
    if (saved.gender) this.gender = saved.gender;
    if (saved.enabled !== undefined) this.enabled = saved.enabled;
  },

  // Lazily creates the single reusable <audio> element. Mobile browsers grant
  // "may play with sound" to the ELEMENT that was first played from a real
  // tap, not to the page in general — a brand-new `new Audio()` instantiated
  // later from a timer or an onended callback (exactly how step 2+ of a
  // break, or the Today's Word → bridge → episode chain, fire) is treated as
  // a fresh autoplay attempt and silently blocked, even right after the same
  // element played fine a moment earlier. Reusing one element and only
  // swapping its src keeps the original tap's permission attached.
  getPlayer() {
    if (!this.player) {
      this.player = new Audio();
      this.player.setAttribute('playsinline', '');
      this.player.preload = 'auto';
      if (typeof document !== 'undefined' && document.body) {
        this.player.style.display = 'none';
        document.body.appendChild(this.player);
      }
    }
    return this.player;
  },

  // Primes the shared element with a real, gesture-tied play() so later
  // programmatic src-swaps + play() calls inherit that permission instead of
  // being treated as fresh autoplay. Call once, from the very first tap
  // anywhere in the app — see bindReminders() in app.js.
  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    const player = this.getPlayer();
    player.src = SILENT_CLIP;
    const done = () => { player.pause(); player.currentTime = 0; };
    const playPromise = player.play();
    if (playPromise && playPromise.then) playPromise.then(done).catch(() => {});
    else done();
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

  // A step can optionally carry a clipId (breaks.js) so it reuses an
  // already-generated clip instead of always being tied to its position in
  // one specific sequence — needed for future sequence variants that repeat
  // the same exercise. Steps without one keep today's exact filename.
  breakStepSrc(breakId, stepIndex) {
    const step = window.BREAKS?.[breakId]?.steps?.[stepIndex];
    const clipId = step?.clipId || `${breakId}-step${stepIndex + 1}`;
    return `audio/breaks/${clipId}-${this.gender}.mp3`;
  },

  // Learning episodes are each recorded in exactly one fixed voice (half the
  // library is Marian, half is Richard) — this is a content decision, not a
  // user preference, so it deliberately ignores `this.gender`. Using the
  // Voice Selection toggle's gender here was the bug: switching it away from
  // an episode's actual recorded gender made hasRecording() miss the file and
  // silently fall back to the much lower quality browser voice.
  episodeSrc(episodeId) {
    const female = `audio/learning/${episodeId}-female.mp3`;
    const male = `audio/learning/${episodeId}-male.mp3`;
    if (this.hasRecording(female)) return female;
    if (this.hasRecording(male)) return male;
    return female;
  },

  // Which gender an episode was actually recorded in — used so "Today's
  // Word" (recorded in both genders) plays in the SAME voice as the episode
  // it introduces, rather than jarringly switching partway through.
  episodeGender(episodeId) {
    return this.hasRecording(`audio/learning/${episodeId}-male.mp3`) && !this.hasRecording(`audio/learning/${episodeId}-female.mp3`)
      ? 'male' : 'female';
  },

  wordSrc(wordId, gender) {
    return `audio/words/${wordId}-${gender}.mp3`;
  },

  // Spoken transition line between Today's Word and the episode.
  bridgeSrc(gender) {
    return `audio/words/bridge-${gender}.mp3`;
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

  // Belt-and-braces for the fallback-to-TTS paths below: a recorded <audio>
  // element's play() promise can reject (autoplay policy, a transient glitch)
  // even after playback has actually started — falling back to TTS at that
  // point without silencing the old element first would let both play at
  // once (heard as an "echo"/two voices, and a Pause that only stops one of
  // them). Always force the abandoned element fully quiet before switching.
  silenceAbandonedPlayer() {
    if (this.player) {
      this.player.pause();
      this.player.onended = null;
      this.player.onerror = null;
      this.player.ontimeupdate = null;
      this.player.onloadedmetadata = null;
      // Deliberately NOT nulling this.player — it's the one shared element
      // that's been "unlocked" by a real tap; discarding it would force the
      // next clip onto a brand-new element, losing that mobile permission.
    }
  },

  // Fires if playback was requested but neither a 'playing' event nor a TTS
  // 'start' arrived within the watchdog window — the surest sign a mobile
  // browser silently blocked this attempt rather than genuinely erroring.
  // app.js wires onStuck to show, and onAttemptStart to hide, a small
  // "tap to enable sound" recovery control.
  onStuck: null,
  onAttemptStart: null,
  _watchdog: null,
  _retryFn: null,

  armWatchdog(retryFn) {
    this.disarmWatchdog();
    if (this.onAttemptStart) this.onAttemptStart();
    this._retryFn = retryFn;
    this._watchdog = setTimeout(() => {
      this._watchdog = null;
      if (this.onStuck) this.onStuck();
    }, 2500);
  },

  disarmWatchdog() {
    if (this._watchdog) { clearTimeout(this._watchdog); this._watchdog = null; }
  },

  // Re-attempts the most recent playback request. Only ever called from a
  // fresh tap on the recovery control, so it's inherently gesture-tied and
  // succeeds even under the strictest autoplay policy.
  retry() {
    this.disarmWatchdog();
    const fn = this._retryFn;
    this._retryFn = null;
    if (fn) fn();
  },

  // --- Short narration (break steps, cues) ---
  // Plays the recorded clip if available, otherwise speaks the text.

  narrate(src, text, onEnd, rate) {
    if (!this.enabled) { if (onEnd) onEnd(); return; }
    this.stop();
    this.armWatchdog(() => this.narrate(src, text, onEnd, rate));

    if (this.hasRecording(src)) {
      this.mode = 'recorded';
      const player = this.getPlayer();
      player.onended = () => { this.disarmWatchdog(); if (onEnd) onEnd(); };
      player.onerror = () => {
        // File listed in manifest but missing/unplayable — fall back to voice
        this.silenceAbandonedPlayer();
        this.mode = 'tts';
        window.VoiceSystem?.speak(text, onEnd, rate, () => this.disarmWatchdog());
      };
      player.addEventListener('playing', () => this.disarmWatchdog(), { once: true });
      player.src = src;
      player.load();
      player.play().catch(() => {
        this.silenceAbandonedPlayer();
        this.mode = 'tts';
        window.VoiceSystem?.speak(text, onEnd, rate, () => this.disarmWatchdog());
      });
    } else {
      this.mode = 'tts';
      window.VoiceSystem?.speak(text, onEnd, rate, () => this.disarmWatchdog());
    }
  },

  // --- Long-form playback (learning episodes) ---
  // Recorded: real audio element with seek/resume.
  // Fallback: browser voice + caller-driven timer (no seek).
  // Returns the mode so the caller knows how to drive progress.

  playEpisode(episode, startAtSeconds, callbacks) {
    if (!this.enabled) return null;
    this.stop();
    this.armWatchdog(() => this.playEpisode(episode, startAtSeconds, callbacks));
    const src = this.episodeSrc(episode.id);
    this.onTimeUpdate = callbacks?.onTimeUpdate || null;
    this.onEnded = callbacks?.onEnded || null;

    if (this.hasRecording(src)) {
      this.mode = 'recorded';
      const player = this.getPlayer();
      const startAt = startAtSeconds || 0;
      player.onloadedmetadata = () => { if (startAt) player.currentTime = startAt; };
      player.ontimeupdate = () => {
        this.disarmWatchdog();
        if (this.onTimeUpdate) this.onTimeUpdate(player.currentTime, player.duration || episode.duration);
      };
      player.onended = () => { if (this.onEnded) this.onEnded(); };
      player.onerror = () => {
        this.silenceAbandonedPlayer();
        this.mode = 'tts';
        window.VoiceSystem?.speak(episode.transcript, this.onEnded, undefined, () => this.disarmWatchdog());
      };
      player.src = src;
      player.load();
      player.play().catch(() => {
        this.silenceAbandonedPlayer();
        this.mode = 'tts';
        window.VoiceSystem?.speak(episode.transcript, this.onEnded, undefined, () => this.disarmWatchdog());
      });
      return 'recorded';
    }

    this.mode = 'tts';
    window.VoiceSystem?.speak(episode.transcript, this.onEnded, undefined, () => this.disarmWatchdog());
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
    this.disarmWatchdog();
    if (this.player) {
      this.player.pause();
      this.player.ontimeupdate = null;
      this.player.onended = null;
      this.player.onerror = null;
      this.player.onloadedmetadata = null;
      // Element itself is kept alive and reused — see getPlayer()/unlock().
    }
    window.VoiceSystem?.stop();
    this.mode = null;
  }
};

if (typeof window !== 'undefined') {
  window.AudioEngine = AudioEngine;
  document.addEventListener('DOMContentLoaded', () => AudioEngine.init());
}
