function updateTimes() {
  const now = new Date();
  try {
    document.getElementById('time-ny').textContent =
      now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit'
      });
    document.getElementById('time-kr').textContent =
      now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Seoul',
        hour: '2-digit',
        minute: '2-digit'
      });
  } catch (e) {
    document.getElementById('time-ny').textContent = now.toUTCString();
    document.getElementById('time-kr').textContent = now.toUTCString();
  }
}
updateTimes();
setInterval(updateTimes, 1000);

const bubbleArea = document.getElementById('bubble-area');
const controls = document.getElementById('controls');
const initialBubbles = 11;
let visited = new Set();
let values = [];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function areaRect() {
  return bubbleArea.getBoundingClientRect();
}

function createBubbles() {
  bubbleArea.querySelectorAll('.bubble').forEach((n) => n.remove());
  values = [];
  const rect = areaRect();
  for (let i = 0; i < initialBubbles; i++) {
    const el = document.createElement('div');
    el.className = 'bubble';
    el.dataset.index = i;
    const w = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--bubble-size')
    );
    const x = rand(10, rect.width - w - 10);
    const y = rand(10, rect.height - w - 10);
    bubbleArea.appendChild(el);

    // assign small, smooth drift speeds
    const speed = rand(0.02, 0.12);
    const angle = rand(0, Math.PI * 2);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    values.push({ el, x, y, vx, vy, w });
    el.style.transform = `translate(${x}px, ${y}px)`;
    el.addEventListener('click', onBubbleClick);
  }
}
createBubbles();

let lastTime = performance.now();
function animate(t) {
  const dt = Math.min(40, t - lastTime);
  lastTime = t;
  const rect = areaRect();

  for (const b of values) {
    if (visited.has(b.el.dataset.index)) continue;

    // add tiny randomness for organic drift
    b.vx += (Math.random() - 0.5) * 0.002;
    b.vy += (Math.random() - 0.5) * 0.002;

    // clamp speed so it stays gentle and smooth
    const maxSpeed = 0.15;
    b.vx = Math.max(Math.min(b.vx, maxSpeed), -maxSpeed);
    b.vy = Math.max(Math.min(b.vy, maxSpeed), -maxSpeed);

    // update position
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // bounce softly off edges
    if (b.x <= 6 || b.x + b.w >= rect.width - 6) b.vx *= -1;
    if (b.y <= 6 || b.y + b.w >= rect.height - 6) b.vy *= -1;

    // GPU-accelerated transform (no layout jank)
    b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
  }

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
const loading = document.getElementById('loading');
const entry = document.getElementById('entry');
const entryTitle = document.getElementById('entry-title');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const slideshow = document.getElementById('slideshow');
const closeEntry = document.getElementById('close-entry');

function buildSlidesFor(index) {
  slideshow.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const s = document.createElement('div');
    s.className = 'slide';
    const img = document.createElement('img');
    img.src = 'main.png';
    img.alt = 'slide ' + (i + 1);
    s.appendChild(img);
    s.style.opacity = i === 0 ? 1 : 0;
    s.dataset.idx = i;
    slideshow.appendChild(s);
  }
  slideshow.dataset.current = 0;
}
function showSlide(offset) {
  const slides = slideshow.querySelectorAll('.slide');
  let cur = parseInt(slideshow.dataset.current || 0, 10);
  cur = (cur + offset + slides.length) % slides.length;
  slides.forEach((s, i) => (s.style.opacity = i === cur ? 1 : 0));
  slideshow.dataset.current = cur;
}

let currentBubbleIdx = null;
function onBubbleClick(e) {
  const idx = e.currentTarget.dataset.index;
  currentBubbleIdx = idx;
  loading.classList.add('show');
  setTimeout(() => {
    loading.classList.remove('show');
    openEntry(idx);
    visited.add(idx);
  }, 3000);
}
function openEntry(idx) {
  entryTitle.textContent =
    idx == 0 ? 'OUTFIT CHECK! 우리의 ootd' : 'Entry #' + (parseInt(idx) + 1);
  buildSlidesFor(idx);
  entry.classList.add('show');
}

closeEntry.addEventListener('click', () => {
  entry.classList.remove('show');
  removeVisitedFromDOM();
  showRefresh();
});

prevBtn.addEventListener('click', () => showSlide(-1));
nextBtn.addEventListener('click', () => showSlide(1));

function removeVisitedFromDOM() {
  for (const id of visited) {
    const el = bubbleArea.querySelector('.bubble[data-index="' + id + '"]');
    if (el) el.remove();
  }
}
function showRefresh() {
  controls.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'refresh-btn';
  btn.textContent = '⟲ refresh';
  btn.addEventListener('click', () => {
    visited.clear();
    controls.innerHTML = '';
    createBubbles();
  });
  controls.appendChild(btn);
}