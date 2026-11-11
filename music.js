/* Taskmaster PEAK 26 local music player.
   User-chosen audio stays in the visitor's browser (IndexedDB).
   Do not add copyrighted music files to public GitHub Pages without permission. */
(() => {
  'use strict';
  const DB_NAME = 'peak26-local-audio-v1';
  const STORE = 'tracks';
  const TRACK_ID = 'chosen-track';
  const PREF = 'peak26-music-enabled';
  const audio = document.createElement('audio');
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.42;
  audio.setAttribute('aria-hidden', 'true');
  audio.hidden = true;
  document.body.append(audio);

  const chooser = document.createElement('input');
  chooser.type = 'file';
  chooser.accept = 'audio/*,.mp3,.m4a,.ogg,.wav';
  chooser.hidden = true;
  chooser.setAttribute('aria-label', 'Select a local music file');
  document.body.append(chooser);

  let enabled = localStorage.getItem(PREF) === '1';
  let currentUrl = null;
  let selectedName = '';
  let ready = false;
  let userPrompt = '';

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) { reject(new Error('Browser storage not supported')); return; }
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, {keyPath: 'id'});
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async function rememberFile(file) {
    const db = await openDB();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({id: TRACK_ID, name: file.name, blob: file});
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally { db.close(); }
  }

  async function recallFile() {
    const db = await openDB();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const request = tx.objectStore(STORE).get(TRACK_ID);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } finally { db.close(); }
  }

  function setTrack(blob, name) {
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    audio.pause();
    currentUrl = URL.createObjectURL(blob);
    audio.src = currentUrl;
    audio.load();
    selectedName = name || 'Your local track';
    ready = true;
    userPrompt = '';
    updateControls();
  }

  function updateControls() {
    const toggle = document.getElementById('peak-music-toggle');
    const change = document.getElementById('peak-music-choose');
    if (toggle) {
      toggle.textContent = enabled && ready ? (audio.paused ? '♫ Tap to play' : '♫ Music On') : '♫ Music Off';
      toggle.setAttribute('aria-pressed', String(enabled && ready && !audio.paused));
      toggle.title = selectedName ? 'Local track: ' + selectedName : 'Choose audio from your device';
    }
    if (change) change.title = selectedName ? 'Change local track (' + selectedName + ')' : 'Choose an audio file from your device';
    const status = document.getElementById('peak-music-status');
    if (status) status.textContent = userPrompt;
  }

  async function playIfAllowed() {
    if (!enabled || !ready) return;
    try {
      await audio.play();
      userPrompt = '';
    } catch {
      userPrompt = 'Tap Music to play';
    }
    updateControls();
  }

  function toggleMusic() {
    if (!ready) { chooser.click(); return; }
    enabled = !enabled;
    localStorage.setItem(PREF, enabled ? '1' : '0');
    if (enabled) void playIfAllowed();
    else {
      audio.pause();
      userPrompt = '';
      updateControls();
    }
  }

  chooser.addEventListener('change', async () => {
    const file = chooser.files && chooser.files[0];
    chooser.value = '';
    if (!file) return;
    if (!(/^(audio\/)/i.test(file.type) || /\.(mp3|m4a|ogg|wav)$/i.test(file.name)) || file.size > 20 * 1024 * 1024 || file.size === 0) {
      userPrompt = 'Choose a valid audio file under 20 MB.';
      updateControls();
      return;
    }
    setTrack(file, file.name);
    try {
      await rememberFile(file);
    } catch {
      userPrompt = 'Playing this session only: browser storage is unavailable.';
    }
    enabled = true;
    localStorage.setItem(PREF, '1');
    // Some browsers require another tap after file selection to begin playback.
    void playIfAllowed();
  });

  function addControls() {
    const header = document.querySelector('.live-header .live-action');
    if (!header || header.querySelector('#peak-music-toggle')) return;
    const wrap = document.createElement('div');
    wrap.className = 'peak-music-controls';
    const toggle = document.createElement('button');
    toggle.id = 'peak-music-toggle';
    toggle.type = 'button';
    toggle.className = 'peak-music-toggle';
    toggle.addEventListener('click', toggleMusic);
    const change = document.createElement('button');
    change.id = 'peak-music-choose';
    change.type = 'button';
    change.className = 'peak-music-choose';
    change.textContent = 'Choose track';
    change.addEventListener('click', () => chooser.click());
    const status = document.createElement('span');
    status.id = 'peak-music-status';
    status.className = 'peak-music-status';
    status.setAttribute('role','status');
    wrap.append(toggle, change, status);
    header.prepend(wrap);
    updateControls();
  }

  const app = document.getElementById('app');
  if (app) {
    new MutationObserver(addControls).observe(app, {childList: true, subtree: true});
    addControls();
  }
  audio.addEventListener('play', updateControls);
  audio.addEventListener('pause', updateControls);
  audio.addEventListener('error', () => {
    userPrompt = 'Could not play that audio file. Choose another track.';
    enabled = false;
    localStorage.setItem(PREF, '0');
    updateControls();
  });
  // Browsers block unprompted autoplay. If music was ON last visit,
  // resume only on a real user gesture (never start without interaction).
  for (const eventName of ['pointerdown','keydown']) {
    document.addEventListener(eventName, () => {
      if (enabled && ready && audio.paused) void playIfAllowed();
    }, {passive: true});
  }
  recallFile().then(saved => {
    if (saved && saved.blob instanceof Blob) setTrack(saved.blob, saved.name);
  }).catch(() => {});
})();
