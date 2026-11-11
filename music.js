/* Taskmaster PEAK 26 — shared GitHub-hosted background music.
   Upload a distributable track as /theme.mp3 to this repository.
   Playback is opt-in and never starts automatically. */
(() => {
  'use strict';

  const audio = document.createElement('audio');
  audio.loop = true;
  audio.volume = 0.42;
  audio.preload = 'none';
  audio.hidden = true;
  audio.setAttribute('aria-hidden', 'true');
  document.body.append(audio);

  let message = '';

  function syncControls() {
    const button = document.getElementById('peak-music-toggle');
    if (button) {
      const playing = !audio.paused;
      button.textContent = playing ? '♫ Music On' : '♫ Music Off';
      button.setAttribute('aria-pressed', String(playing));
      button.title = playing ? 'Switch background music off' : 'Play background music from GitHub';
    }
    const status = document.getElementById('peak-music-status');
    if (status) status.textContent = message;
  }

  async function toggleMusic() {
    if (!audio.paused) {
      audio.pause();
      message = '';
      syncControls();
      return;
    }
    // Resolve relative to GitHub Pages project path, not the domain root.
    if (!audio.src) audio.src = new URL('./theme.mp3', document.baseURI).href;
    message = '';
    syncControls();
    try {
      await audio.play(); // Called directly from a user click for autoplay-policy compliance.
    } catch {
      message = 'Track unavailable. Upload theme.mp3 to the GitHub repository.';
    }
    syncControls();
  }

  function installButton() {
    const header = document.querySelector('.live-header .live-action');
    if (!header || header.querySelector('#peak-music-toggle')) return;
    const wrap = document.createElement('div');
    wrap.className = 'peak-music-controls';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = 'peak-music-toggle';
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

  audio.addEventListener('play', () => { message = ''; syncControls(); });
  audio.addEventListener('pause', syncControls);
  audio.addEventListener('error', () => {
    message = 'Track unavailable. Upload theme.mp3 to the GitHub repository.';
    syncControls();
  });

  const app = document.getElementById('app');
  if (app) {
    new MutationObserver(installButton).observe(app, {childList: true, subtree: true});
    installButton();
  }
})();
