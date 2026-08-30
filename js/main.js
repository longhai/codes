document.addEventListener("DOMContentLoaded", () => {
  localStorage.removeItem('theme_mode');

  // --- Logic Index ---
  document.querySelectorAll(".pen-title").forEach(el => {
    fetch(el.dataset.postUrl).then(r => r.text()).then(html => {
      el.textContent = new DOMParser().parseFromString(html, "text/html").querySelector("title")?.innerText || "Untitled";
    });
  });

  // --- Logic Viewer ---
  const f = document.getElementById('f');
  if (!f) return;

  const $ = id => document.getElementById(id);
  const menu = $('menu'), mBtn = $('mBtn'), devBtn = $('devBtn'), fsBtn = $('fsBtn'), srcBtn = $('srcBtn'), vp = $('vp');
  let dragged = false, isDrag = false, sx, sy, il, it;

  const post = new URLSearchParams(location.search).get('post') || '';
  f.src = post;
  post ? srcBtn.href = post : (srcBtn.classList.add('dis'), srcBtn.title = 'Không có link');

  const setPos = isMb => {
    if (dragged) return;
    Object.assign(menu.style, { top: isMb ? 'auto' : '24px', bottom: isMb ? '24px' : 'auto', left: 'auto', right: '24px' });
  };

  window.togDev = () => {
    const isMb = f.classList.contains('pc');
    f.className = isMb ? 'mb' : 'pc';
    devBtn.textContent = isMb ? '💻' : '📱';
    if(vp) vp.content = isMb ? 'width=device-width,initial-scale=1' : 'width=1280';
    setPos(isMb);
    updateRadial();
  };

  if (window.innerWidth <= 768) window.togDev(); else setPos(false);

  window.togFS = () => {
    const isFS = document.fullscreenElement || document.webkitFullscreenElement;
    isFS ? (document.exitFullscreen || document.webkitExitFullscreen).call(document) : 
           (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullScreen).call(document.documentElement);
  };

  ['fullscreenchange','webkitfullscreenchange'].forEach(e => document.addEventListener(e, () => {
    fsBtn.textContent = (document.fullscreenElement || document.webkitFullscreenElement) ? '🗗' : '⛶';
  }));

  const subs = Array.from(menu.querySelectorAll('.sub'));
  function updateRadial() {
    if (!menu.classList.contains('active')) return;
    const r = menu.getBoundingClientRect();
    const R = 95, isR = r.left + r.width / 2 > innerWidth / 2, isB = r.top + r.height / 2 > innerHeight / 2;
    const sDeg = isR ? (isB ? 180 : 90) : (isB ? 270 : 0);
    const step = 90 / (subs.length - 1);

    subs.forEach((b, i) => {
      const rad = (sDeg + step * i) * Math.PI / 180;
      b.style.transform = `translate(calc(-50% + ${Math.round(R * Math.cos(rad))}px), calc(-50% + ${Math.round(R * Math.sin(rad))}px)) scale(1)`;
    });
  }

  const closeMenu = () => { menu.classList.remove('active'); subs.forEach(b => b.style.transform = 'translate(-50%,-50%) scale(.2)'); };
  const togMenu = () => { menu.classList.toggle('active'); menu.classList.contains('active') ? updateRadial() : closeMenu(); };

  const getPos = e => e.touches ? e.touches[0] : e;
  function startDrag(e) {
    isDrag = true; dragged = false; document.body.classList.add('drag');
    const p = getPos(e); sx = p.clientX; sy = p.clientY; il = menu.offsetLeft; it = menu.offsetTop;
  }
  function doDrag(e) {
    if (!isDrag) return;
    const p = getPos(e), dx = p.clientX - sx, dy = p.clientY - sy;
    if (Math.hypot(dx, dy) > 5) {
      dragged = true; if (e.cancelable) e.preventDefault();
      Object.assign(menu.style, {
        left: Math.max(10, Math.min(il + dx, innerWidth - menu.offsetWidth - 10)) + 'px',
        top: Math.max(10, Math.min(it + dy, innerHeight - menu.offsetHeight - 10)) + 'px',
        right: 'auto', bottom: 'auto'
      });
      updateRadial();
    }
  }
  function stopDrag() { isDrag = false; document.body.classList.remove('drag'); }

  mBtn.addEventListener('mousedown', startDrag);
  mBtn.addEventListener('touchstart', startDrag, {passive: false});
  document.addEventListener('mousemove', doDrag);
  document.addEventListener('touchmove', doDrag, {passive: false});
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);
  mBtn.addEventListener('click', () => !dragged && togMenu());
  document.addEventListener('click', e => !menu.contains(e.target) && closeMenu());
  window.addEventListener('resize', updateRadial);
});
    
