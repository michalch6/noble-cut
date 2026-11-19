/* Noble Cut: booking message, today's day, animations (GSAP + ScrollTrigger + Lenis, effects ported from React Bits) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- booking: builds the WhatsApp message ---------- */
  const SERVICES = { klasyczne: 'strzyżenie klasyczne + modelowanie (35 zł)', fade: 'fade / cieniowanie + modelowanie (45 zł)' };
  const DAYS = { 1: ['poniedziałek'], 2: ['wtorek'], 3: ['środa'], 4: ['czwartek'], 5: ['piątek'], 6: ['sobota'], 0: ['niedziela'] };
  const form = $('.pick');
  const update = () => {
    const s = form.usluga.value, d = form.dzien.value;
    let text = 'Cześć Maja! Chcę się zapisać na ' + (SERVICES[s] || 'strzyżenie') + '.';
    if (d !== '') {
      const [name, from] = DAYS[d];
      text += ` Dzień: ${name}.` + (from ? ` Masz wolną godzinę po ${from}?` : ' O której możesz?');
    }
    $('#msg').textContent = text;
    $('#wa').href = 'https://wa.me/48692017912?text=' + encodeURIComponent(text);
  };
  form.addEventListener('change', update);
  $$('[data-pick]').forEach((a) => a.addEventListener('click', () => {
    form.usluga.value = a.dataset.pick;
    update();
  }));
  update();

  const today = $(`.days [data-day="${new Date().getDay()}"]`);
  if (today) today.classList.add('today');

  /* ---------- strip text (repeated so it can loop) ---------- */
  const track = $('.velo-track');
  const words = ['Fade', '★', 'Klasyczne', '★', 'Cieniowanie', '★', 'Modelowanie', '★', 'Heiki Heiki', '★', 'VGR', '★'];
  const unit = words.map((w) => `<span>${w}</span>`).join('');
  track.innerHTML = `<div style="display:flex">${unit}</div>`.repeat(4);

  /* ---------- lightbox for the studio photos (works without GSAP) ---------- */
  const shots = $$('.m-item');
  const lb = $('.lb');
  if (lb && shots.length && typeof lb.showModal === 'function') {
    const big = $('.lb-stage img', lb), stage = $('.lb-stage', lb), count = $('.lb-count', lb);
    let cur = 0, sx = null;
    const at = (i) => shots[(i + shots.length) % shots.length];
    const show = (i) => {
      cur = (i + shots.length) % shots.length;
      big.classList.add('ld');
      big.onload = () => big.classList.remove('ld');
      big.src = shots[cur].getAttribute('href');
      big.alt = shots[cur].querySelector('img').alt;
      count.textContent = (cur + 1) + ' / ' + shots.length;
      [cur + 1, cur - 1].forEach((j) => { new Image().src = at(j).getAttribute('href'); });
    };
    shots.forEach((a, i) => a.addEventListener('click', (e) => {
      e.preventDefault();
      show(i);
      lb.showModal();
      document.documentElement.style.overflow = 'hidden';
      if (window.__ncLenis) window.__ncLenis.stop();
    }));
    lb.addEventListener('close', () => {
      document.documentElement.style.overflow = '';
      if (window.__ncLenis) window.__ncLenis.start();
      shots[cur].focus({ preventScroll: true });
    });
    $('.lb-x', lb).addEventListener('click', () => lb.close());
    $('.lb-prev', lb).addEventListener('click', () => show(cur - 1));
    $('.lb-next', lb).addEventListener('click', () => show(cur + 1));
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(cur + 1);
      if (e.key === 'ArrowLeft') show(cur - 1);
    });
    stage.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    stage.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
      else if (e.target === stage) lb.close();
    });
  }

  const dock = $('.dock');
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    dock.classList.add('on');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.12, anchors: { offset: -64 } });
    window.__ncLenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* mobile button: shown after the hero, hidden while the booking form is on screen */
  ScrollTrigger.create({ trigger: '.hero', start: 'bottom 60%', endTrigger: '#zapisy', end: 'top 70%', toggleClass: { targets: dock, className: 'on' } });

  if (reduce) return;

  /* ---------- hero: the cut from the logo ---------- */
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  if (document.documentElement.classList.contains('nc-ready')) tl.play(); else addEventListener('nc-ready', () => tl.play(), { once: true });
  tl.from('.cut span', { opacity: 0, y: 26, duration: 0.7 }, 0.45)
    .fromTo('.cut-line', { opacity: 1, scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.45, ease: 'power2.in' }, 1.05)
    .to('.cut-a', { x: -3, duration: 0.5, ease: 'back.out(3)' }, 1.5)
    .to('.cut-b', { x: 3, duration: 0.5, ease: 'back.out(3)' }, 1.5)
    .to('.cut-line', { opacity: 0, duration: 0.5 }, 1.6)
    .from('.lead, .hero-cta', { opacity: 0, y: 18, duration: 0.6, stagger: 0.1 }, 0.9)
    .from('.shield', { opacity: 0, y: 30, duration: 0.9 }, 0.5)
    .from('.shield-line path', { strokeDashoffset: 1, duration: 1.4, ease: 'power2.inOut' }, 0.6)
    .from('.star-badge', { opacity: 0, scale: 0, rotate: -180, duration: 0.6, ease: 'back.out(2)' }, 1.7);
  gsap.to('.shield img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- ScrollVelocity: the strip speeds up and turns with the scroll ---------- */
  let x = 0, dir = -1, unitW = 0;
  const measure = () => { unitW = track.firstElementChild.offsetWidth; };
  measure();
  addEventListener('resize', measure, { passive: true });
  gsap.ticker.add((_, dt) => {
    const v = lenis ? lenis.velocity : 0;
    if (v > 0.2) dir = -1; else if (v < -0.2) dir = 1;
    x += dir * (0.05 + Math.min(Math.abs(v), 60) * 0.02) * dt;
    if (unitW) x = ((x % unitW) - unitW) % unitW;
    track.style.transform = `translate3d(${x}px,0,0)`;
  });

  /* ---------- reveals ---------- */
  gsap.set('[data-r]', { opacity: 0, y: 30 });
  ScrollTrigger.batch('[data-r]', { start: 'top 88%', once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09, overwrite: true }) });

  /* CountUp on prices */
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.1, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } }) });
  });

  /* tins roll in */
  $$('.spin').forEach((img, i) => gsap.from(img, { rotate: i ? 140 : -140, x: i ? 60 : -60, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: img, start: 'top 88%', once: true } }));
  gsap.from('.vgr img', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.vgr', start: 'top 85%', once: true } });

  /* Masonry (React Bits): photos rise out of a blur, one after another */
  gsap.set('.m-item', { opacity: 0, y: 60, filter: 'blur(10px)' });
  ScrollTrigger.batch('.m-item', { start: 'top 92%', once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true, clearProps: 'filter' }) });

  /* Maja's photo drifts slower than the page */
  gsap.fromTo('.about-pic img', { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.about-pic', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* photos: fan in, then TiltedCard under the mouse */
  const cards = $$('.cuts figure');
  const mm = gsap.matchMedia();
  mm.add('(min-width: 760px)', () => {
    gsap.from(cards, { opacity: 0, y: 70, rotate: (i) => [-8, 5, 9, -4][i % 4], duration: 1, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: '.cuts', start: 'top 82%', once: true } });
  });
  mm.add('(max-width: 759px)', () => {
    gsap.from(cards, { opacity: 0, x: 60, duration: 0.8, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.cuts', start: 'top 85%', once: true } });
  });
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cards.forEach((card) => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 16);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  const refresh = () => ScrollTrigger.refresh();
  addEventListener('load', refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
})();
