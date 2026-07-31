#!/usr/bin/env node
// tts-generate.js — The Daily Reset voice generator (Speechify TTS — PRODUCTION PROVIDER)
//
// Speechify is what every live voice in the app actually is: Imogen (female)
// and Edmund (male) for break steps + quotes, Marian/Richard for learning
// episodes. Telnyx was evaluated early on and abandoned after it couldn't be
// gotten working reliably — --provider defaults to speechify for exactly that
// reason, so a bare command without --provider matches what's actually live.
// ElevenLabs was also evaluated (voice-tests/) but never shipped. Telnyx and
// ElevenLabs support stay in this file only for side-by-side comparison via
// --provider=telnyx|elevenlabs --label=<name> (never the live audio/ folder)
// — never assume either is what's live without checking voice-tests/index.json
// or git history first.
//
// WHY BREAK STEPS ARE BUILT DIFFERENTLY FROM QUOTES/EPISODES:
// Each break step's on-screen timer and countdowns are built from a `cues`
// array in breaks.js — {t, say, rate} — where "five", "four", "three"... are
// each meant to land on their own second. Rather than depend on any one
// provider's SSML <break> tags being reliable enough for that (a per-provider
// gamble this pipeline deliberately avoids), this script never uses SSML for
// cue timing at all, regardless of provider. Instead, for break steps it:
//   1. Synthesizes each cue as its own short clip
//   2. Measures its real spoken length (ffprobe)
//   3. Pads it with exact silence so the NEXT cue still starts on schedule
//   4. Concatenates everything (ffmpeg) into one continuous step MP3
// Quotes and learning episodes have no such timing constraint, so those are
// a single continuous TTS call per script.
//
// QA GATE (mandatory, cannot be skipped): a break step used to be considered
// "done" once its total duration matched breaks.js's configured timer — but a
// file can be exactly the right LENGTH while still containing many seconds of
// dead air in the middle or at the end (this shipped undetected for a full
// session, only found by manually running silence-detection on every file
// after the fact). Every break-step generation now runs the same
// waveform-level check automatically before the file is ever written to its
// real path: it's assembled to a temp file first, analyzed for internal
// silence gaps and speed-compression, and only promoted to the live path if
// it passes. A failing file is deleted, not shipped, and the run exits
// non-zero. Defaults: max silence gap 3.0s, max speed-up 1.10x — override
// with --max-silence-gap=<seconds> / --max-compression=<ratio> for a
// deliberate exception. Re-check existing files on disk (no API key, no
// regeneration) with --qa-only, e.g. to verify the whole library after
// changing these thresholds:
//   node tts-generate.js --breaks=all --gender=female --qa-only
//
// USAGE (provider defaults to speechify — the live production provider)
//   node tts-generate.js --voice="imogen_32" --gender=female --all
//   node tts-generate.js --voice="..." --gender=female --breaks
//   node tts-generate.js --voice="..." --gender=female --breaks=eyes,shoulders
//   node tts-generate.js --voice="..." --gender=female --breaks=eyes-step-0
//   node tts-generate.js --voice="edmund" --gender=male --learning=lunch-001,lunch-002
//   node tts-generate.js --voice="..." --gender=female --quotes
//   node tts-generate.js --voice="..." --gender=female --all --dry-run
//   node tts-generate.js --voice="..." --gender=female --all --force
//   node tts-generate.js --voice="..." --gender=female --all --mirror-dir=~/Desktop/voice-exports
//
// COMPARISON MODE (Telnyx / ElevenLabs — evaluated, neither is live)
//   --provider=telnyx|elevenlabs|speechify   (default: speechify)
//   --label=<name>   writes into voice-tests/<name>/ instead of the live
//                     audio/ folder — nothing here ever touches the app or
//                     overwrites another platform's test files, and the live
//                     audio-manifest.js is never touched by a labeled run.
//   node tts-generate.js --provider=elevenlabs --voice="<voice_id>" --gender=female --breaks=eyes --label=elevenlabs-test1
//   Then open voice-compare.html to listen to every labeled test side by side.
//
// By default, any file that already exists is left alone — so re-running
// this after adding new break steps, quotes, or learning episodes only
// synthesizes what's new. That's the "semi-automatic update" workflow: add
// content to breaks.js / quotes.js / learning.js, then re-run this command.
//
// API KEYS — never paste one into chat or a CLI flag. Either export the env
// var in your shell, or use the matching setup-*.sh script, which writes to
// an untracked .env file read automatically:
//   Telnyx:     TELNYX_API_KEY      / .telnyx.env
//   ElevenLabs: ELEVENLABS_API_KEY  / .elevenlabs.env
//   Speechify:  SPEECHIFY_API_KEY   / .speechify.env

'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = __dirname;

// ---------- CLI args ----------

