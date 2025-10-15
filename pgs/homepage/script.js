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

// function buildSlidesFor(index) {
//   slideshow.innerHTML = '';
//   for (let i = 0; i < 3; i++) {
//     const s = document.createElement('div');
//     s.className = 'slide';
//     const img = document.createElement('img');
//     img.src = 'main.png';
//     img.alt = 'slide ' + (i + 1);
//     s.appendChild(img);
//     s.style.opacity = i === 0 ? 1 : 0;
//     s.dataset.idx = i;
//     slideshow.appendChild(s);
//   }
//   slideshow.dataset.current = 0;
// }

function buildSlidesFor(index) {
  slideshow.innerHTML = '';
  const entryFolder = `../../asset/imgs/entries/entry${index}/`;

  const imageCounts = [20, 62, 16, 72, 43, 40, 2, 45, 12, 1, 32];
  const count = imageCounts[index] || 3;

  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'slide';
    s.style.opacity = i === 0 ? 1 : 0; // set opacity on the slide, not img

    const img = document.createElement('img');
    const basePath = `${entryFolder}${i + 1}`;
    img.alt = `entry ${index} slide ${i + 1}`;

    img.src = `${basePath}.jpeg`;
    img.onerror = function () {
      this.onerror = null;
      this.src = `${basePath}.jpg`;
    };
    img.onerror = function () {
      // Fallback to .jpg
      this.onerror = null;
      this.src = `${basePath}.jpg`;

      this.onerror = function () {
        // Fallback to video .mov
        const video = document.createElement('video');
        video.src = `${basePath}.mov`;
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.style.width = '100%';
        video.style.height = '100%';

        s.innerHTML = ''; // remove failed img
        s.appendChild(video);
      };
    };
    s.appendChild(img);
    slideshow.appendChild(s);
  }

  slideshow.dataset.current = 0;
}

function showSlide(offset) {
  const slides = slideshow.querySelectorAll('.slide');
  let cur = parseInt(slideshow.dataset.current || 0, 10);
  cur = (cur + offset + slides.length) % slides.length;
  
  slides.forEach((s, i) => {
    s.style.opacity = i === cur ? 1 : 0;

    const video = s.querySelector('video');
    if (video) {
      if (i === cur) {
        video.play();    // play the current video
      } else {
        video.pause();   // pause all others
        video.currentTime = 0; // optional: rewind to start
      }
    }
  });

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


// Define all entries
const entries = [
  { num: 1, title: "outfit check!", subtitle: "우리의 ootd" },
  { num: 2, title: "맛밥로그", subtitle: "함께 먹은 음식들" },
  { num: 3, title: "travel log", subtitle: "JJ커플의 발길이 닿은곳" },
  { num: 4, title: "messages", subtitle: "주고받은 대화" },
  { num: 5, title: "FaceTime", subtitle: "영통모음" },
  { num: 6, title: "Hugs and Kisses", subtitle: "우엑모먼트" },
  { num: 7, title: "birthday special", subtitle: "내가 초 켜주겟다고 햇잔아" },
  { num: 8, title: "someone", subtitle: "우리의 대답" },
  { num: 9, title: "정연 닮은꼴", subtitle: "천의얼굴 홍정연" },
  { num: 10, title: "기어코 찾았군", subtitle: "사랑의 메시지" },
  { num: 11, title: "love", subtitle: "생일기념 폭풍표현" },
];

function openEntry(idx) {
  const e = entries[idx];
  if (!e) return;
  entryTitle.textContent =
    idx == 0 ? 'OUTFIT CHECK! 우리의 ootd' : 'Entry #' + (parseInt(idx) + 1);

  entryTitle.innerHTML = `
    <div style="text-align:center;">
  <div> #${idx}: ${e.title}</div>${
    e.subtitle ? `<div style="font-size:0.9em; margin-top:4px;">${e.subtitle}</div>` : ''
  }`;

  buildSlidesFor(idx);
  entry.classList.add('show');
}

function openEntry(idx) {
  const e = entries[idx];
  if (!e) return;

  // Create separate “Entry #” label for the heart area
  const entryNumLabel = document.querySelector('.entry-header .entry-number');
  if (entryNumLabel) entryNumLabel.textContent = `Entry #${idx}`;

  // Centered title + subtitle below
  entryTitle.innerHTML = `
    <div style="text-align:center;">
      <div>${e.title}</div>
      ${e.subtitle ? `<div style="font-size:0.9em; opacity:0.8; margin-top:4px; ">${e.subtitle}</div>` : ''}
    </div>
  `;

  buildSlidesFor(idx);
  entry.classList.add('show');
}
// function openEntry(idx) {
//   entryTitle.textContent =
//     idx == 0 ? 'OUTFIT CHECK! 우리의 ootd' : 'Entry #' + (parseInt(idx) + 1);
//   buildSlidesFor(idx);
//   entry.classList.add('show');
// }


closeEntry.addEventListener('click', () => {
  entry.classList.remove('show');
  removeVisitedFromDOM();
  showRefresh();

  // Pause all videos when closing
  slideshow.querySelectorAll('video').forEach(v => {
    v.pause();
    v.currentTime = 0;
  });
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