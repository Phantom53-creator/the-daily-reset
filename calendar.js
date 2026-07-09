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

  // Build one recurring VEVENT for a break slot
  buildEvent(slot, index) {
    const start = this.firstOccurrence(slot.time);
    const b = window.BREAKS?.[slot.breakId];
    const durationMin = b ? Math.round(b.duration / 60) : 5;
    const end = new Date(start.getTime() + durationMin * 60000);
    const now = new Date();
    const uid = `reset-${index}-${slot.time.replace(':', '')}-${start.getFullYear()}@thedailyreset`;
    const title = `The Daily Reset — ${slot.label}`;
    const desc = b
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

  // Trigger a download of the .ics file
  download(slots) {
    const ics = this.buildICS(slots);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'the-daily-reset.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};

if (typeof window !== 'undefined') window.CalendarReminders = CalendarReminders;
