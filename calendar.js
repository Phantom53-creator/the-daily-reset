// calendar.js — "Add to Calendar" reminders (no backend)
// Generates a downloadable .ics file with three recurring DAILY events, one per
// break slot in the user's plan. Their calendar app (Apple / Outlook / Google)
// already launches at boot and fires alerts reliably — so the reminder reaches
// them even when the app isn't open, on computer and phone, with no OS setup.

const CalendarReminders = {
  // Pad to two digits
  p2(n) { return String(n).padStart(2, '0'); },

  // UTC timestamp (for DTSTAMP): 20260709T130000Z
  toICSDate(d) {
    return `${d.getUTCFullYear()}${this.p2(d.getUTCMonth() + 1)}${this.p2(d.getUTCDate())}T${this.p2(d.getUTCHours())}${this.p2(d.getUTCMinutes())}${this.p2(d.getUTCSeconds())}Z`;
  },

  // FLOATING local timestamp (for DTSTART/DTEND): 20260710T100000 — no Z, no
  // timezone. Calendars treat this as "10:00 in the viewer's local time," so a
  // daily reminder fires at the same wall-clock time wherever the customer is.
  toICSFloating(d) {
    return `${d.getFullYear()}${this.p2(d.getMonth() + 1)}${this.p2(d.getDate())}T${this.p2(d.getHours())}${this.p2(d.getMinutes())}${this.p2(d.getSeconds())}`;
  },

  // Escape text per RFC 5545
  esc(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  },

  // Build the first occurrence Date for a "HH:MM" wall-clock time — today if the
  // time is still ahead, otherwise tomorrow, so the series doesn't fire in the past.
  firstOccurrence(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    if (d <= now) d.setDate(d.getDate() + 1);
    return d;
  },

  // Wrap long ICS lines at 75 octets (spec requirement for broad compatibility)
  fold(line) {
    if (line.length <= 73) return line;
    const chunks = [];
    let i = 0;
    while (i < line.length) {
      chunks.push((i === 0 ? '' : ' ') + line.substr(i, i === 0 ? 73 : 72));
      i += (i === 0 ? 73 : 72);
    }
    return chunks.join('\r\n');
  },

  // Build one recurring VEVENT for a break slot (or the learning slot, kind:'learning')
  buildEvent(slot, index) {
    const start = this.firstOccurrence(slot.time);
    const b = window.BREAKS?.[slot.breakId];
    const isLearning = slot.kind === 'learning';
    const durationMin = isLearning ? 5 : (b ? Math.round(b.duration / 60) : 5);
    const end = new Date(start.getTime() + durationMin * 60000);
    const now = new Date();
    // Stable across time-of-day AND year changes, unlike the old
    // index+time+year UID — that baked the exact HH:MM and current year in,
    // so changing a reminder's time (or just a new calendar year rolling
    // over) silently produced a SECOND event on re-import instead of
    // updating the original, since calendar apps match by UID. slot.id is
    // the plan slot's fixed identity ('slot-1'/'slot-2'/'slot-3'/'learning'),
    // set once and never changed by editing the time.
    const uid = `reset-${slot.id || index}@thedailyreset`;
    const title = `The Daily Reset — ${slot.label}`;
    const desc = isLearning
      ? `Time for today's Lunch Break Learning episode — one idea, one story, one takeaway (3–5 min). Open the app: ${this.appUrl()}`
      : b
        ? `Time for your ${b.name} break (${durationMin} min). ${b.description} Open the app: ${this.appUrl()}`
        : `Time for your reset. Open the app: ${this.appUrl()}`;

    return [
      'BEGIN:VEVENT',
      this.fold(`UID:${uid}`),
      `DTSTAMP:${this.toICSDate(now)}`,
      `DTSTART:${this.toICSFloating(start)}`,
      `DTEND:${this.toICSFloating(end)}`,
      'RRULE:FREQ=DAILY',
      this.fold(`SUMMARY:${this.esc(title)}`),
      this.fold(`DESCRIPTION:${this.esc(desc)}`),
      this.fold(`URL:${this.appUrl()}`),
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'TRIGGER:PT0M',
      this.fold(`DESCRIPTION:${this.esc(title)}`),
      'END:VALARM',
      'END:VEVENT'
    ].join('\r\n');
  },

  appUrl() {
    // Use the live app URL if we're hosted; fall back to the current origin.
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '') {
      return 'https://the-daily-reset-woad.vercel.app/app.html';
    }
    return window.location.origin + '/app.html';
  },

  // Build the full .ics document from an array of plan slots ({time,label,breakId})
  buildICS(slots) {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//The Daily Reset//Break Reminders//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      this.fold('X-WR-CALNAME:The Daily Reset'),
      ...slots.map((s, i) => this.buildEvent(s, i)),
      'END:VCALENDAR'
    ];
    return lines.join('\r\n');
  },

  // Whether this browser gets WebKit's native "Add to Calendar" handoff for
  // text/calendar content instead of a forced Downloads-folder save. True on
  // iOS for ANY browser there (Apple requires every iOS browser — Chrome,
  // Firefox, Edge included — to run on WebKit under the hood), and on macOS
  // specifically for Safari (Mac Chrome/Firefox use their own engines, not
  // WebKit, so they don't get this). There's no feature-detection API for
  // "does this browser show a native calendar-add sheet" — UA sniffing is the
  // standard, accepted approach here since nothing else can answer it.
  supportsNativeAdd() {
    const ua = navigator.userAgent;
    // iPadOS 13+ reports navigator.platform as 'MacIntel' like a real Mac —
    // maxTouchPoints is the standard way to tell an iPad apart from a Mac.
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) return true;
    const isMac = /Macintosh/.test(ua) && navigator.maxTouchPoints <= 1;
    const isSafariBrand = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|CriOS|FxiOS/.test(ua);
    return isMac && isSafariBrand;
  },

  // Trigger the calendar add. Returns 'native' or 'download' so the caller
  // can show the right follow-up message for what actually just happened.
  download(slots) {
    const ics = this.buildICS(slots);

    if (this.supportsNativeAdd()) {
      // No `download` attribute — a plain data: URL opened this way lets
      // Safari/WebKit recognize the text/calendar content and offer its own
      // native Add-to-Calendar handoff, instead of forcing a save to the
      // Downloads folder that the customer then has to go find and open.
      const dataUrl = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return 'native';
    }

    // Chrome/Edge/Firefox on Windows, Android, and non-Safari Mac have no
    // equivalent inline handoff — this is the same download-then-open flow
    // as any other file download, which already worked fine here.
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'the-daily-reset.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return 'download';
  }
};

if (typeof window !== 'undefined') window.CalendarReminders = CalendarReminders;
