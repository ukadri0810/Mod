(() => {
  'use strict';

  const doc = document;
  const body = doc.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------
     Loader — simulated motion tied to critical assets.
     It has a hard safety exit, so it can never trap users.
  -------------------------------------------------- */
  const preloader = doc.getElementById('preloader');
  const loaderWords = doc.getElementById('loaderWords');
  const loaderBar = doc.getElementById('loaderBar');
  const loaderCount = doc.getElementById('loaderCount');
  const loaderStatus = doc.getElementById('loaderStatus');

  function criticalAssetPromise(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = resolve;
      image.src = src;
      if (image.complete) resolve();
    });
  }

  function startLoader() {
    const skipLoader = new URLSearchParams(window.location.search).has('skipLoader');
    if (skipLoader) {
      preloader?.setAttribute('aria-hidden', 'true');
      body.classList.remove('is-loading');
      body.classList.add('site-ready');
      return;
    }
    if (!preloader || !loaderWords || !loaderBar || !loaderCount) {
      body.classList.remove('is-loading');
      return;
    }

    const minDuration = reducedMotion ? 500 : 2450;
    const maxDuration = reducedMotion ? 900 : 4700;
    const started = performance.now();
    let criticalReady = false;
    let displayed = 0;
    let finished = false;
    let lastWord = -1;

    Promise.all([
      criticalAssetPromise('assets/logo-transparent.png'),
      criticalAssetPromise('assets/pizza.webp'),
      criticalAssetPromise('assets/burger.webp')
    ]).then(() => { criticalReady = true; });

    const statuses = [
      'Warming up the grill.',
      'Melting the cheese.',
      'Adding a little heat.',
      'Finishing with something sweet.',
      'Your mood is ready.'
    ];

    function paint(value) {
      const progress = Math.max(0, Math.min(value, 1));
      const percent = Math.round(progress * 100);
      loaderBar.style.width = `${percent}%`;
      loaderCount.textContent = String(percent).padStart(2, '0');

      const index = Math.min(4, Math.floor(progress * 4.3));
      if (index !== lastWord) {
        const word = loaderWords.querySelector('span');
        const wordHeight = word?.getBoundingClientRect().height || 100;
        loaderWords.style.transform = `translate3d(0, -${index * wordHeight}px, 0)`;
        if (loaderStatus) loaderStatus.textContent = statuses[index];
        lastWord = index;
      }
    }

    function finish() {
      if (finished) return;
      finished = true;
      paint(1);
      preloader.classList.add('is-complete');

      window.setTimeout(() => {
        preloader.classList.add('is-exiting');
        body.classList.remove('is-loading');
        body.classList.add('site-ready');

        window.setTimeout(() => {
          preloader.setAttribute('aria-hidden', 'true');
        }, reducedMotion ? 50 : 1250);
      }, reducedMotion ? 60 : 320);
    }

    function frame(now) {
      if (finished) return;
      const elapsed = now - started;
      const timeRatio = Math.min(elapsed / minDuration, 1);
      let target = timeRatio * 0.88;

      if (elapsed >= minDuration) {
        target = criticalReady ? 1 : 0.92 + Math.min((elapsed - minDuration) / 1500, 1) * 0.08;
      }
      if (elapsed >= maxDuration) target = 1;

      displayed += (target - displayed) * (reducedMotion ? 0.42 : 0.085);
      if (target === 1 && displayed > 0.992) displayed = 1;
      paint(displayed);

      if (displayed >= 1) finish();
      else requestAnimationFrame(frame);
    }

    paint(0);
    requestAnimationFrame(frame);
    window.setTimeout(finish, maxDuration + 900);
  }

  startLoader();

  /* -------------------------------------------------
     Navigation
  -------------------------------------------------- */
  const header = doc.querySelector('.site-header');
  const menuToggle = doc.getElementById('menuToggle');
  const mobileMenu = doc.getElementById('mobileMenu');

  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    body.style.overflow = open ? 'hidden' : '';
  }

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  window.addEventListener('scroll', () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
  }, { passive: true });

  /* -------------------------------------------------
     Cinematic hero carousel
  -------------------------------------------------- */
  const hero = doc.querySelector('.hero');
  const slides = Array.from(doc.querySelectorAll('.hero-slide'));
  const backdrops = Array.from(doc.querySelectorAll('.hero-backdrop'));
  const heroMood = doc.getElementById('heroMood');
  const heroCopy = doc.getElementById('heroCopy');
  const heroDish = doc.getElementById('heroDish');
  const heroLabel = doc.getElementById('heroLabel');
  const heroIndex = doc.getElementById('heroIndex');
  const heroPrev = doc.getElementById('heroPrev');
  const heroNext = doc.getElementById('heroNext');
  const heroPause = doc.getElementById('heroPause');
  const heroMedia = doc.getElementById('heroMedia');

  let currentSlide = 0;
  let heroTimer = null;
  let paused = false;
  let changing = false;
  const interval = reducedMotion ? 8500 : 5800;

  slides.forEach(slide => {
    slide.style.setProperty('--position', slide.dataset.position || '68% 50%');
    slide.style.setProperty('--mobile-position', slide.dataset.mobilePosition || '60% 50%');
  });

  function restartProgress() {
    if (!hero || paused) return;
    hero.classList.remove('is-running');
    void hero.offsetWidth;
    hero.classList.add('is-running');
  }

  function schedule() {
    window.clearTimeout(heroTimer);
    if (paused || slides.length < 2) return;
    restartProgress();
    heroTimer = window.setTimeout(() => showSlide(currentSlide + 1), interval);
  }

  function updateText(slide, index) {
    const accent = slide.dataset.accent || '#f18a1a';
    hero?.style.setProperty('--hero-accent', accent);
    if (heroMood) heroMood.textContent = slide.dataset.mood || '';
    if (heroCopy) heroCopy.textContent = slide.dataset.copy || '';
    if (heroDish) heroDish.textContent = slide.dataset.title || '';
    if (heroLabel) heroLabel.textContent = slide.dataset.label || '';
    if (heroIndex) heroIndex.textContent = String(index + 1).padStart(2, '0');
  }

  function showSlide(next, immediate = false) {
    if (!slides.length || changing) return;
    const normalized = (next + slides.length) % slides.length;
    if (normalized === currentSlide && !immediate) {
      schedule();
      return;
    }

    changing = true;
    window.clearTimeout(heroTimer);
    hero?.classList.add('is-changing');

    const delay = immediate || reducedMotion ? 0 : 260;
    window.setTimeout(() => {
      slides[currentSlide]?.classList.remove('is-active');
      backdrops[currentSlide]?.classList.remove('is-active');
      slides[normalized]?.classList.add('is-active');
      backdrops[normalized]?.classList.add('is-active');
      currentSlide = normalized;
      updateText(slides[currentSlide], currentSlide);

      requestAnimationFrame(() => {
        hero?.classList.remove('is-changing');
        changing = false;
        schedule();
      });
    }, delay);
  }

  function setPaused(nextState) {
    paused = nextState;
    window.clearTimeout(heroTimer);
    hero?.classList.toggle('is-running', !paused);
    if (heroPause) {
      heroPause.textContent = paused ? '▶' : 'Ⅱ';
      heroPause.setAttribute('aria-label', paused ? 'Resume automatic slides' : 'Pause automatic slides');
    }
    if (!paused) schedule();
  }

  heroPrev?.addEventListener('click', () => showSlide(currentSlide - 1));
  heroNext?.addEventListener('click', () => showSlide(currentSlide + 1));
  heroPause?.addEventListener('click', () => setPaused(!paused));

  // Swipe support for phones and tablets.
  let touchStartX = 0;
  let touchStartY = 0;
  heroMedia?.addEventListener('touchstart', event => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });
  heroMedia?.addEventListener('touchend', event => {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      showSlide(dx < 0 ? currentSlide + 1 : currentSlide - 1);
    }
  }, { passive: true });

  doc.addEventListener('visibilitychange', () => {
    if (doc.hidden) {
      window.clearTimeout(heroTimer);
      hero?.classList.remove('is-running');
    } else if (!paused) {
      schedule();
    }
  });

  if (slides.length) {
    updateText(slides[0], 0);
    schedule();
  }

  /* -------------------------------------------------
     Mood filtering
  -------------------------------------------------- */
  const moodButtons = Array.from(doc.querySelectorAll('.mood-tabs button'));
  const dishes = Array.from(doc.querySelectorAll('.dish-card'));

  moodButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
      moodButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });

      dishes.forEach(card => {
        const categories = (card.dataset.category || '').split(/\s+/);
        const visible = filter === 'all' || categories.includes(filter);
        card.classList.toggle('is-filtered-out', !visible);
      });
    });
  });

  /* -------------------------------------------------
     Reveal-on-scroll — small movement only.
  -------------------------------------------------- */
  const revealItems = Array.from(doc.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }
})();
