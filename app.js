// app.js — The Daily Reset app shell (app.html)
// View routing, access gating, dashboard, break player, learning player, settings.
// Landing page (index.html) has no app logic — it only links here.

const RING_CIRCUMFERENCE = 2 * Math.PI * 96; // matches r=96 in app.html

const BREAK_ICONS = {
  eyes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  shoulders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="3"/><path d="M4 15c2-3.5 5-4.5 8-4.5s6 1 8 4.5"/><path d="M4 15l-1.5 2M20 15l1.5 2"/></svg>',
  stand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.5" r="2.5"/><path d="M12 7v7"/><path d="M12 14l-3.5 6M12 14l3.5 6"/><path d="M7 9.5h10"/></svg>',
  breathe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h9a3 3 0 1 0-3-3"/><path d="M3 12h14a3 3 0 1 1-3 3"/><path d="M3 16h6a2.5 2.5 0 1 1-2.5 2.5"/></svg>',
  posture: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="5" r="2.5"/><path d="M10 7.5V14h6"/><path d="M10 11h4"/><path d="M6 7.5V19M6 19h11v2M6 19v2"/></svg>'
};

const ResetApp = {
  state: {
    currentBreak: null,
    currentStepIndex: 0,
    secondsRemaining: 0,
    timer: null,
    isPaused: false,
    running: false,
    midpointFired: false,
    dayIndex: Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000),
    learningEpisode: null,
    learningElapsed: 0,
    learningTimer: null,
    learningPlaying: false,
    learningStarted: false,
    learningMode: null // 'recorded' | 'tts'
  },

  init() {
    this.bindHeader();
    this.bindWelcome();
    this.bindPaywall();
    this.bindDashboard();
    this.bindPlayer();
    this.bindLearning();
    this.bindSettings();
    this.bindModals();
    this.bindNotice();
    this.bindReminders();
    this.loadSettings();
    this.renderAccessPill();
    this.route();
    this.startReminderTicker();
  },

  // ---------- Routing ----------

  route() {
    const level = window.getAccessLevel();
    if (level === 'none') this.showView('welcome');
    else if (level === 'expired') this.showView('paywall');
    else this.showDashboard();
  },

  showView(name) {
    document.querySelectorAll('.view').forEach(v => { v.style.display = 'none'; });
    const view = document.getElementById(`view-${name}`);
    if (view) view.style.display = ''; // revert to stylesheet display (flex for welcome/paywall)
    document.querySelectorAll('.app-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
    // Header nav is meaningless before access exists
    const nav = document.querySelector('.app-nav');
    if (nav) nav.style.display = (name === 'welcome' || name === 'paywall') ? 'none' : 'flex';
    window.scrollTo(0, 0);
  },

  leavePlayers() {
    // Stop anything audible when navigating away
    this.stopBreakTimer();
    this.stopLearningTicker();
    window.AudioEngine?.stop();
    this.state.running = false;
    this.state.learningPlaying = false;
    this.state.learningStarted = false;
  },

  // ---------- Header / access ----------

  bindHeader() {
    document.getElementById('nav-dashboard')?.addEventListener('click', () => { this.leavePlayers(); this.showDashboard(); });
    document.getElementById('nav-settings')?.addEventListener('click', () => { this.leavePlayers(); this.showSettings(); });
  },

  renderAccessPill() {
    const pill = document.getElementById('access-pill');
    if (!pill) return;
    const level = window.getAccessLevel();
    pill.className = 'access-pill';
    pill.style.display = 'inline-block';
    if (level === 'reviewer') {
      const data = window.getReviewerData();
      pill.classList.add('pill-reviewer');
      pill.textContent = `★ ${data.label.toUpperCase()} ACCESS`;
    } else if (level === 'paid') {
      pill.classList.add('pill-paid');
      pill.textContent = 'FULL ACCESS';
    } else if (level === 'trial') {
      const days = window.trialDaysRemaining();
      pill.classList.add('pill-trial');
      pill.textContent = `TRIAL — ${days} DAY${days === 1 ? '' : 'S'} LEFT`;
    } else if (level === 'expired') {
      pill.classList.add('pill-expired');
      pill.textContent = 'TRIAL ENDED';
    } else {
      pill.style.display = 'none';
    }
  },

  // ---------- Welcome / paywall ----------

  bindWelcome() {
    document.getElementById('welcome-signup-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('welcome-name').value.trim();
      const email = document.getElementById('welcome-email').value.trim();
      if (!name || !email) return;
      window.startTrial(name, email);
      this.renderAccessPill();
      this.showDashboard();
    });
    this.bindCodeForm('welcome-code-link', 'welcome-code-form', 'welcome-code', 'welcome-code-error');
  },

  bindPaywall() {
    document.getElementById('paywall-monthly')?.addEventListener('click', () => window.goToStripePayment('monthly'));
    document.getElementById('paywall-annual')?.addEventListener('click', () => window.goToStripePayment('annual'));
    this.bindCodeForm('paywall-code-link', 'paywall-code-form', 'paywall-code', 'paywall-code-error');
  },

  bindCodeForm(linkId, formId, inputId, errorId) {
    const link = document.getElementById(linkId);
    const form = document.getElementById(formId);
    if (link && form) {
      link.addEventListener('click', () => {
        form.style.display = form.style.display === 'none' ? 'grid' : 'none';
        document.getElementById(inputId)?.focus();
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const result = window.activateAccessCode(document.getElementById(inputId).value);
        const error = document.getElementById(errorId);
        if (!result.ok) {
          if (error) { error.textContent = result.error; error.style.display = 'block'; }
          return;
        }
        if (error) error.style.display = 'none';
        this.renderAccessPill();
        this.showDashboard();
      });
    }
  },

  // ---------- Dashboard ----------

  bindDashboard() {
    document.getElementById('dash-learning-btn')?.addEventListener('click', () => {
      const enabled = document.getElementById('learning-toggle')?.checked;
      if (!enabled) { this.showSettings(); return; }
      this.openLearning();
    });
    document.getElementById('dash-edit-schedule')?.addEventListener('click', () => this.showSettings());
  },

  showDashboard() {
    this.renderGreeting();
    this.renderQuote();
    this.renderBreakGrid();
    this.renderLearningCard();
    this.renderScheduleList();
    this.showView('dashboard');
  },

  renderGreeting() {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const first = window.getUserFirstName();
    document.getElementById('dash-greeting').textContent = first ? `${timeOfDay}, ${first}.` : `${timeOfDay}.`;
    document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-AU', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  },

  renderQuote() {
    const quote = window.getMorningQuote?.(this.state.dayIndex);
    const card = document.getElementById('quote-card');
    if (!quote || !card) return;
    card.style.display = 'block';
    document.getElementById('dash-quote-text').textContent = quote.text;
    document.getElementById('dash-quote-author').textContent = `— ${quote.author}`;
  },

  renderBreakGrid() {
    const grid = document.getElementById('dash-break-grid');
    if (!grid) return;
    const doneToday = this.breaksCompletedToday();
    grid.innerHTML = '';
    Object.values(window.BREAKS || {}).forEach(b => {
      const done = doneToday.has(b.id);
      const card = document.createElement('button');
      card.className = 'dash-break-card' + (done ? ' done' : '');
      card.innerHTML = `
        ${done ? '<span class="done-badge">✓ Done today</span>' : ''}
        <div class="dash-break-icon">${BREAK_ICONS[b.id] || ''}</div>
        <p class="dash-break-name">${b.name}</p>
        <p class="dash-break-desc">${b.description}</p>
        <span class="dash-break-time">${Math.round(b.duration / 60)} min</span>`;
      card.addEventListener('click', () => {
        // One of each break per day — variety is the point. Reviewers are exempt for testing.
        if (done && !window.isReviewer()) {
          this.showNotice(
            `${b.name} is done for today`,
            `You've already completed the ${b.name} break today. Variety works better than repetition — pick a different reset, and ${b.name} will be ready again tomorrow.`
          );
          return;
        }
        this.openBreak(b.id);
      });
      grid.appendChild(card);
    });
  },

  breaksCompletedToday() {
    const history = JSON.parse(localStorage.getItem('reset_break_history') || '[]');
    const today = new Date().toDateString();
    return new Set(
      history.filter(h => new Date(h.completedAt).toDateString() === today).map(h => h.breakId)
    );
  },

  renderLearningCard() {
    const enabled = document.getElementById('learning-toggle')?.checked;
    const tag = document.getElementById('learning-status-tag');
    const teaser = document.getElementById('learning-teaser');
    const btn = document.getElementById('dash-learning-btn');
    if (!tag || !teaser || !btn) return;

    if (!enabled) {
      tag.textContent = 'Off';
      tag.className = 'tag tag-soft';
      teaser.textContent = 'One 3–5 minute audio episode a day — one idea, one story, one takeaway. Turn it on in Settings.';
      btn.textContent = 'Turn on in Settings';
      return;
    }
    tag.textContent = 'On';
    tag.className = 'tag';
    const learningState = this.getLearningState();
    const episode = learningState.topicGroup ? this.getTodaysShuffledEpisode(learningState) : null;
    if (episode) {
      teaser.innerHTML = `<strong>Today:</strong> ${episode.title} — ${episode.oneIdea}`;
      btn.textContent = "Open today's episode";
    } else {
      teaser.textContent = 'Pick a topic group to start your daily episodes.';
      btn.textContent = 'Choose topics';
    }
  },

  renderScheduleList() {
    const list = document.getElementById('dash-schedule-list');
    if (!list) return;
    const labels = [['slot-1', 'Morning reset'], ['slot-2', 'Midday reset'], ['slot-3', 'Afternoon reset']];
    list.innerHTML = labels.map(([id, label]) => {
      const value = document.getElementById(id)?.value || '—';
      return `<li><span>${label}</span><span class="sched-time">${this.formatClock(value)}</span></li>`;
    }).join('');
  },

  formatClock(hhmm) {
    if (!hhmm || !hhmm.includes(':')) return hhmm;
    const [h, m] = hhmm.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
  },

  // ---------- Break player ----------

  bindPlayer() {
    document.getElementById('player-back')?.addEventListener('click', () => { this.leavePlayers(); this.showDashboard(); });
    document.getElementById('player-start')?.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'dashboard') { this.leavePlayers(); this.showDashboard(); return; }
      this.startBreak();
    });
    document.getElementById('player-pause')?.addEventListener('click', () => this.togglePause());
    document.getElementById('player-skip')?.addEventListener('click', () => this.nextStep());
  },

  openBreak(breakId) {
    const breakDef = window.BREAKS[breakId];
    if (!breakDef) return;
    this.leavePlayers();
    this.state.currentBreak = breakDef;
    this.state.currentStepIndex = 0;
    this.state.secondsRemaining = breakDef.steps[0].duration;
    this.state.isPaused = false;
    this.state.midpointFired = false;

    document.getElementById('player-title').textContent = breakDef.name;
    document.getElementById('player-subtitle').textContent = breakDef.description;
    document.getElementById('player-quote').style.display = 'none';
    document.getElementById('player-audio-source').style.display = 'none';
    const startBtn = document.getElementById('player-start');
    startBtn.style.display = 'inline-flex';
    startBtn.textContent = 'Start';
    startBtn.dataset.action = 'start';
    document.getElementById('player-pause').style.display = 'none';
    document.getElementById('player-skip').style.display = 'none';
    document.getElementById('player-instruction').textContent = "Press Start when you're ready.";

    this.renderStepDots();
    this.renderTimer();
    this.showView('player');
  },

  renderStepDots() {
    const dots = document.getElementById('step-dots');
    if (!dots || !this.state.currentBreak) return;
    dots.innerHTML = this.state.currentBreak.steps.map((_, i) => {
      const cls = i < this.state.currentStepIndex ? 'done' : i === this.state.currentStepIndex ? 'active' : '';
      return `<span class="step-dot ${cls}"></span>`;
    }).join('');
  },

  startBreak() {
    document.getElementById('player-start').style.display = 'none';
    document.getElementById('player-pause').style.display = 'inline-flex';
    document.getElementById('player-pause').textContent = 'Pause';
    document.getElementById('player-skip').style.display = 'inline-flex';
    this.state.running = true;
    this.state.isPaused = false;

    // If pressing "Repeat" after completion, restart from step 1
    if (this.state.currentStepIndex >= this.state.currentBreak.steps.length) {
      this.state.currentStepIndex = 0;
      this.state.secondsRemaining = this.state.currentBreak.steps[0].duration;
      this.state.midpointFired = false;
      document.getElementById('player-quote').style.display = 'none';
      this.renderStepDots();
    }

    this.renderStep();
    this.narrateStep();
    this.stopBreakTimer();
    this.state.timer = setInterval(() => this.tick(), 1000);
  },

  togglePause() {
    this.state.isPaused = !this.state.isPaused;
    document.getElementById('player-pause').textContent = this.state.isPaused ? 'Resume' : 'Pause';
    if (this.state.isPaused) window.AudioEngine?.pause();
    else window.AudioEngine?.resume();
  },

  tick() {
    if (this.state.isPaused) return;
    this.state.secondsRemaining -= 1;

    const step = this.state.currentBreak?.steps?.[this.state.currentStepIndex];
    const total = step?.duration || 0;

    // Midpoint "keep going" cue — once per step, longer steps only
    if (!this.state.midpointFired && total >= 25 && this.state.secondsRemaining === Math.floor(total / 2)) {
      this.state.midpointFired = true;
      const narrationOn = document.getElementById('narration-toggle')?.checked;
      if (narrationOn !== false) window.AudioEngine?.narrate(window.AudioEngine.midpointCueSrc(), 'Keep going.');
    }

    if (this.state.secondsRemaining <= 0) { this.nextStep(); return; }
    this.renderTimer();
  },

  nextStep() {
    if (!this.state.running) return;
    this.state.currentStepIndex += 1;
    this.state.midpointFired = false;
    if (this.state.currentStepIndex >= this.state.currentBreak.steps.length) {
      this.completeBreak();
      return;
    }
    this.state.secondsRemaining = this.state.currentBreak.steps[this.state.currentStepIndex].duration;
    this.renderStepDots();
    this.renderStep();
    this.narrateStep();
  },

  renderStep() {
    const step = this.state.currentBreak?.steps?.[this.state.currentStepIndex];
    if (!step) return;
    document.getElementById('player-instruction').textContent = step.instruction;
    this.renderTimer();
  },

  renderTimer() {
    const breakDef = this.state.currentBreak;
    if (!breakDef) return;
    const step = breakDef.steps[this.state.currentStepIndex];
    document.getElementById('ring-time').textContent = this.formatTime(this.state.secondsRemaining);
    document.getElementById('ring-label').textContent = `Step ${this.state.currentStepIndex + 1} of ${breakDef.steps.length}`;
    const total = step?.duration || 1;
    const frac = Math.min(1, Math.max(0, 1 - this.state.secondsRemaining / total));
    document.getElementById('ring-progress').style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - frac));
  },

  narrateStep() {
    const step = this.state.currentBreak?.steps?.[this.state.currentStepIndex];
    if (!step) return;
    const narrationOn = document.getElementById('narration-toggle')?.checked;
    if (narrationOn === false) return;
    const src = window.AudioEngine?.breakStepSrc(this.state.currentBreak.id, this.state.currentStepIndex);
    window.AudioEngine?.narrate(src, step.narration || step.instruction);
    const sourceEl = document.getElementById('player-audio-source');
    if (sourceEl) {
      sourceEl.style.display = 'block';
      sourceEl.textContent = `🔊 Narration on — ${window.AudioEngine?.sourceLabel() || ''}`;
    }
  },

  completeBreak() {
    this.stopBreakTimer();
    this.state.running = false;
    window.AudioEngine?.stop();

    document.getElementById('ring-time').textContent = 'Done';
    document.getElementById('ring-label').textContent = 'Break complete';
    document.getElementById('ring-progress').style.strokeDashoffset = '0';
    document.getElementById('player-instruction').textContent = 'Good. Return to one clear next action.';
    document.getElementById('player-pause').style.display = 'none';
    document.getElementById('player-skip').style.display = 'none';
    const startBtn = document.getElementById('player-start');
    startBtn.style.display = 'inline-flex';
    if (window.isReviewer()) {
      startBtn.textContent = 'Repeat'; // reviewers can re-run anything for testing
      startBtn.dataset.action = 'start';
    } else {
      startBtn.textContent = 'Back to Dashboard'; // one of each break per day
      startBtn.dataset.action = 'dashboard';
    }
    document.getElementById('player-audio-source').style.display = 'none';
    this.renderStepDots();

    const quote = window.getDailyQuote?.(this.state.currentBreak.closingQuote?.category || 'general', this.state.dayIndex);
    if (quote) {
      document.getElementById('player-quote').style.display = 'block';
      document.getElementById('player-quote-text').textContent = `“${quote.text}” — ${quote.author}`;
    }

    const history = JSON.parse(localStorage.getItem('reset_break_history') || '[]');
    history.push({ breakId: this.state.currentBreak.id, completedAt: new Date().toISOString() });
    localStorage.setItem('reset_break_history', JSON.stringify(history.slice(-100)));
  },

  stopBreakTimer() {
    if (this.state.timer) clearInterval(this.state.timer);
    this.state.timer = null;
  },

  // ---------- Learning ----------

  bindLearning() {
    document.getElementById('learning-back')?.addEventListener('click', () => { this.leavePlayers(); this.showDashboard(); });
    document.getElementById('learning-play')?.addEventListener('click', () => this.playLearning());
    document.getElementById('learning-pause')?.addEventListener('click', () => this.pauseLearning());
    document.getElementById('learning-done')?.addEventListener('click', () => this.finishLearningForToday());
    document.getElementById('transcript-toggle')?.addEventListener('click', () => {
      const t = document.getElementById('learning-transcript');
      const showing = t.style.display !== 'none';
      t.style.display = showing ? 'none' : 'block';
      document.getElementById('transcript-toggle').textContent = showing ? 'Show transcript' : 'Hide transcript';
    });
    document.getElementById('reviewer-next-episode')?.addEventListener('click', () => this.reviewerNextEpisode());
    document.getElementById('reviewer-episode-select')?.addEventListener('change', (e) => {
      const episode = (window.LEARNING_EPISODES || []).find(ep => ep.id === e.target.value);
      if (episode) this.loadLearningEpisode(episode);
    });
  },

  getLearningState() {
    return JSON.parse(localStorage.getItem('reset_learning_state') || '{}');
  },

  saveLearningStateObj(state) {
    localStorage.setItem('reset_learning_state', JSON.stringify(state));
  },

  openLearning() {
    const learningState = this.getLearningState();
    if (!learningState.topicGroup) { this.openTopicPicker(); return; }
    const episode = this.getTodaysShuffledEpisode(learningState);
    if (!episode) { this.openTopicPicker(); return; }
    this.loadLearningEpisode(episode);
  },

  loadLearningEpisode(episode) {
    this.leavePlayers();
    const learningState = this.getLearningState();
    this.state.learningEpisode = episode;
    this.state.learningElapsed = learningState.elapsedForEpisode === episode.id ? (learningState.elapsed || 0) : 0;
    this.state.learningStarted = false;
    this.state.learningMode = null;

    document.getElementById('learning-title').textContent = episode.title;
    document.getElementById('learning-category').textContent = episode.category;
    document.getElementById('learning-duration').textContent = `~${Math.round(episode.duration / 60)} min listen`;
    document.getElementById('learning-idea').textContent = episode.oneIdea;
    document.getElementById('learning-transcript').textContent = episode.transcript || '';
    document.getElementById('learning-transcript').style.display = 'none';
    document.getElementById('transcript-toggle').textContent = 'Show transcript';
    document.getElementById('learning-audio-source').style.display = 'none';
    const playBtn = document.getElementById('learning-play');
    playBtn.style.display = 'inline-flex';
    playBtn.textContent = this.state.learningElapsed > 0 ? 'Resume' : 'Play';
    document.getElementById('learning-pause').style.display = 'none';

    const completedToday = this.isLearningDoneToday();
    const reviewer = window.isReviewer();
    const doneBtn = document.getElementById('learning-done');
    doneBtn.disabled = completedToday && !reviewer;
    doneBtn.textContent = completedToday && !reviewer ? 'Come back tomorrow' : 'Done for today';
    document.getElementById('learning-note').textContent = completedToday && !reviewer
      ? "That's today's episode done. A new one arrives tomorrow — curiosity is part of the design."
      : `Takeaway: ${episode.takeaway}`;

    // Reviewer tools: episode browser + skip-ahead
    const tools = document.getElementById('learning-reviewer-tools');
    if (tools) {
      tools.style.display = reviewer ? 'block' : 'none';
      if (reviewer) this.renderReviewerEpisodeSelect(episode.id);
    }

    this.renderLearningProgress();
    this.showView('learning');
  },

  renderReviewerEpisodeSelect(currentId) {
    const select = document.getElementById('reviewer-episode-select');
    if (!select) return;
    select.innerHTML = (window.LEARNING_EPISODES || []).map(ep =>
      `<option value="${ep.id}" ${ep.id === currentId ? 'selected' : ''}>${ep.title} (${ep.category})</option>`
    ).join('');
  },

  reviewerNextEpisode() {
    const episodes = window.LEARNING_EPISODES || [];
    const idx = episodes.findIndex(ep => ep.id === this.state.learningEpisode?.id);
    const next = episodes[(idx + 1) % episodes.length];
    if (next) this.loadLearningEpisode(next);
  },

  isLearningDoneToday() {
    const state = this.getLearningState();
    return !!(state.completedDates && state.completedDates[this.getTodayKey()]);
  },

  playLearning() {
    const episode = this.state.learningEpisode;
    if (!episode) return;
    this.state.learningPlaying = true;
    document.getElementById('learning-play').style.display = 'none';
    document.getElementById('learning-pause').style.display = 'inline-flex';

    if (this.state.learningStarted) {
      window.AudioEngine?.resume();
      if (this.state.learningMode === 'tts') this.startLearningTicker();
      return;
    }

    this.state.learningStarted = true;
    const mode = window.AudioEngine?.playEpisode(episode, this.state.learningElapsed, {
      onTimeUpdate: (current, duration) => {
        this.state.learningElapsed = Math.floor(current);
        this.renderLearningProgress(duration);
        this.persistLearningElapsed();
      },
      onEnded: () => this.learningEnded()
    });
    this.state.learningMode = mode;
    if (mode === 'tts') this.startLearningTicker();

    const sourceEl = document.getElementById('learning-audio-source');
    if (sourceEl) {
      sourceEl.style.display = 'block';
      sourceEl.textContent = `🔊 ${window.AudioEngine?.sourceLabel() || ''}`;
    }
  },

  startLearningTicker() {
    this.stopLearningTicker();
    this.state.learningTimer = setInterval(() => {
      if (!this.state.learningPlaying) return;
      this.state.learningElapsed += 1;
      if (this.state.learningElapsed >= (this.state.learningEpisode?.duration || 0)) {
        this.learningEnded();
        return;
      }
      this.renderLearningProgress();
      this.persistLearningElapsed();
    }, 1000);
  },

  stopLearningTicker() {
    if (this.state.learningTimer) clearInterval(this.state.learningTimer);
    this.state.learningTimer = null;
  },

  pauseLearning() {
    this.state.learningPlaying = false;
    this.stopLearningTicker();
    window.AudioEngine?.pause();
    document.getElementById('learning-play').style.display = 'inline-flex';
    document.getElementById('learning-play').textContent = 'Resume';
    document.getElementById('learning-pause').style.display = 'none';
    this.persistLearningElapsed();
  },

  learningEnded() {
    this.state.learningPlaying = false;
    this.stopLearningTicker();
    this.state.learningElapsed = this.state.learningEpisode?.duration || this.state.learningElapsed;
    this.renderLearningProgress();
    document.getElementById('learning-play').style.display = 'inline-flex';
    document.getElementById('learning-play').textContent = 'Play again';
    document.getElementById('learning-pause').style.display = 'none';
    this.state.learningStarted = false;
    this.state.learningElapsed = 0;
    this.persistLearningElapsed();
  },

  finishLearningForToday() {
    const state = this.getLearningState();
    if (!state.completedDates) state.completedDates = {};
    state.completedDates[this.getTodayKey()] = this.state.learningEpisode?.id;
    state.elapsed = 0;
    state.elapsedForEpisode = null;
    this.saveLearningStateObj(state);
    this.leavePlayers();
    this.showDashboard();
  },

  persistLearningElapsed() {
    if (!this.state.learningEpisode) return;
    const state = this.getLearningState();
    state.elapsed = this.state.learningElapsed;
    state.elapsedForEpisode = this.state.learningEpisode.id;
    this.saveLearningStateObj(state);
  },

  renderLearningProgress(realDuration) {
    const episode = this.state.learningEpisode;
    if (!episode) return;
    const duration = realDuration || episode.duration;
    const pct = Math.min(100, (this.state.learningElapsed / duration) * 100);
    document.getElementById('learning-progress-fill').style.width = pct + '%';
    document.getElementById('learning-progress-time').textContent =
      `${this.formatTime(this.state.learningElapsed)} / ${this.formatTime(Math.round(duration))}`;
  },

  // ---------- Topic picker ----------

  bindModals() {
    document.getElementById('topic-close')?.addEventListener('click', () => this.closeTopicPicker());
    document.querySelectorAll('.topic-group-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const state = this.getLearningState();
        state.topicGroup = btn.dataset.group;
        state.shuffleStart = new Date().toISOString();
        state.shuffleOrder = this.generateShuffleOrder(btn.dataset.group);
        state.completedDates = state.completedDates || {};
        this.saveLearningStateObj(state);
        this.closeTopicPicker();
        this.openLearning();
      });
    });
    document.getElementById('upgrade-close')?.addEventListener('click', () => {
      document.getElementById('upgrade-modal').style.display = 'none';
    });
    document.getElementById('upgrade-monthly')?.addEventListener('click', () => window.goToStripePayment('monthly'));
    document.getElementById('upgrade-annual')?.addEventListener('click', () => window.goToStripePayment('annual'));
  },

  openTopicPicker() { document.getElementById('topic-modal').style.display = 'flex'; },
  closeTopicPicker() { document.getElementById('topic-modal').style.display = 'none'; },

  getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  },

  generateShuffleOrder(topicGroup) {
    const groupMap = {
      'philosophy': ['philosophy', 'history'],
      'motivation': ['motivation', 'performance'],
      'science': ['science'],
      'leadership': ['leadership', 'productivity', 'culture'],
      'history': ['history'],
      'all': null
    };
    const categories = groupMap[topicGroup];
    const episodes = (window.LEARNING_EPISODES || []).filter(ep => !categories || categories.includes(ep.category));
    const indices = episodes.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return { group: topicGroup, episodeIds: episodes.map(ep => ep.id), order: indices };
  },

  getTodaysShuffledEpisode(learningState) {
    if (!learningState.shuffleOrder || !learningState.shuffleOrder.episodeIds) return null;
    const startDate = new Date(learningState.shuffleStart);
    const dayDiff = Math.max(0, Math.floor((new Date() - startDate) / 86400000));
    const order = learningState.shuffleOrder.order;
    const ids = learningState.shuffleOrder.episodeIds;
    if (!order || order.length === 0) return null;
    const episodeId = ids[order[dayDiff % order.length]];
    return (window.LEARNING_EPISODES || []).find(ep => ep.id === episodeId);
  },

  // ---------- Settings ----------

  bindSettings() {
    document.getElementById('settings-back')?.addEventListener('click', () => this.showDashboard());

    ['slot-1', 'slot-2', 'slot-3', 'learning-time-input'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => this.saveSettings());
    });

    document.getElementById('narration-toggle')?.addEventListener('change', (e) => {
      window.AudioEngine?.setEnabled(e.target.checked);
      this.saveSettings();
    });

    document.getElementById('learning-toggle')?.addEventListener('change', () => {
      this.toggleLearningConfig();
      this.saveSettings();
    });

    document.querySelectorAll('.voice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.AudioEngine?.setGender(btn.dataset.gender);
        document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`.voice-btn[data-gender="${btn.dataset.gender}"]`).forEach(b => b.classList.add('active'));
      });
    });

    document.getElementById('change-topic-btn')?.addEventListener('click', () => this.openTopicPicker());

    document.getElementById('settings-code-btn')?.addEventListener('click', () => {
      const result = window.activateAccessCode(document.getElementById('settings-code').value);
      const error = document.getElementById('settings-code-error');
      const success = document.getElementById('settings-code-success');
      if (!result.ok) {
        error.textContent = result.error; error.style.display = 'block'; success.style.display = 'none';
        return;
      }
      error.style.display = 'none';
      success.textContent = `${result.label} access activated — permanent, unrestricted.`;
      success.style.display = 'block';
      this.renderAccessPill();
      this.renderAccountList();
    });

    document.getElementById('reset-data-btn')?.addEventListener('click', () => {
      if (!confirm('This clears your schedule, history, and preferences from this browser. Continue?')) return;
      ['reset_trial', 'reset_full_access', 'reset_settings', 'reset_learning_state', 'reset_voice_settings', 'reset_break_history', 'reset_access_code']
        .forEach(k => localStorage.removeItem(k));
      window.location.reload();
    });
  },

  showSettings() {
    this.renderAccountList();
    this.toggleLearningConfig();
    this.showView('settings');
  },

  renderAccountList() {
    const list = document.getElementById('account-list');
    if (!list) return;
    const trial = window.getTrialData();
    const level = window.getAccessLevel();
    const accessText = {
      reviewer: `Reviewer — permanent, unrestricted`,
      paid: 'Full Access',
      trial: `Free trial — ${window.trialDaysRemaining()} day(s) left`,
      expired: 'Trial ended',
      none: '—'
    }[level];
    const rows = [];
    if (trial?.name) rows.push(['Name', trial.name]);
    if (trial?.email) rows.push(['Email', trial.email]);
    rows.push(['Access', accessText]);
    if (level === 'reviewer') rows.push(['Code', window.getReviewerData().code]);
    list.innerHTML = rows.map(([label, value]) =>
      `<li><span class="account-label">${label}</span><span class="account-value">${value}</span></li>`
    ).join('');
  },

  toggleLearningConfig() {
    const enabled = document.getElementById('learning-toggle')?.checked;
    const config = document.getElementById('learning-config');
    if (config) config.style.display = enabled ? 'grid' : 'none';
  },

  loadSettings() {
    const saved = JSON.parse(localStorage.getItem('reset_settings') || '{}');
    Object.entries(saved).forEach(([key, value]) => {
      const el = document.getElementById(key);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = !!value;
      else el.value = value;
    });
    this.toggleLearningConfig();

    // Sync audio engine with saved narration + voice preferences
    const narrationOn = document.getElementById('narration-toggle')?.checked;
    window.AudioEngine?.setEnabled(narrationOn !== false);
    const gender = window.AudioEngine?.gender || 'female';
    document.querySelectorAll(`.voice-btn[data-gender="${gender}"]`).forEach(b => b.classList.add('active'));
  },

  saveSettings() {
    const ids = ['slot-1', 'slot-2', 'slot-3', 'learning-time-input', 'narration-toggle', 'learning-toggle', 'reminder-toggle'];
    const settings = {};
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      settings[id] = el.type === 'checkbox' ? el.checked : el.value;
    });
    localStorage.setItem('reset_settings', JSON.stringify(settings));
  },

  // ---------- Break-time alerts ----------

  bindReminders() {
    document.getElementById('reminder-toggle')?.addEventListener('change', (e) => {
      if (e.target.checked) this.requestNotifyPermission();
      this.saveSettings();
    });
    // Browsers only allow the permission prompt on a user gesture — piggyback on the first click
    document.addEventListener('pointerdown', () => {
      if (document.getElementById('reminder-toggle')?.checked) this.requestNotifyPermission();
    }, { once: true });
  },

  requestNotifyPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  },

  startReminderTicker() {
    setInterval(() => this.checkReminders(), 15000);
  },

  checkReminders() {
    if (!window.hasFullAccess?.()) return;
    if (document.getElementById('reminder-toggle')?.checked === false) return;
    if (this.state.running) return; // already mid-break

    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const key = this.getTodayKey();
    const stored = JSON.parse(localStorage.getItem('reset_reminders_fired') || '{}');
    const firedToday = stored[key] || [];

    [['slot-1', 'Morning reset'], ['slot-2', 'Midday reset'], ['slot-3', 'Afternoon reset']].forEach(([id, label]) => {
      const slotTime = document.getElementById(id)?.value;
      if (slotTime === hhmm && !firedToday.includes(id)) {
        firedToday.push(id);
        localStorage.setItem('reset_reminders_fired', JSON.stringify({ [key]: firedToday }));
        this.fireReminder(label);
      }
    });
  },

  fireReminder(label) {
    const message = `${label} — three minutes with yourself. Pick a break.`;
    if ('Notification' in window && Notification.permission === 'granted') {
      const n = new Notification('The Daily Reset', { body: message });
      n.onclick = () => { window.focus(); this.leavePlayers(); this.showDashboard(); n.close(); };
    }
    this.showToast('Time for your reset', message, 'Pick a break', () => { this.leavePlayers(); this.showDashboard(); });
  },

  showToast(title, message, actionLabel, action) {
    document.querySelector('.toast')?.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<strong>${title}</strong><p>${message}</p>
      <div class="toast-actions">
        ${actionLabel ? '<button class="btn-primary toast-action"></button>' : ''}
        <button class="btn-secondary toast-dismiss">Dismiss</button>
      </div>`;
    if (actionLabel) {
      const btn = el.querySelector('.toast-action');
      btn.textContent = actionLabel;
      btn.addEventListener('click', () => { el.remove(); if (action) action(); });
    }
    el.querySelector('.toast-dismiss').addEventListener('click', () => el.remove());
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 45000);
  },

  // ---------- Notice popout ----------

  bindNotice() {
    document.getElementById('notice-ok')?.addEventListener('click', () => {
      document.getElementById('notice-modal').style.display = 'none';
    });
  },

  showNotice(title, message) {
    document.getElementById('notice-title').textContent = title;
    document.getElementById('notice-message').textContent = message;
    document.getElementById('notice-modal').style.display = 'flex';
  },

  // ---------- Utils ----------

  formatTime(seconds) {
    const s = Math.max(0, seconds || 0);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
};

document.addEventListener('DOMContentLoaded', () => ResetApp.init());
if (typeof window !== 'undefined') window.ResetApp = ResetApp;
