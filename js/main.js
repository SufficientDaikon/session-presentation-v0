/* ============================================
   Session Presentation v0 — Interactivity
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize reveal.js
  Reveal.initialize({
    hash: true,
    transition: 'slide',
    transitionSpeed: 'default',
    backgroundTransition: 'fade',
    center: false,
    width: 1280,
    height: 720,
    margin: 0.04,
    minScale: 0.2,
    maxScale: 2.0,
    autoAnimateEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    autoAnimateDuration: 0.8,
    autoAnimateUnmatched: false,
    plugins: []
  });

  // ---- Flip Cards ----
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });

  // ---- Animated Counters ----
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ---- Progress Bars ----
  function animateProgressBars(slide) {
    slide.querySelectorAll('.progress-bar-fill').forEach(bar => {
      const target = bar.dataset.width || '0%';
      bar.style.width = '0%';
      setTimeout(() => { bar.style.width = target; }, 200);
    });
  }

  // ---- Flow Diagram Animation ----
  function animateFlow(slide) {
    const steps = slide.querySelectorAll('.flow-step');
    steps.forEach((step, i) => {
      step.classList.remove('active');
      setTimeout(() => {
        step.classList.add('active');
      }, 400 * (i + 1));
    });
  }

  // ---- Typing Effect ----
  function typeText(el) {
    const text = el.dataset.text || el.textContent;
    el.textContent = '';
    el.classList.add('typing-text');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => el.classList.remove('typing-text'), 1000);
      }
    }, 40);
  }

  // ---- Tool Category Filter ----
  window.filterTools = function(category, btn) {
    const slide = btn.closest('section');
    const items = slide.querySelectorAll('.tool-item');

    // Update active button
    slide.querySelectorAll('.btn').forEach(b => b.classList.remove('btn-primary'));
    btn.classList.add('btn-primary');
    btn.classList.remove('btn-ghost');

    items.forEach(item => {
      if (category === 'all' || item.dataset.category === category) {
        item.style.display = 'flex';
        item.style.animation = 'fade-up 0.3s ease both';
      } else {
        item.style.display = 'none';
      }
    });
  };

  // ---- Prompt before/after toggle ----
  window.togglePrompt = function(btn) {
    const container = btn.closest('.prompt-toggle-container');
    const before = container.querySelector('.prompt-before');
    const after = container.querySelector('.prompt-after');

    if (before.style.display !== 'none') {
      before.style.display = 'none';
      after.style.display = 'block';
      btn.textContent = 'Show Bad Version';
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-primary');
    } else {
      before.style.display = 'block';
      after.style.display = 'none';
      btn.textContent = 'Show Better Version';
      btn.classList.add('btn-outline');
      btn.classList.remove('btn-primary');
    }
  };

  // ---- Reveal slide change event ----
  Reveal.on('slidechanged', event => {
    const slide = event.currentSlide;

    // Counters
    slide.querySelectorAll('[data-counter]').forEach(el => {
      animateCounter(el);
    });

    // Progress bars
    animateProgressBars(slide);

    // Flow diagrams
    if (slide.querySelector('.flow-diagram')) {
      animateFlow(slide);
    }

    // Typing
    slide.querySelectorAll('[data-typing]').forEach(el => {
      typeText(el);
    });
  });

  // Trigger animations for initial slide too
  const firstSlide = Reveal.getCurrentSlide();
  if (firstSlide) {
    firstSlide.querySelectorAll('[data-counter]').forEach(animateCounter);
    animateProgressBars(firstSlide);
  }
});
