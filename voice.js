// voice.js — The Daily Reset voice narration system
// Uses browser-native Speech Synthesis API (Web Speech API)
// No audio files needed — the browser speaks the narration text directly
// Supports male and female voice selection

const VoiceSystem = {
  voices: [],
  selectedVoice: null,
  voiceGender: 'female', // default
  enabled: true,
  rate: 1.1,
  pitch: 1.0,
  volume: 1.0,
  currentUtterance: null,
  isSpeaking: false,
  onEndCallback: null,

  init() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (typeof window !== 'undefined') {
        console.warn('Speech synthesis not supported in this browser');
      }
      this.enabled = false;
      return;
    }

    // Load voices (some browsers load asynchronously)
    this.loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }

    // Restore preference from localStorage
    const saved = JSON.parse(localStorage.getItem('reset_voice_settings') || '{}');
    if (saved.gender) this.voiceGender = saved.gender;
    if (saved.enabled !== undefined) this.enabled = saved.enabled;
    if (saved.rate) this.rate = saved.rate;
    if (saved.pitch) this.pitch = saved.pitch;
    if (saved.volume) this.volume = saved.volume;
  },

  loadVoices() {
    this.voices = speechSynthesis.getVoices();
    this.selectBestVoice();
  },

  selectBestVoice() {
    if (this.voices.length === 0) return;

    // English voices only
    const enVoices = this.voices.filter(v => v.lang.startsWith('en'));
    if (enVoices.length === 0) {
      this.selectedVoice = this.voices[0];
      return;
    }

    // Browser voice names don't have explicit gender, but we can heuristically match
    const femaleHints = ['female', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'veena', 'amelie', 'anna', 'ellen', 'zira', 'hazel', 'serena', 'catherine', 'allison', 'ava', 'susan', 'google uk english female', 'google us english'];
    const maleHints = ['male', 'daniel', 'alex', 'fred', 'tom', 'oliver', 'arthur', 'gordon', 'david', 'mark', 'google uk english male', 'rishi', 'aaron', 'nicky'];

    // Highest-quality named voices per gender, in preference order.
    // On modern macOS these are the natural-sounding "Enhanced"/"Premium" voices.
    const femalePreferred = ['samantha', 'ava', 'allison', 'susan', 'zoe', 'serena', 'karen', 'moira', 'tessa'];
    const malePreferred = ['alex', 'tom', 'daniel', 'aaron', 'fred', 'oliver', 'arthur'];

    const preferred = this.voiceGender === 'female' ? femalePreferred : malePreferred;
    const hints = this.voiceGender === 'female' ? femaleHints : maleHints;
    const oppositeHints = this.voiceGender === 'female' ? maleHints : femaleHints;

    const nameHas = (v, s) => v.name.toLowerCase().includes(s);
    const isHighQuality = v => {
      const n = v.name.toLowerCase();
      return n.includes('enhanced') || n.includes('premium') || n.includes('natural') || n.includes('neural');
    };

    let match = null;

    // 1. Preferred named voice AND high-quality variant (e.g. "Samantha (Enhanced)")
    for (const name of preferred) {
      match = enVoices.find(v => nameHas(v, name) && isHighQuality(v));
      if (match) break;
    }
    // 2. Preferred named voice, any variant
    if (!match) {
      for (const name of preferred) {
        match = enVoices.find(v => nameHas(v, name));
        if (match) break;
      }
    }
    // 3. Any high-quality voice matching the requested gender
    if (!match) {
      match = enVoices.find(v => isHighQuality(v) && hints.some(h => nameHas(v, h)));
    }
    // 4. Any voice matching the requested gender hints
    if (!match) {
      match = enVoices.find(v => hints.some(h => nameHas(v, h)));
    }
    // 5. Google voices (usually high quality)
    if (!match) {
      match = enVoices.find(v => nameHas(v, 'google'));
    }
    // 6. Any high-quality voice, avoiding the opposite gender
    if (!match) {
      match = enVoices.find(v => isHighQuality(v) && !oppositeHints.some(h => nameHas(v, h)));
    }
    // 7. Fall back to any voice not matching the opposite gender
    if (!match) {
      const filtered = enVoices.filter(v => !oppositeHints.some(h => nameHas(v, h)));
      match = filtered[0] || enVoices[0];
    }
    // 8. Non-Mac fallback: any remaining English voice (Windows/Linux names differ)
    if (!match) {
      match = enVoices[0];
    }

    this.selectedVoice = match;
  },

  setGender(gender) {
    this.voiceGender = gender;
    this.selectBestVoice();
    this.saveSettings();
  },

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stop();
    this.saveSettings();
  },

  saveSettings() {
    localStorage.setItem('reset_voice_settings', JSON.stringify({
      gender: this.voiceGender,
      enabled: this.enabled,
      rate: this.rate,
      pitch: this.pitch,
      volume: this.volume
    }));
  },

  speak(text, onEnd) {
    if (!this.enabled || !text) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any current speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) utterance.voice = this.selectedVoice;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    utterance.onstart = () => { this.isSpeaking = true; };
    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.onEndCallback = onEnd;
    speechSynthesis.speak(utterance);
  },

  stop() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  },

  pause() {
    if ('speechSynthesis' in window && speechSynthesis.speaking) {
      speechSynthesis.pause();
    }
  },

  resume() {
    if ('speechSynthesis' in window && speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  },

  isSupported() {
    return 'speechSynthesis' in window;
  },

  getAvailableVoices() {
    return this.voices.filter(v => v.lang.startsWith('en')).map(v => ({
      name: v.name,
      lang: v.lang,
      gender: this.detectGender(v.name)
    }));
  },

  detectGender(name) {
    const femaleHints = ['female', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'veena', 'amelie', 'anna', 'ellen', 'zira', 'hazel', 'serena', 'catherine', 'allison', 'ava', 'susan', 'google uk english female', 'google us english'];
    const maleHints = ['male', 'daniel', 'alex', 'fred', 'tom', 'oliver', 'arthur', 'gordon', 'david', 'mark', 'google uk english male', 'rishi', 'aaron', 'nicky'];
    const lower = name.toLowerCase();
    if (femaleHints.some(h => lower.includes(h))) return 'female';
    if (maleHints.some(h => lower.includes(h))) return 'male';
    return 'unknown';
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  window.VoiceSystem = VoiceSystem;
  document.addEventListener('DOMContentLoaded', () => VoiceSystem.init());
}
