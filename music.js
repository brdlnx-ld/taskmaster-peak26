/* Taskmaster PEAK 26: shared GitHub-hosted loop.
   Requested default: music on unless the visitor explicitly turns it off.
   Browsers may require an initial user interaction to unlock sound. */
(() => {
  'use strict';
  const PREF = 'peak26-music-enabled';
  let enabled = localStorage.getItem(PREF) !== '0';
  let missing = false;
  let message = '';

  const audio = document.createElement('audio');
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.42;
  audio.src = new URL('./theme.mp3', document.baseURI).href;
  audio.hidden = true;
  audio.setAttribute('aria-hidden', 'true');
  document.body.append(audio);

  function syncControls() {
    const toggle = document.getElementById('peak-music-toggle');
    if (toggle) {
      toggle.textContent = enabled ? '♫ Music On' : '♫ Music Off';
      toggle.setAttribute('aria-pressed', String(enabled));
      toggle.title = enabled ? 'Turn background music off' : 'Turn background music on';
    }
    const status = document.getElementById('peak-music-status');
    if (status) status.textContent = message;
  }

  function tryToPlay() {
    if (!enabled || !audio.paused || missing) return;
    try {
      const result = audio.play();
      if (result && typeof result.then === 'function') {
        result.then(() => {
          message = '';
          syncControls();
        }).catch(error => {
          if (!enabled) return;
          message = error && error.name === 'NotAllowedError'
            ? 'Music starts after your first tap.'
            : 'Music could not play. Check theme.mp3 in GitHub.';
          syncControls();
        });
      }
    } catch {
      message = 'Music starts after your first tap.';
      syncControls();
    }
  }

  function toggleMusic() {
    enabled = !enabled;
    localStorage.setItem(PREF, enabled ? '1' : '0');
    if (enabled) {
      message = '';
      tryToPlay();
    } else {
      audio.pause();
      message = '';
    }
    syncControls();
  }

  function installButton() {
    const header = document.querySelector('.live-header .live-action');
    if (!header || header.querySelector('#peak-music-toggle')) return;

    const wrap = document.createElement('div');
    wrap.className = 'peak-music-controls';

    const toggle = document.createElement('button');
    toggle.id = 'peak-music-toggle';
    toggle.type = 'button';
    toggle.className = 'peak-music-toggle';
    toggle.addEventListener('click', toggleMusic);

    const status = document.createElement('span');
    status.id = 'peak-music-status';
    status.className = 'peak-music-status';
    status.setAttribute('role', 'status');

    wrap.append(toggle, status);
    header.prepend(wrap);
    syncControls();
  }

  // Attempt immediate playback where the browser permits it.
  // If blocked, the first ordinary tap/keypress unlocks the requested music.
  // Exclude the Music button itself so an intended Off tap doesn't start sound.
  function unlockOnInteraction(event) {
    if (!enabled || missing || !audio.paused) return;
    const target = event.target;
    if (target instanceof Element && target.closest('#peak-music-toggle')) return;
    tryToPlay();
  }
  document.addEventListener('pointerdown', unlockOnInteraction, {passive: true});
  document.addEventListener('keydown', unlockOnInteraction);
  window.addEventListener('pageshow', tryToPlay);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryToPlay();
  });

  audio.addEventListener('play', () => { message = ''; syncControls(); });
  audio.addEventListener('pause', syncControls);
  audio.addEventListener('error', () => {
    missing = true;
    if (enabled) message = 'Music could not load. Check theme.mp3 in GitHub.';
    syncControls();
  });

  const app = document.getElementById('app');
  if (app) {
    new MutationObserver(installButton).observe(app, {childList: true, subtree: true});
    installButton();
  }
  if (enabled) tryToPlay();
})();