function parseArgs(argv) {
  const args = { breaks: null, learning: null, quotes: null, words: null, all: false, dryRun: false, force: false, provider: 'speechify', qaOnly: false };
  for (const raw of argv) {
    const [flag, ...rest] = raw.replace(/^--/, '').split('=');
    const value = rest.join('=');
    if (flag === 'all') args.all = true;
    else if (flag === 'breaks') args.breaks = value ? value.split(',').map(s => s.trim()) : 'all';
    else if (flag === 'learning') args.learning = value ? value.split(',').map(s => s.trim()) : 'all';
    else if (flag === 'words') args.words = value ? value.split(',').map(s => s.trim()) : 'all';
    else if (flag === 'quotes') args.quotes = value ? value.split(',').map(s => s.trim()) : 'all';
    else if (flag === 'voice') args.voice = value;
    else if (flag === 'gender') args.gender = value;
    else if (flag === 'speed') args.speed = parseFloat(value);
    else if (flag === 'count-speed') args.countSpeed = parseFloat(value);
    else if (flag === 'dry-run') args.dryRun = true;
    else if (flag === 'force') args.force = true;
    else if (flag === 'mirror-dir') args.mirrorDir = value;
    else if (flag === 'provider') args.provider = value;
    else if (flag === 'label') args.label = value;
    else if (flag === 'model') args.model = value;
    else if (flag === 'pitch') args.pitch = value;
    else if (flag === 'rate') args.rate = value;
    else if (flag === 'emotion') args.emotion = value;
    else if (flag === 'max-silence-gap') args.maxSilenceGap = parseFloat(value);
    else if (flag === 'max-compression') args.maxCompression = parseFloat(value);
    else if (flag === 'qa-only') args.qaOnly = true;
  }
  return args;
}

function printUsageAndExit(message) {
  if (message) console.error('\n' + message + '\n');
  console.error(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 71).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(1);
}

// ---------- Load app data (breaks.js / quotes.js / learning.js) ----------
// These files do `window.X = X` at the bottom guarded by `typeof window`,
// so under plain Node we strip that guard and export directly.

function loadDataModule(filename, exportName) {
  const src = fs.readFileSync(path.join(ROOT, filename), 'utf8')
    .replace(/if \(typeof window[\s\S]*$/, '');
  const mod = { exports: {} };
  new Function('module', 'exports', src + `\nmodule.exports = ${exportName};`)(mod, mod.exports);
  return mod.exports;
}

const BREAKS = loadDataModule('breaks.js', 'BREAKS');
const QUOTES = loadDataModule('quotes.js', 'QUOTES');
const LEARNING_EPISODES = loadDataModule('learning.js', 'LEARNING_EPISODES');
const WORDS = loadDataModule('words.js', 'WORDS');

// Premium break-sequence variants live outside build/ entirely (sibling
// premium-content/ dir, plain CommonJS, same reasoning as db-tools/) so
// there's no path by which they could end up in the public repo by accident.
// Optional — a checkout without that sibling directory just gets none.
const PREMIUM_BREAKS_PATH = path.join(ROOT, '..', 'premium-content', 'premium-breaks.js');
const PREMIUM_BREAKS = fs.existsSync(PREMIUM_BREAKS_PATH) ? require(PREMIUM_BREAKS_PATH) : {};

// Extract the exact quote lead-in line from app.js so it never drifts out of
// sync with what the app actually speaks.
const appJsSrc = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const introMatch = appJsSrc.match(/QUOTE_INTRO:\s*"((?:[^"\\]|\\.)*)"/);
const QUOTE_INTRO = introMatch ? introMatch[1].replace(/\\"/g, '"').replace(/\\'/g, "'") : "To finish, here's a thought worth carrying with you.";
const bridgeMatch = appJsSrc.match(/LEARNING_BRIDGE:\s*"((?:[^"\\]|\\.)*)"/);
const LEARNING_BRIDGE = bridgeMatch ? bridgeMatch[1].replace(/\\"/g, '"').replace(/\\'/g, "'") : "Now, on to today's learning.";

// ---------- Build the full catalog of generatable items ----------

function buildCatalog() {
  const items = [];

  // clipId lets a step reuse an already-generated clip instead of always
  // being tied to its position in one specific sequence — needed so a future
  // 10-variants-per-topic expansion can share audio for content that repeats
  // across sequences rather than duplicating it. Steps without a clipId keep
  // today's exact positional filename, so existing content is untouched.
  // Premium variants (premium-content/premium-breaks.js) go through the exact
  // same catalog/QA pipeline as free breaks, tagged `premium: true` so main()
  // can refuse to ever write them anywhere but voice-tests/ (see --label check).
  const allBreakSources = [
    ...Object.entries(BREAKS).map(([id, brk]) => [id, brk, false]),
    ...Object.entries(PREMIUM_BREAKS).map(([id, brk]) => [id, brk, true])
  ];

  const clipGroups = new Map(); // clipId -> [{ breakId, i, step }]
  for (const [breakId, brk] of allBreakSources) {
    brk.steps.forEach((step, i) => {
      const clipId = step.clipId || `${breakId}-step${i + 1}`;
      if (!clipGroups.has(clipId)) clipGroups.set(clipId, []);
      clipGroups.get(clipId).push({ breakId, i, step });
    });
  }
  // Integrity check: a clipId is only safe to reuse if every step referencing
  // it is content-identical — otherwise a shared clip would silently carry
  // the wrong duration/pacing for whichever sequence didn't author it.
  for (const [clipId, refs] of clipGroups) {
    if (refs.length < 2) continue;
    const [first, ...rest] = refs;
    const firstKey = JSON.stringify({ duration: first.step.duration, cues: first.step.cues });
    for (const ref of rest) {
      const key = JSON.stringify({ duration: ref.step.duration, cues: ref.step.cues });
      if (key !== firstKey) {
        throw new Error(
          `clipId "${clipId}" is used by both ${first.breakId}-step${first.i + 1} and ${ref.breakId}-step${ref.i + 1} ` +
          `but they have different duration/cues — clipIds must be content-identical across every step that uses them. ` +
          `Give the variant a new clipId instead of reusing this one.`
        );
      }
    }
  }

  for (const [breakId, brk, premium] of allBreakSources) {
    brk.steps.forEach((step, i) => {
      const clipId = step.clipId || `${breakId}-step${i + 1}`;
      items.push({
        kind: 'break',
        id: `${breakId}-step-${i}`,
        groupId: breakId,
        clipId,
        premium,
        label: `${premium ? 'PREMIUM — ' : ''}${brk.name} — step ${i + 1}: ${step.instruction}`,
        filePath: g => `audio/breaks/${clipId}-${g}.mp3`,
        duration: step.duration,
        cues: step.cues
      });
    });
  }

  items.push({
    kind: 'quote',
    id: 'quote-intro',
    groupId: 'quote-intro',
    label: 'Closing-quote lead-in',
    filePath: g => `audio/quotes/quote-intro-${g}.mp3`,
    text: QUOTE_INTRO
  });
  for (const [category, arr] of Object.entries(QUOTES)) {
    arr.forEach((q, i) => {
      const id = `quote-${category}-${i}`;
      items.push({
        kind: 'quote',
        id,
        groupId: id,
        label: `${category} quote ${i}: "${q.text.slice(0, 50)}${q.text.length > 50 ? '…' : ''}" — ${q.author}`,
        filePath: g => `audio/quotes/${id}-${g}.mp3`,
        text: `${q.text} — ${q.author}.`
      });
    });
  }

  for (const ep of LEARNING_EPISODES) {
    items.push({
      kind: 'learning',
      id: ep.id,
      groupId: ep.id,
      label: `${ep.title} (${ep.category})`,
      filePath: g => `audio/learning/${ep.id}-${g}.mp3`,
      text: ep.transcript
    });
  }

  for (const w of WORDS) {
    items.push({
      kind: 'word',
      id: w.id,
      groupId: w.id,
      label: `Today's Word — ${w.word}`,
      filePath: g => `audio/words/${w.id}-${g}.mp3`,
      text: `Today's word is ${w.word}. ${w.definition} For example: ${w.example}`
    });
  }

  items.push({
    kind: 'word',
    id: 'bridge',
    groupId: 'bridge',
    label: 'Learning bridge — Today\'s Word → episode transition',
    filePath: g => `audio/words/bridge-${g}.mp3`,
    text: LEARNING_BRIDGE
  });

  return items;
}

