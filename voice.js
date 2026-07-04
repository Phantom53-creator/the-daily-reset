// voice.js — The Daily Reset voice narration system
// Uses browser-native Speech Synthesis API (Web Speech API)
// No audio files needed — the browser speaks the narration text directly
// Supports male and female voice selection

const VoiceSystem = {
  voices: [],
  selectedVoice: null,
  voiceGender: 'female', // default
  enabled: true,
  rate: 0.9,
  pitch: 1.0,
  volume: 1.0,
  currentUtterance: null,
  isSpeaking: false,
  onEndCallback: null,

  init() {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
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

    // Try to find a voice matching the selected gender
    // Browser voice names don't have explicit gender, but we can heuristically match
    const femaleHints = ['female', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'veena', 'amelie', 'anna', 'ellen', 'zira', 'hazel', 'serena', 'catherine', 'allison', 'ava', 'susan', 'google uk english female', 'google us english'];
    const maleHints = ['male', 'daniel', 'alex', 'fred', 'tom', 'oliver', 'arthur', 'gordon', 'david', 'mark', 'google uk english male', 'rishi', 'aaron', 'nicky'];

    const hints = this.voiceGender === 'female' ? femaleHints : maleHints;
    const oppositeHints = this.voiceGender === 'female' ? maleHints : femaleHints;

    // First try exact hint match
    let match = enVoices.find(v => hints.some(h => v.name.toLowerCase().includes(h)));
    if (!match) {
      // Try Google voices (usually high quality)
      match = enVoices.find(v => v.name.toLowerCase().includes('google'));
    }
    if (!match) {
      // Try "Natural" or "Enhanced" voices
      match = enVoices.find(v => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('enhanced'));
    }
    if (!match) {
      // Avoid voices that match the opposite gender hints
      const filtered = enVoices.filter(v => !oppositeHints.some(h => v.name.toLowerCase().includes(h)));
      match = filtered[0] || enVoices[0];
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
