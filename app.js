// app.js — The Daily Reset app logic
// Handles break playback, local scheduling preferences, learning toggle, and pause/resume state.

const ResetApp = {
  state: {
    currentBreak: null,
    currentStepIndex: 0,
    secondsRemaining: 0,
    timer: null,
    isPaused: false,
    dayIndex: Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000),
    learningEpisode: null,
    learningElapsed: 0,
    learningTimer: null,
    learningPaused: true,
    learningVoiceStarted: false
  },

  init() {
    this.bindBreakButtons();
    this.bindPlayerControls();
    this.bindSettings();
    this.bindLearningControls();
    this.bindVoiceSelector();
    this.loadSettings();
    this.applyAccessState();
    this.showMorningQuote();
    this.checkLearningReminder();
  },

  bindBreakButtons() {
    document.querySelectorAll('.break-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const breakId = btn.dataset.break;
        const breakDef = window.BREAKS[breakId];
        if (!breakDef) return;

        // No trial yet → prompt signup (name + email, no payment)
        if (!window.hasFullAccess?.() && !window.getTrialData?.()) {
          window.openSignupModal?.();
          return;
        }

        // Trial expired and not paid → prompt upgrade
        if (!window.hasFullAccess?.()) {
          window.openUpgradeModal?.();
          return;
        }

        this.openBreak(breakId);
      });
    });
  },

  bindPlayerControls() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const skipBtn = document.getElementById('skip-btn');
    const backBtn = document.getElementById('back-btn');

    if (startBtn) startBtn.addEventListener('click', () => this.startBreak());
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
    if (skipBtn) skipBtn.addEventListener('click', () => this.nextStep());
    if (backBtn) backBtn.addEventListener('click', () => this.closeBreak());
  },

  bindSettings() {
    ['slot-1', 'slot-2', 'slot-3', 'learning-time-input'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', () => this.saveSettings());
    });

    const narrationToggle = document.getElementById('narration-toggle');
    const learningToggle = document.getElementById('learning-toggle');

    if (narrationToggle) {
      narrationToggle.addEventListener('change', () => {
        this.toggleVoiceSelector();
        window.VoiceSystem?.setEnabled(narrationToggle.checked);
        if (!narrationToggle.checked) window.VoiceSystem?.stop();
        this.saveSettings();
      });
    }
    if (learningToggle) {
      learningToggle.addEventListener('change', () => {
        this.toggleLearningConfig();
        this.saveSettings();
      });
    }
  },

  bindLearningControls() {
    const play = document.getElementById('learning-play-btn');
    const pause = document.getElementById('learning-pause-btn');
    const next = document.getElementById('learning-next-btn');
    const back = document.getElementById('learning-back-btn');

    if (play) play.addEventListener('click', () => this.playLearning());
    if (pause) pause.addEventListener('click', () => this.pauseLearning());
    if (next) next.addEventListener('click', () => this.nextLearningEpisode());
    if (back) back.addEventListener('click', () => this.closeLearning());
  },

  bindVoiceSelector() {
    document.querySelectorAll('.voice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const gender = btn.dataset.gender;
        window.VoiceSystem?.setGender(gender);
        // Update active state on all voice buttons across the page
        document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`.voice-btn[data-gender="${gender}"]`).forEach(b => b.classList.add('active'));
      });
    });
    // Restore saved preference
    if (window.VoiceSystem) {
      const savedGender = VoiceSystem.voiceGender;
      document.querySelectorAll(`.voice-btn[data-gender="${savedGender}"]`).forEach(b => b.classList.add('active'));
    }
  },

  loadSettings() {
    const saved = JSON.parse(localStorage.getItem('reset_settings') || '{}');
    Object.entries(saved).forEach(([key, value]) => {
      const el = document.getElementById(key);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = !!value;
      else el.value = value;
    });

    const savedLearning = JSON.parse(localStorage.getItem('reset_learning_state') || '{}');
    this.state.learningElapsed = savedLearning.elapsed || 0;
    this.state.learningEpisode = savedLearning.episodeId
      ? window.LEARNING_EPISODES?.find(ep => ep.id === savedLearning.episodeId)
      : window.getTodaysLearningEpisode?.();

    this.toggleLearningConfig();
    this.toggleVoiceSelector();

    // Sync VoiceSystem enabled state with narration toggle
    const narrationOn = document.getElementById('narration-toggle')?.checked;
    window.VoiceSystem?.setEnabled(narrationOn !== false);
  },

  saveSettings() {
    const ids = ['slot-1', 'slot-2', 'slot-3', 'learning-time-input', 'narration-toggle', 'learning-toggle'];
    const settings = {};
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      settings[id] = el.type === 'checkbox' ? el.checked : el.value;
    });
    localStorage.setItem('reset_settings', JSON.stringify(settings));
  },

  toggleLearningConfig() {
    const enabled = document.getElementById('learning-toggle')?.checked;
    const config = document.getElementById('learning-config');
    if (config) config.style.display = enabled ? 'block' : 'none';
  },

  toggleVoiceSelector() {
    const narrationOn = document.getElementById('narration-toggle')?.checked;
    const selector = document.getElementById('voice-selector');
    if (selector) selector.style.display = narrationOn ? 'block' : 'none';
  },

  applyAccessState() {
    if (window.hasFullAccess?.()) document.body.classList.add('has-full-access');
  },

  openBreak(breakId) {
    const breakDef = window.BREAKS[breakId];
    this.state.currentBreak = breakDef;
    this.state.currentStepIndex = 0;
    this.state.secondsRemaining = breakDef.steps[0].duration;
    this.state.isPaused = false;

    document.getElementById('break-select').style.display = 'none';
    document.getElementById('break-player').style.display = 'block';
    document.getElementById('player-title').textContent = breakDef.name;
    document.getElementById('player-subtitle').textContent = breakDef.description;
    document.getElementById('player-quote').style.display = 'none';
    document.getElementById('start-btn').style.display = 'inline-flex';
    document.getElementById('pause-btn').style.display = 'none';
    document.getElementById('skip-btn').style.display = 'none';

    this.renderCurrentStep();
  },

  closeBreak() {
    this.clearTimer();
    window.VoiceSystem?.stop();
    const voiceInfo = document.getElementById('player-voice-info');
    if (voiceInfo) voiceInfo.style.display = 'none';
    document.getElementById('break-player').style.display = 'none';
    document.getElementById('break-select').style.display = 'block';
  },

  startBreak() {
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('pause-btn').style.display = 'inline-flex';
    document.getElementById('skip-btn').style.display = 'inline-flex';
    // Show voice badge if narration is enabled
    const voiceInfo = document.getElementById('player-voice-info');
    if (voiceInfo) voiceInfo.style.display = window.VoiceSystem?.enabled ? 'block' : 'none';
    this.tick();
    this.state.timer = setInterval(() => this.tick(), 1000);
    // Speak the first step's narration
    this.speakStepNarration();
  },

  togglePause() {
    this.state.isPaused = !this.state.isPaused;
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) pauseBtn.textContent = this.state.isPaused ? 'Resume' : 'Pause';
    // Pause/resume voice
    if (this.state.isPaused) {
      window.VoiceSystem?.pause();
    } else {
      window.VoiceSystem?.resume();
    }
  },

  tick() {
    if (this.state.isPaused) return;

    this.renderCurrentStep();

    const step = this.state.currentBreak?.steps?.[this.state.currentStepIndex];
    const total = step?.duration || 0;
    const remaining = this.state.secondsRemaining;
    const midpoint = Math.floor(total / 2);

    // Midpoint "keep going" reminder — only once per step, only if narration is on
    if (remaining === midpoint && total >= 25) {
      const narrationOn = document.getElementById('narration-toggle')?.checked;
      if (narrationOn !== false) {
        window.VoiceSystem?.speak('Keep going.');
      }
    }

    if (this.state.secondsRemaining <= 0) {
      this.nextStep();
      return;
    }
    this.state.secondsRemaining -= 1;
  },

  nextStep() {
    const breakDef = this.state.currentBreak;
    this.state.currentStepIndex += 1;

    if (this.state.currentStepIndex >= breakDef.steps.length) {
      this.completeBreak();
      return;
    }

    this.state.secondsRemaining = breakDef.steps[this.state.currentStepIndex].duration;
    this.renderCurrentStep();
    // Speak the new step's narration
    this.speakStepNarration();
  },

  renderCurrentStep() {
    const breakDef = this.state.currentBreak;
    if (!breakDef) return;
    const step = breakDef.steps[this.state.currentStepIndex];
    if (!step) return;

    const timerNumber = document.getElementById('timer-number');
    const timerLabel = document.getElementById('timer-label');
    const instruction = document.getElementById('timer-instruction');

    if (timerNumber) timerNumber.textContent = this.formatTime(this.state.secondsRemaining);
    if (timerLabel) timerLabel.textContent = `Step ${this.state.currentStepIndex + 1} of ${breakDef.steps.length}`;
    if (instruction) instruction.textContent = step.instruction;
  },

  speakStepNarration() {
    const breakDef = this.state.currentBreak;
    if (!breakDef) return;
    const step = breakDef.steps[this.state.currentStepIndex];
    if (!step) return;
    // Only speak if narration is enabled in settings
    const narrationOn = document.getElementById('narration-toggle')?.checked;
    if (narrationOn === false) return;
    window.VoiceSystem?.speak(step.narration || step.instruction);
  },

  completeBreak() {
    this.clearTimer();
    window.VoiceSystem?.stop();
    const breakDef = this.state.currentBreak;
    const quote = window.getDailyQuote?.(breakDef.closingQuote?.category || 'general', this.state.dayIndex);

    document.getElementById('timer-number').textContent = 'Done';
    document.getElementById('timer-label').textContent = 'Break complete';
    document.getElementById('timer-instruction').textContent = 'Good. Return to one clear next action.';
    document.getElementById('pause-btn').style.display = 'none';
    document.getElementById('skip-btn').style.display = 'none';
    document.getElementById('start-btn').style.display = 'inline-flex';
    document.getElementById('start-btn').textContent = 'Repeat';
    const voiceInfo = document.getElementById('player-voice-info');
    if (voiceInfo) voiceInfo.style.display = 'none';

    if (quote) {
      const quoteBox = document.getElementById('player-quote');
      const quoteText = document.getElementById('quote-text');
      quoteBox.style.display = 'block';
      quoteText.textContent = `“${quote.text}” — ${quote.author}`;
    }

    this.saveBreakCompletion(breakDef.id);
  },

  saveBreakCompletion(breakId) {
    const history = JSON.parse(localStorage.getItem('reset_break_history') || '[]');
    history.push({ breakId, completedAt: new Date().toISOString() });
    localStorage.setItem('reset_break_history', JSON.stringify(history.slice(-100)));
  },

  clearTimer() {
    if (this.state.timer) clearInterval(this.state.timer);
    this.state.timer = null;
  },

  showMorningQuote() {
    const quote = window.getMorningQuote?.(this.state.dayIndex);
    if (!quote) return;
    const appShell = document.getElementById('app-shell');
    if (!appShell || document.querySelector('.morning-quote')) return;
    const el = document.createElement('div');
    el.className = 'morning-quote';
    el.innerHTML = `<strong>Today:</strong> “${quote.text}” <span>— ${quote.author}</span>`;
    appShell.prepend(el);
  },

  openLearning() {
    // Check if user already has today's episode assigned
    const todayKey = this.getTodayKey();
    const learningState = JSON.parse(localStorage.getItem('reset_learning_state') || '{}');

    // If no topic group selected yet, show the picker
    if (!learningState.topicGroup) {
      this.showTopicPicker();
      return;
    }

    // Get today's episode from the shuffle
    let episode = this.getTodaysShuffledEpisode(learningState);
    if (!episode) return;

    // Check if already completed today
    const completedToday = learningState.completedDates && learningState.completedDates[todayKey];

    this.state.learningEpisode = episode;
    this.state.learningElapsed = learningState.elapsedForEpisode === episode.id ? learningState.elapsed || 0 : 0;
    document.getElementById('break-select').style.display = 'none';
    document.getElementById('learning-player').style.display = 'block';
    document.getElementById('learning-episode-title').textContent = episode.title;
    this.renderLearningProgress();

    // Hide "Next episode" button if already completed today's episode
    const nextBtn = document.getElementById('learning-next-btn');
    if (nextBtn) {
      nextBtn.style.display = completedToday ? 'none' : 'inline-flex';
      nextBtn.textContent = completedToday ? 'Come back tomorrow' : 'Next episode';
      nextBtn.disabled = completedToday;
    }
  },

  showTopicPicker() {
    const picker = document.getElementById('topic-picker');
    if (!picker) return;
    document.getElementById('break-select').style.display = 'none';
    picker.style.display = 'block';

    // Bind topic group selection
    document.querySelectorAll('.topic-group-btn').forEach(btn => {
      btn.onclick = () => {
        const group = btn.dataset.group;
        const learningState = JSON.parse(localStorage.getItem('reset_learning_state') || '{}');
        learningState.topicGroup = group;
        learningState.shuffleStart = new Date().toISOString();
        learningState.shuffleOrder = this.generateShuffleOrder(group);
        learningState.completedDates = {};
        localStorage.setItem('reset_learning_state', JSON.stringify(learningState));
        picker.style.display = 'none';
        document.getElementById('break-select').style.display = 'block';
        this.openLearning();
      };
    });

    // Bind "change topic" button (if already has a group)
    const changeBtn = document.getElementById('change-topic-btn');
    if (changeBtn) {
      changeBtn.onclick = () => {
        const learningState = JSON.parse(localStorage.getItem('reset_learning_state') || '{}');
        learningState.topicGroup = null;
        learningState.shuffleOrder = null;
        localStorage.setItem('reset_learning_state', JSON.stringify(learningState));
        picker.style.display = 'none';
        this.showTopicPicker();
      };
    }
  },

  getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  },

  generateShuffleOrder(topicGroup) {
    // Map topic picker groups to episode categories
    const groupMap = {
      'philosophy': ['philosophy', 'history'],
      'motivation': ['motivation', 'performance'],
      'science': ['science'],
      'leadership': ['leadership', 'productivity', 'culture'],
      'history': ['history'],
      'all': null  // null = all episodes
    };
    const categories = groupMap[topicGroup];
    const episodes = (window.LEARNING_EPISODES || []).filter(ep => {
      if (!categories) return true;  // 'all' group
      return categories.includes(ep.category);
    });
    // Fisher-Yates shuffle
    const indices = episodes.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return { group: topicGroup, episodeIds: episodes.map(ep => ep.id), order: indices };
  },

  getTodaysShuffledEpisode(learningState) {
    if (!learningState.shuffleOrder || !learningState.shuffleOrder.episodeIds) return null;
    const todayKey = this.getTodayKey();
    const startDate = new Date(learningState.shuffleStart);
    const dayDiff = Math.floor((new Date() - startDate) / 86400000);
    const order = learningState.shuffleOrder.order;
    const ids = learningState.shuffleOrder.episodeIds;
    if (order.length === 0) return null;
    const idx = order[dayDiff % order.length];
    const episodeId = ids[idx];
    return window.LEARNING_EPISODES.find(ep => ep.id === episodeId);
  },

  closeLearning() {
    this.pauseLearning();
    window.VoiceSystem?.stop();
    document.getElementById('learning-player').style.display = 'none';
    document.getElementById('break-select').style.display = 'block';
  },

  playLearning() {
    if (!this.state.learningEpisode) this.state.learningEpisode = window.getTodaysLearningEpisode?.();
    this.state.learningPaused = false;
    document.getElementById('learning-play-btn').style.display = 'none';
    document.getElementById('learning-pause-btn').style.display = 'inline-flex';
    this.state.learningTimer = setInterval(() => {
      if (this.state.learningPaused) return;
      this.state.learningElapsed += 1;
      if (this.state.learningElapsed >= this.state.learningEpisode.duration) this.pauseLearning();
      this.renderLearningProgress();
      this.saveLearningState();
    }, 1000);
    // Speak or resume voice
    if (this.state.learningVoiceStarted) {
      window.VoiceSystem?.resume();
    } else {
      this.state.learningVoiceStarted = true;
      const episode = this.state.learningEpisode;
      if (episode && episode.transcript) {
        window.VoiceSystem?.speak(episode.transcript);
      }
    }
  },

  pauseLearning() {
    this.state.learningPaused = true;
    if (this.state.learningTimer) clearInterval(this.state.learningTimer);
    this.state.learningTimer = null;
    window.VoiceSystem?.pause();
    const play = document.getElementById('learning-play-btn');
    const pause = document.getElementById('learning-pause-btn');
    if (play) play.style.display = 'inline-flex';
    if (pause) pause.style.display = 'none';
    this.saveLearningState();
  },

  nextLearningEpisode() {
    // 1 new episode/day cap — prevent clicking ahead
    const todayKey = this.getTodayKey();
    const learningState = JSON.parse(localStorage.getItem('reset_learning_state') || '{}');
    if (!learningState.completedDates) learningState.completedDates = {};

    // Mark today's episode as completed
    learningState.completedDates[todayKey] = this.state.learningEpisode?.id;
    localStorage.setItem('reset_learning_state', JSON.stringify(learningState));

    // Lock the next button
    const nextBtn = document.getElementById('learning-next-btn');
    if (nextBtn) {
      nextBtn.textContent = 'Come back tomorrow';
      nextBtn.disabled = true;
    }

    this.pauseLearning();
    window.VoiceSystem?.stop();

    // Show message
    const note = document.getElementById('learning-note');
    if (note) {
      note.textContent = "That's today's episode. Come back tomorrow for the next one — curiosity is part of the design.";
    }
  },

  renderLearningProgress() {
    const episode = this.state.learningEpisode;
    if (!episode) return;
    const pct = Math.min(100, (this.state.learningElapsed / episode.duration) * 100);
    const fill = document.getElementById('learning-progress-fill');
    const time = document.getElementById('learning-progress-time');
    const note = document.getElementById('learning-note');
    if (fill) fill.style.width = pct + '%';
    if (time) time.textContent = `${this.formatTime(this.state.learningElapsed)} / ${this.formatTime(episode.duration)}`;
    if (note) note.textContent = episode.oneIdea + ' Takeaway: ' + episode.takeaway;
  },

  saveLearningState() {
    if (!this.state.learningEpisode) return;
    const existing = JSON.parse(localStorage.getItem('reset_learning_state') || '{}');
    existing.episodeId = this.state.learningEpisode.id;
    existing.elapsed = this.state.learningElapsed;
    existing.elapsedForEpisode = this.state.learningEpisode.id;
    localStorage.setItem('reset_learning_state', JSON.stringify(existing));
  },

  checkLearningReminder() {
    // Static MVP: no push notifications. Shows an in-page button when learning is enabled.
    const enabled = document.getElementById('learning-toggle')?.checked;
    if (!enabled) return;
    const appShell = document.getElementById('app-shell');
    if (!appShell || document.getElementById('learning-open-card')) return;
    const episode = this.state.learningEpisode || window.getTodaysLearningEpisode?.();
    const card = document.createElement('div');
    card.id = 'learning-open-card';
    card.className = 'learning-open-card';
    card.innerHTML = `<div><strong>Lunch Break Learning:</strong> ${episode.title}<br><span>${episode.oneIdea}</span></div><button class="btn-secondary" id="open-learning-btn">Open</button>`;
    appShell.prepend(card);
    document.getElementById('open-learning-btn').addEventListener('click', () => this.openLearning());
  },

  formatTime(seconds) {
    const s = Math.max(0, seconds || 0);
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
  }
};

document.addEventListener('DOMContentLoaded', () => ResetApp.init());

if (typeof window !== 'undefined') window.ResetApp = ResetApp;
