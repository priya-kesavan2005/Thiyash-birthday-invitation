(() => {
  const scenes = [...document.querySelectorAll('.scene')];
  const indicators = [...document.querySelectorAll('.indicator')];
  const stage = document.getElementById('stage');
  const progress = document.getElementById('sceneProgress');
  const messageText = document.getElementById('messageText');
  const messageProgress = document.getElementById('messageProgress');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  const replayBtn = document.getElementById('replayBtn');
  const muteBtn = document.getElementById('muteBtn');
  const bats = document.getElementById('bats');
  const particles = document.getElementById('particles');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = 0;
  let timer = null;
  let messageTimer = null;
  let audioContext = null;
  let masterGain = null;
  let muted = false;

  const sceneDurations = [6500, 6500, 7500, 10000, 8000];
  const messageLines = [
    'Hi everyone!',
    "I'm Thiyash, and I'm turning ONE!",
    'Please come and celebrate my first birthday with me.',
    "I'm waiting to see you all!",
    'SEE YOU THERE!'
  ];

  function createAtmosphere() {
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${35 + Math.random() * 65}%`;
      p.style.animationDuration = `${5 + Math.random() * 9}s`;
      p.style.animationDelay = `${Math.random() * -10}s`;
      particles.appendChild(p);
    }
    for (let i = 0; i < 9; i++) {
      const b = document.createElement('span');
      b.className = 'bat';
      b.textContent = '🦇';
      b.style.top = `${8 + Math.random() * 58}%`;
      b.style.left = `${-15 - Math.random() * 25}%`;
      b.style.animationDuration = `${8 + Math.random() * 9}s`;
      b.style.animationDelay = `${Math.random() * -12}s`;
      bats.appendChild(b);
    }
  }

  function setScene(index, userAction = false) {
    current = (index + scenes.length) % scenes.length;
    scenes.forEach((scene, i) => scene.classList.toggle('active', i === current));
    indicators.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-current', i === current ? 'step' : 'false');
    });
    progress.style.width = `${((current + 1) / scenes.length) * 100}%`;
    clearTimeout(timer);
    clearInterval(messageTimer);
    messageProgress.style.width = '0%';
    if (current === 3) runMessage();
    if (!reducedMotion) playCue(current);
    timer = setTimeout(() => setScene(current + 1), sceneDurations[current]);
  }

  function runMessage() {
    let index = 0;
    const total = messageLines.length;
    messageText.textContent = messageLines[0];
    messageProgress.style.width = `${100 / total}%`;
    messageTimer = setInterval(() => {
      index += 1;
      if (index >= total) {
        clearInterval(messageTimer);
        return;
      }
      messageText.animate([
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 420, easing: 'ease-out' });
      messageText.textContent = messageLines[index];
      messageProgress.style.width = `${((index + 1) / total) * 100}%`;
    }, 1900);
  }

  function initAudio() {
    if (audioContext) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioContext = new AudioCtx();
    masterGain = audioContext.createGain();
    masterGain.gain.value = muted ? 0 : 0.035;
    masterGain.connect(audioContext.destination);
  }

  function playCue(sceneIndex) {
    if (muted || !audioContext || !masterGain) return;
    if (audioContext.state === 'suspended') audioContext.resume();
    const notes = [110, 146.83, 164.81, 196, 220];
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = sceneIndex === 4 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(notes[sceneIndex], now);
    osc.frequency.exponentialRampToValueAtTime(notes[sceneIndex] * 1.5, now + 0.8);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.24, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
    osc.connect(gain).connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.3);
  }

  function toggleMute() {
    muted = !muted;
    muteBtn.textContent = muted ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-label', muted ? 'Unmute cinematic sound' : 'Mute cinematic sound');
    if (masterGain) masterGain.gain.setTargetAtTime(muted ? 0 : 0.035, audioContext.currentTime, 0.05);
  }

  nextBtn.addEventListener('click', () => setScene(current + 1, true));
  prevBtn.addEventListener('click', () => setScene(current - 1, true));
  indicators.forEach(dot => dot.addEventListener('click', () => setScene(Number(dot.dataset.go), true)));
  replayBtn.addEventListener('click', () => setScene(0, true));
  muteBtn.addEventListener('click', toggleMute);
  stage.addEventListener('pointerdown', initAudio, { once: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') setScene(current + 1, true);
    if (event.key === 'ArrowLeft') setScene(current - 1, true);
    if (event.key.toLowerCase() === 'r') setScene(0, true);
    if (event.key.toLowerCase() === 'm') toggleMute();
  });

  createAtmosphere();
  setScene(0);
})();