// ---------- Selection ----------

function selectItems(catalog, args) {
  // Same rule as the 'all' wildcard below: bulk/wildcard selection means all
  // FREE content — premium variants only ever come in via an explicit id.
  if (args.all) return catalog.filter(i => !i.premium);

  const selected = [];
  const pick = (kind, selector) => {
    if (!selector) return;
    const pool = catalog.filter(i => i.kind === kind);
    if (selector === 'all') {
      // The "all" wildcard means "all FREE content" — premium variants only
      // ever get pulled in by their exact id (e.g. --breaks=eyes-v2), never
      // swept up in a bulk regeneration/regression-check of the live catalog.
      selected.push(...pool.filter(i => !i.premium));
      return;
    }
    selector.forEach(want => {
      const matches = pool.filter(i => i.id === want || i.groupId === want);
      if (matches.length === 0) console.warn(`  ! No ${kind} item matches "${want}" — skipping`);
      selected.push(...matches);
    });
  };
  pick('break', args.breaks);
  pick('quote', args.quotes);
  pick('learning', args.learning);
  pick('word', args.words);

  // De-dupe by output identity, not just catalog id — a break/group selector
  // can match the same item twice, AND two different steps can now share a
  // clipId (same output file), which would otherwise queue the same TTS
  // generation twice in one run.
  const seen = new Set();
  return selected.filter(i => {
    const key = i.kind === 'break' ? `break:${i.clipId}` : i.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ---------- Provider-aware API key loading ----------

const PROVIDER_ENV = {
  telnyx: { file: '.telnyx.env', varName: 'TELNYX_API_KEY' },
  elevenlabs: { file: '.elevenlabs.env', varName: 'ELEVENLABS_API_KEY' },
  speechify: { file: '.speechify.env', varName: 'SPEECHIFY_API_KEY' }
};

function readApiKey(provider) {
  const cfg = PROVIDER_ENV[provider];
  if (!cfg) throw new Error(`Unknown provider "${provider}" — expected telnyx, elevenlabs, or speechify.`);
  const envFile = path.join(ROOT, cfg.file);
  if (fs.existsSync(envFile)) {
    const line = fs.readFileSync(envFile, 'utf8').split('\n').find(l => l.trim().startsWith(cfg.varName + '='));
    if (line) return line.split('=').slice(1).join('=').trim();
  }
  return process.env[cfg.varName];
}

// ---------- Per-provider TTS calls ----------
// Each returns a Promise<Buffer> of raw audio bytes for one line of text.
// `format` is always 'wav' (per-cue break synthesis, needs lossless
// intermediate audio) or 'mp3' (continuous quotes/episodes, one-shot).

function callTelnyxTTS(apiKey, text, voice, speed, format = 'mp3') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      text,
      voice,
      output_type: 'binary_output',
      // sampling_rate forced explicitly (not left to each model's own default)
      // so every per-cue WAV shares one consistent format going into ffmpeg concat.
      telnyx: { response_format: format, voice_speed: speed, sampling_rate: PCM_RATE }
    });
    const req = https.request({
      hostname: 'api.telnyx.com',
      path: '/v2/text-to-speech/speech',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (res.statusCode !== 200) {
          reject(new Error(`Telnyx TTS ${res.statusCode}: ${buf.toString('utf8').slice(0, 500)}`));
        } else {
          resolve(buf);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ElevenLabs — POST /v1/text-to-speech/{voice_id}?output_format=...
// Auth is the xi-api-key header (not Authorization: Bearer). voice_settings.speed
// is ElevenLabs' equivalent of Telnyx's voice_speed. Response is raw audio bytes
// regardless of format, so handling is otherwise identical to the Telnyx call.
function callElevenLabsTTS(apiKey, text, voiceId, speed, format = 'mp3') {
  return new Promise((resolve, reject) => {
    const outputFormat = format === 'wav' ? `wav_${PCM_RATE}` : 'mp3_44100_128';
    const body = JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { speed: speed || 1.0 }
    });
    const req = https.request({
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=${encodeURIComponent(outputFormat)}`,
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (res.statusCode !== 200) {
          reject(new Error(`ElevenLabs TTS ${res.statusCode}: ${buf.toString('utf8').slice(0, 500)}`));
        } else {
          resolve(buf);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Speechify — POST /v1/audio/speech. Two things differ from Telnyx/ElevenLabs:
// (1) the response is JSON with base64-encoded audio (audio_data field), not
// raw bytes — everything else in this script expects a raw Buffer, so this
// decodes it before returning. (2) there's no speed/rate parameter in their
// API at all (Speechify's docs say pacing is SSML-only) — `speed` is accepted
// here for a consistent function signature but intentionally unused; the
// compression-to-fit step in generateBreakStep still works fine regardless,
// since that happens locally after the audio comes back.
// XML-escape text before embedding it in SSML — otherwise a stray &, <, > in
// a script would break the markup.
function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// Wraps text in Speechify's documented SSML tags for pitch/rate/emotion:
//   <prosody pitch="-10%" rate="-4%">...</prosody>  and  <speechify:style emotion="relaxed">...</speechify:style>
// pitch and rate share one <prosody> tag (both are valid attributes on it);
// emotion is a separate <speechify:style> wrapper, nested inside.
// Speechify auto-detects SSML vs plain text on the `input` field — no separate flag needed.
function wrapSpeechifySSML(text, pitch, rate, emotion) {
  if (!pitch && !rate && !emotion) return text;
  let inner = escapeXml(text);
  if (emotion) inner = `<speechify:style emotion="${emotion}">${inner}</speechify:style>`;
  if (pitch || rate) {
    const attrs = [pitch && `pitch="${pitch}"`, rate && `rate="${rate}"`].filter(Boolean).join(' ');
    inner = `<prosody ${attrs}>${inner}</prosody>`;
  }
  return `<speak>${inner}</speak>`;
}

function callSpeechifyTTS(apiKey, text, voiceId, speed, format = 'mp3', opts = {}) {
  return new Promise((resolve, reject) => {
    // Speechify's output formats are a fixed enum, and 44100 isn't in it for
    // either container: WAV only supports 24000/48000 Hz, and MP3 tops out at
    // 24000 Hz entirely (no 44100 option at any bitrate). For WAV we request
    // 48000 and let the downstream concat-filter step (which already resamples
    // per-segment) bring it down to PCM_RATE, same as it does for Telnyx voices
    // that ignore sampling_rate. For MP3 (quotes/learning — written straight to
    // disk with no resampling pass) we just take the best the enum allows:
    // 24000 Hz at the top 192kbps bitrate.
    const outputFormat = format === 'wav' ? 'wav_48000' : 'mp3_24000_192';
    const body = JSON.stringify({
      input: wrapSpeechifySSML(text, opts.pitch, opts.rate, opts.emotion),
      voice_id: voiceId,
      model: opts.model || 'simba-3.2',
      audio_format: format === 'wav' ? 'wav' : 'mp3',
      output_format: outputFormat
    });
    const req = https.request({
      hostname: 'api.speechify.ai',
      path: '/v1/audio/speech',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (res.statusCode !== 200) {
          reject(new Error(`Speechify TTS ${res.statusCode}: ${buf.toString('utf8').slice(0, 500)}`));
          return;
        }
        try {
          const json = JSON.parse(buf.toString('utf8'));
          resolve(Buffer.from(json.audio_data, 'base64'));
        } catch (e) {
          reject(new Error(`Speechify TTS: couldn't parse response as JSON — ${e.message}. Raw: ${buf.toString('utf8').slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Single entry point generation code calls — routes to whichever provider
// was selected on the command line.
function callProviderTTS(provider, apiKey, text, voice, speed, format, opts = {}) {
  if (provider === 'telnyx') return callTelnyxTTS(apiKey, text, voice, speed, format);
  if (provider === 'elevenlabs') return callElevenLabsTTS(apiKey, text, voice, speed, format);
  if (provider === 'speechify') return callSpeechifyTTS(apiKey, text, voice, speed, format, opts);
  throw new Error(`Provider "${provider}" isn't wired up yet.`);
}

// ---------- ffmpeg helpers ----------

function ffprobeDuration(filePath) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', filePath]);
  return parseFloat(out.toString().trim());
}

// Waveform-level QA — finds actual silence inside a file, not just whether its
// total duration matches a configured timer. A file can be exactly the right
// length while still containing many seconds of dead air in the middle or at
// the end (this shipped undetected for a full session because only duration
// was ever checked). Parses ffmpeg's silencedetect filter output from stderr.
function analyzeAudioFile(filePath, { silenceDb = -35, minGapSeconds = 1.0 } = {}) {
  // spawnSync (not execFileSync) — execFileSync only returns/throws with
  // stdout captured on success; on a clean exit its stderr is silently
  // discarded, and silencedetect's actual output always goes to stderr. That
  // meant a passing file's real gap data was never read at all (only ever
  // seen if the process happened to throw). spawnSync always gives back both
  // streams regardless of exit status.
  const result = spawnSync('ffmpeg', ['-i', filePath, '-af', `silencedetect=noise=${silenceDb}dB:d=${minGapSeconds}`, '-f', 'null', '-']);
  const stderr = result.stderr ? result.stderr.toString() : '';
  if (!stderr.includes('silencedetect') && result.status !== 0) {
    throw new Error(`ffmpeg failed analyzing ${filePath}: ${stderr.slice(-300)}`);
  }
  const gaps = [];
  let pendingStart = null;
  for (const line of stderr.split('\n')) {
    const startMatch = line.match(/silence_start:\s*([\d.]+)/);
    if (startMatch) { pendingStart = parseFloat(startMatch[1]); continue; }
    const endMatch = line.match(/silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/);
    if (endMatch) {
      const end = parseFloat(endMatch[1]);
      const duration = parseFloat(endMatch[2]);
      gaps.push({ start: pendingStart !== null ? pendingStart : end - duration, end, duration });
      pendingStart = null;
    }
  }
  const actualDuration = ffprobeDuration(filePath);
  const maxGap = gaps.reduce((m, g) => Math.max(m, g.duration), 0);
  return { actualDuration, silenceGaps: gaps, maxGap };
}

// All per-cue work happens in WAV/PCM (lossless) — silence generation, the
// speed-up below, and concatenation. MP3 encoding happens exactly ONCE, on
// the final assembled step, at the very end. Splicing already-compressed MP3
// clips together (or re-encoding MP3-to-MP3 more than once) is what caused
// the clicks/static/word-mixing — each MP3 encode pads its start/end slightly,
// so joining compressed clips leaves audible glitches at every seam.
// 44100 Hz ("CD quality") rather than a lower rate — the web preview player
// almost certainly streams at full quality with no downsampling, and losing
// that fidelity in the pipeline is a plausible source of a flatter/less warm
// sound versus the same voice heard on the website.
const PCM_RATE = 44100;

function makeSilence(seconds, outPath) {
  if (seconds <= 0.02) seconds = 0.02; // ffmpeg needs a non-zero duration
  execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', `anullsrc=r=${PCM_RATE}:cl=mono`, '-t', seconds.toFixed(3), outPath], { stdio: 'pipe' });
}

// Speed a clip up (never down) so it fits exactly inside its cue window.
// Used when a synthesized phrase naturally runs longer than the ~1 second
// slot its cue is allotted — keeps the count landing on the right second
// without needing a duration/schedule change every time TTS runs a touch long.
// atempo supports 0.5-2.0 in a single pass, which comfortably covers the
// speed-ups seen in practice (short phrases running 10-90% over). Runs on
// the lossless WAV, so this doesn't add any extra compression artifacts.
function compressToFit(inPath, targetSeconds, outPath) {
  const actual = ffprobeDuration(inPath);
  const tempo = Math.min(2.0, actual / targetSeconds);
  execFileSync('ffmpeg', ['-y', '-i', inPath, '-af', `atempo=${tempo.toFixed(4)}`, outPath], { stdio: 'pipe' });
  return tempo;
}

// Concatenate lossless WAV segments into one WAV (stream copy — no re-encode,
// no quality loss, no splice artifacts), then encode to MP3 exactly once.
function concatWavsToMp3(files, outPath) {
  // Uses the concat FILTER (separate -i per input + filter_complex), not the
  // concat DEMUXER (-f concat + list file). The demuxer assumes every input
  // already shares one sample rate/format and just splices streams — if a
  // voice returns its own native rate (e.g. 22050Hz) instead of the rate we
  // asked for, the demuxer silently drifts instead of resampling, adding a
  // little extra length per mismatched segment (confirmed: this was the exact
  // cause of the "longer with more cues" drift). The filter decodes and
  // resamples every input individually before joining them, so it's correct
  // regardless of what rate any given provider/voice actually returns.
  const args = ['-y'];
  files.forEach(f => args.push('-i', f));
  const filterInputs = files.map((_, i) => `[${i}:a]`).join('');
  // Fixed bitrate (CBR), not VBR (`-q:a`) — found this session that a VBR
  // encode can, on rare occasions, get a Xing/VBR header that disagrees with
  // its real frame count: ffprobe and even a full ffmpeg decode both read the
  // container's stated duration fine, but Chromium's own audio decoder
  // computed a shorter duration from the (apparently slightly malformed)
  // frames and genuinely stopped playback ~5s early — a real user-facing
  // cutoff that no ffmpeg-based check could have caught. 96k comfortably
  // covers the 64-85kbps this pipeline's mono speech was already averaging
  // under VBR, so there's no audible quality change — CBR just removes the
  // header-estimation ambiguity that caused it, at the source.
  args.push(
    '-filter_complex', `${filterInputs}concat=n=${files.length}:v=0:a=1[outa]`,
    '-map', '[outa]',
    '-ar', String(PCM_RATE), '-ac', '1',
    '-c:a', 'libmp3lame', '-b:a', '96k',
    outPath
  );
  execFileSync('ffmpeg', args, { stdio: 'pipe' });
}

// ---------- Generation ----------

async function generateContinuous(item, provider, apiKey, voice, speed, outPath, opts = {}) {
  const audio = await callWithRetry(provider, apiKey, item.text, voice, speed, 'mp3', opts);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, audio);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Break steps with a long count (e.g. a 10-blink sequence) fire many rapid
// per-cue requests — enough to trip a provider's per-minute rate limit on a
// free/trial tier. A small pacing gap plus a couple of backoff retries on 429
// makes that a non-issue without meaningfully slowing generation down.
async function callWithRetry(provider, apiKey, text, voice, speed, format, opts = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await callProviderTTS(provider, apiKey, text, voice, speed, format, opts);
    } catch (err) {
      const is429 = /\b429\b/.test(err.message) || /rate.?limit/i.test(err.message);
      if (!is429 || attempt >= 2) throw err;
      const backoffMs = 2000 * (attempt + 1);
      console.log(`\n    (rate limited, waiting ${backoffMs / 1000}s and retrying...) `);
      await sleep(backoffMs);
    }
  }
}

// Collapses a step's cues into synthesis units: every 'count' cue (a hold
// number, a rep count) stays its own isolated call, because it must land on
// an exact second — but consecutive general-narration cues get MERGED into
// one continuous call. Splitting narration into isolated single-sentence
// clips was the real source of the "robotic" sound even after the splice and
// timing bugs were fixed: each isolated clip gets its own flat, complete-
// sentence intonation from the model, and gluing many of those together
// reads as choppy no matter how clean the splice itself is. Recording a
// whole run of narration in one breath lets the model produce natural,
// connected prosody across sentences — exactly like a real narrator reading
// the paragraph, not a word list.
function buildSynthesisSegments(cues, duration) {
  const segments = [];
  let i = 0;
  while (i < cues.length) {
    if (cues[i].rate === 'count') {
      const nextT = (i + 1 < cues.length) ? cues[i + 1].t : duration;
      segments.push({ kind: 'count', say: cues[i].say, startT: cues[i].t, windowSeconds: nextT - cues[i].t });
      i++;
    } else if (cues[i].rate === 'pause') {
      // A deliberate silent gap (cues().pause()) — real quiet time, not TTS
      // output, so it always breaks a narration group rather than merging
      // into one, same as a count cue does.
      segments.push({ kind: 'pause', seconds: cues[i].pauseSeconds, startT: cues[i].t });
      i++;
    } else {
      const start = i;
      while (i < cues.length && cues[i].rate !== 'count' && cues[i].rate !== 'pause') i++;
      const group = cues.slice(start, i);
      const nextT = (i < cues.length) ? cues[i].t : duration;
      segments.push({ kind: 'group', say: group.map(c => c.say).join(' '), startT: group[0].t, windowSeconds: nextT - group[0].t });
    }
  }
  return segments;
}

// QA gate defaults — the tolerances established and verified against Shane's
// explicit feedback this session: a natural pause up to ~3s between spoken
// segments is fine, longer than that is the dead-air bug; a clip sped up more
// than ~10% to fit its window starts sounding audibly rushed/robotic.
const DEFAULT_MAX_SILENCE_GAP = 3.0;
const DEFAULT_MAX_COMPRESSION = 1.10;

async function generateBreakStep(item, provider, apiKey, voice, speed, countSpeed, outPath, opts = {}, qaOpts = {}) {
  const maxSilenceGap = qaOpts.maxSilenceGap ?? DEFAULT_MAX_SILENCE_GAP;
  const maxCompression = qaOpts.maxCompression ?? DEFAULT_MAX_COMPRESSION;
  const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'tts-cue-'));
  const segments = [];
  const warnings = [];
  let maxTempo = 1.0;
  try {
    const units = buildSynthesisSegments(item.cues, item.duration);
    for (let i = 0; i < units.length; i++) {
      if (i > 0) await sleep(200); // small pacing gap between rapid calls
      const unit = units[i];

      if (unit.kind === 'pause') {
        // No TTS call at all — a deliberate silent gap is exactly `seconds`
        // long by construction, not something to measure/pad/compress.
        const silPath = path.join(tmpDir, `pause-${i}.wav`);
        makeSilence(unit.seconds, silPath);
        segments.push(silPath);
        continue;
      }

      const unitSpeed = unit.kind === 'count' ? countSpeed : speed;
      const raw = await callWithRetry(provider, apiKey, unit.say, voice, unitSpeed, 'wav', opts); // lossless — no MP3 round-trip until the final encode
      const unitPath = path.join(tmpDir, `unit-${i}.wav`);
      fs.writeFileSync(unitPath, raw);

      const spoken = ffprobeDuration(unitPath);
      const padSeconds = unit.windowSeconds - spoken;

      if (padSeconds < -0.02) {
        // Ran long — speed this one clip up so it still finishes inside its
        // window, so the NEXT unit (or the step's end) still lands on schedule.
        // Applied to a whole multi-sentence group this is a much gentler,
        // less audible correction than compressing a single isolated word.
        const compressedPath = path.join(tmpDir, `unit-${i}-fit.wav`);
        const tempo = compressToFit(unitPath, unit.windowSeconds, compressedPath);
        maxTempo = Math.max(maxTempo, tempo);
        segments.push(compressedPath);
        warnings.push(`t=${unit.startT}s "${unit.say.slice(0, 40)}${unit.say.length > 40 ? '…' : ''}" took ${spoken.toFixed(2)}s for a ${unit.windowSeconds}s window — sped up ${tempo.toFixed(2)}x to fit`);
      } else {
        segments.push(unitPath);
        if (padSeconds > 0.02) {
          const silPath = path.join(tmpDir, `sil-${i}.wav`);
          makeSilence(padSeconds, silPath);
          segments.push(silPath);
        }
      }
    }

    // QA gate: assemble into a PENDING file first — never the live outPath —
    // and only promote it if it actually passes waveform-level inspection.
    // Duration alone was proven insufficient this session (a file can be
    // exactly the right total length while still containing many seconds of
    // dead air); this is what would have caught that automatically instead of
    // requiring a manual, file-by-file audit after the fact.
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const pendingPath = outPath + '.qa-pending.mp3';
    concatWavsToMp3(segments, pendingPath);

    // minGapSeconds is a LOW, fixed detection floor — independent of
    // maxSilenceGap (the enforced threshold below). If these were the same
    // value, a stricter --max-silence-gap could never actually catch
    // anything smaller than itself, since ffmpeg would never even report a
    // gap below that size to compare against.
    const analysis = analyzeAudioFile(pendingPath, { minGapSeconds: 0.3 });
    const gapOk = analysis.maxGap <= maxSilenceGap;
    const tempoOk = maxTempo <= maxCompression;

    if (gapOk && tempoOk) {
      fs.renameSync(pendingPath, outPath);
      return { passed: true, warnings, maxTempo, maxGap: analysis.maxGap };
    }

    fs.rmSync(pendingPath, { force: true });
    const reasons = [];
    if (!gapOk) {
      const worst = analysis.silenceGaps.reduce((a, b) => (b.duration > a.duration ? b : a), { duration: 0 });
      reasons.push(`${worst.duration.toFixed(2)}s silence gap at t=${worst.start.toFixed(1)}s-${worst.end.toFixed(1)}s (max allowed ${maxSilenceGap}s)`);
    }
    if (!tempoOk) reasons.push(`sped up ${maxTempo.toFixed(2)}x (max allowed ${maxCompression}x)`);
    return { passed: false, warnings, maxTempo, maxGap: analysis.maxGap, failureReason: reasons.join(' / ') };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// ---------- Manifest regeneration (mirrors update-audio-manifest.sh) ----------

function regenerateManifest() {
  const files = [];
  for (const sub of ['breaks', 'quotes', 'learning', 'words']) {
    const dir = path.join(ROOT, 'audio', sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.mp3')) files.push(`audio/${sub}/${f}`);
    }
  }
  files.sort();
  const content = `// audio-manifest.js — list of pre-recorded audio files that exist in /audio
// AUTO-GENERATED by tts-generate.js / update-audio-manifest.sh — do not edit by hand.
// Naming: audio/breaks/<breakId>-step<N>-<gender>.mp3
//         audio/quotes/quote-<category>-<index>-<gender>.mp3 | quote-intro-<gender>.mp3
//         audio/learning/<episodeId>-<gender>.mp3     (<gender> = female | male)
//         audio/words/<wordId>-<gender>.mp3
window.AUDIO_MANIFEST = [
${files.map(f => `  '${f}',`).join('\n')}
];
`;
  fs.writeFileSync(path.join(ROOT, 'audio-manifest.js'), content);
  return files.length;
}

// ---------- Main ----------

function updateComparisonIndex(label, provider, voice, gender, filePaths) {
  const indexPath = path.join(ROOT, 'voice-tests', 'index.json');
  let index = [];
  if (fs.existsSync(indexPath)) {
    try { index = JSON.parse(fs.readFileSync(indexPath, 'utf8')); } catch { index = []; }
  }
  index = index.filter(e => e.label !== label);
  index.push({ label, provider, voice, gender, files: filePaths, updatedAt: new Date().toISOString() });
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.all && !args.breaks && !args.learning && !args.quotes && !args.words) {
    printUsageAndExit('Nothing selected — pass --all, --breaks, --learning, --quotes, and/or --words.');
  }
  if (!args.gender || !['female', 'male'].includes(args.gender)) {
    printUsageAndExit('--gender=female or --gender=male is required (determines the output filename).');
  }
  if (!args.dryRun && !args.qaOnly && !args.voice) {
    printUsageAndExit('--voice="Telnyx.NaturalHD.astra" (or your voice code/ID) is required, unless using --dry-run.');
  }
  if (!PROVIDER_ENV[args.provider]) {
    printUsageAndExit(`Unknown --provider="${args.provider}" — expected telnyx, elevenlabs, or speechify.`);
  }

  const speed = args.speed || 1.0;
  const countSpeed = args.countSpeed || 1.0;

  // A --label writes into voice-tests/<label>/ instead of the live audio/
  // folder — comparison runs never touch the real app or another platform's
  // test files, and never regenerate the live audio-manifest.js.
  const outputRoot = args.label ? path.join(ROOT, 'voice-tests', args.label) : ROOT;
  const isComparisonRun = !!args.label;
  if (isComparisonRun) {
    console.log(`Comparison mode — writing to voice-tests/${args.label}/ (live app and other platforms untouched).`);
  }

  const catalog = buildCatalog();
  const selected = selectItems(catalog, args);
  if (selected.length === 0) { console.log('Nothing matched your selection.'); return; }

  // Premium content must never land in the public audio/ folder — --label is
  // what redirects output to voice-tests/ (gitignored, never deployed)
  // instead of the live path, so refuse outright rather than risk it.
  const premiumWithoutLabel = selected.filter(i => i.premium && !args.label);
  if (premiumWithoutLabel.length > 0) {
    printUsageAndExit(
      `Refusing: ${premiumWithoutLabel.length} selected item(s) are premium content, and no --label was given. ` +
      `Premium audio must only ever be written under voice-tests/<label>/, never the public audio/ folder. ` +
      `Pass --label=<name> to proceed.`
    );
  }

  // --qa-only re-checks files ALREADY on disk with no API key, no generation,
  // and no risk to existing content — used to re-verify the whole library as
  // a regression check (e.g. after changing the gate's own thresholds).
  if (args.qaOnly) {
    const maxSilenceGap = args.maxSilenceGap ?? DEFAULT_MAX_SILENCE_GAP;
    let failures = 0, checked = 0;
    for (const item of selected) {
      const filePath = path.join(ROOT, item.filePath(args.gender));
      if (!fs.existsSync(filePath)) continue;
      checked++;
      const analysis = analyzeAudioFile(filePath, { minGapSeconds: 0.3 });
      if (analysis.maxGap > maxSilenceGap) {
        failures++;
        const worst = analysis.silenceGaps.reduce((a, b) => (b.duration > a.duration ? b : a));
        console.log(`  !! ${item.filePath(args.gender)} — ${worst.duration.toFixed(2)}s silence gap at t=${worst.start.toFixed(1)}s-${worst.end.toFixed(1)}s (max allowed ${maxSilenceGap}s)`);
      }
    }
    console.log(`\n${checked - failures}/${checked} file(s) passed the silence-gap check (max allowed ${maxSilenceGap}s).`);
    if (failures > 0) process.exitCode = 1;
    return;
  }

  const toGenerate = selected.filter(item => {
    const outPath = path.join(outputRoot, item.filePath(args.gender));
    return args.force || !fs.existsSync(outPath);
  });
  const skipped = selected.length - toGenerate.length;

  console.log(`Selected ${selected.length} script(s) — ${toGenerate.length} to generate, ${skipped} already exist (use --force to redo).`);

  if (args.dryRun) {
    toGenerate.forEach(item => console.log(`  [would generate] ${item.filePath(args.gender)}  —  ${item.label}`));
    return;
  }

  const apiKey = readApiKey(args.provider);
  if (!apiKey) {
    const cfg = PROVIDER_ENV[args.provider];
    printUsageAndExit(`No ${args.provider} API key found. Set ${cfg.varName} in your shell, or run the matching setup-${args.provider}-key.sh script (writes to ${cfg.file}, gitignored).`);
  }

  // Speechify-only extras: --model overrides simba-3.2 default; --pitch (e.g.
  // "-10%") and --emotion (e.g. "relaxed") are applied via SSML — see
  // wrapSpeechifySSML(). Harmlessly ignored by the other two providers.
  const opts = { model: args.model, pitch: args.pitch, rate: args.rate, emotion: args.emotion };
  const qaOpts = { maxSilenceGap: args.maxSilenceGap, maxCompression: args.maxCompression };

  let done = 0;
  let qaFailures = 0;
  const allWarnings = [];
  const generatedPaths = [];
  for (const item of toGenerate) {
    const outPath = path.join(outputRoot, item.filePath(args.gender));
    process.stdout.write(`  Generating ${item.filePath(args.gender)} ... `);
    try {
      if (item.kind === 'break') {
        const result = await generateBreakStep(item, args.provider, apiKey, args.voice, speed, countSpeed, outPath, opts, qaOpts);
        allWarnings.push(...result.warnings.map(w => `${item.id}: ${w}`));
        if (!result.passed) {
          qaFailures++;
          console.log(`QA FAILED — ${result.failureReason}`);
          continue; // not written to outPath, not counted as generated, no mirror copy
        }
      } else {
        await generateContinuous(item, args.provider, apiKey, args.voice, speed, outPath, opts);
      }
      if (args.mirrorDir) {
        const mirrorPath = path.resolve(args.mirrorDir.replace(/^~/, require('os').homedir()));
        fs.mkdirSync(mirrorPath, { recursive: true });
        fs.copyFileSync(outPath, path.join(mirrorPath, path.basename(outPath)));
      }
      generatedPaths.push(item.filePath(args.gender));
      console.log('done');
      done++;
    } catch (err) {
      console.log('FAILED');
      console.error(`    ${err.message}`);
    }
  }
  if (qaFailures > 0) process.exitCode = 1;

  if (isComparisonRun) {
    // Scan the FULL catalog (not just this run's selector) for whatever
    // already exists on disk under this label, in either gender — otherwise
    // a partial re-run (e.g. retrying one failed step) overwrites the index
    // with only today's selection and "forgets" everything generated earlier
    // under the same label.
    const allForLabel = [];
    for (const g of ['female', 'male']) {
      for (const item of catalog) {
        const p = item.filePath(g);
        if (fs.existsSync(path.join(outputRoot, p))) allForLabel.push(p);
      }
    }
    if (allForLabel.length > 0) {
      updateComparisonIndex(args.label, args.provider, args.voice, args.gender, allForLabel);
    }
    console.log(`\n${done}/${toGenerate.length} generated under label "${args.label}". Open voice-compare.html to listen. Live app untouched.`);
  } else {
    const fileCount = regenerateManifest();
    console.log(`\n${done}/${toGenerate.length} generated. audio-manifest.js now lists ${fileCount} file(s).`);
  }
  if (allWarnings.length) {
    console.log('\nAuto-corrected timing (these clips ran long, so they were sped up slightly to stay on schedule):');
    allWarnings.forEach(w => console.log('  ! ' + w));
  }
  if (qaFailures > 0) {
    console.log(`\n${qaFailures} file(s) FAILED the QA gate and were NOT written — re-run after adjusting the script's timing (see failure reasons above), or pass --max-silence-gap/--max-compression to intentionally allow a specific case.`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
