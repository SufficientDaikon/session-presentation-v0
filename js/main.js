/* ============================================
   Session Presentation v0 — Interactivity
   ESM Module — Fitty + Pretext + BYOL reveal.js
   ============================================ */

import { prepare, layout } from 'https://esm.sh/@chenglou/pretext@0.0.5';

// ---- Reveal.js Init (BYOL mode — we own the layout) ----
Reveal.initialize({
  hash: true,
  transition: 'slide',
  transitionSpeed: 'default',
  backgroundTransition: 'fade',
  center: false,
  disableLayout: true,
  autoAnimateEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  autoAnimateDuration: 0.8,
  autoAnimateUnmatched: false,
  plugins: []
}).then(() => {

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
  let flowTimers = [];
  function animateFlow(slide) {
    flowTimers.forEach(id => clearTimeout(id));
    flowTimers = [];
    const steps = slide.querySelectorAll('.flow-step');
    steps.forEach((step, i) => {
      step.classList.remove('active');
      flowTimers.push(setTimeout(() => {
        step.classList.add('active');
      }, 400 * (i + 1)));
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

  // ---- Tool Category Filter (exposed to window for inline onclick) ----
  window.filterTools = function(category, btn) {
    const slide = btn.closest('section');
    const items = slide.querySelectorAll('.tool-item');

    slide.querySelectorAll('.btn[onclick*="filterTools"]').forEach(b => {
      b.classList.remove('btn-primary');
      b.classList.add('btn-ghost');
    });
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

  // ---- Fitty.js — display text auto-scaling (gated on fonts.ready) ----
  document.fonts.ready.then(() => {
    // Hero title
    fitty('.hero-title', { minSize: 16, maxSize: 80 });
    // Section numbers (01, 02, etc.)
    fitty('.section-number', { minSize: 24, maxSize: 200 });
    // Q&A icon
    fitty('.qa-icon', { minSize: 24, maxSize: 150 });
  });

  // ---- Pretext — smart text layout (gated on fonts.ready) ----
  const pretextCache = new Map();

  document.fonts.ready.then(() => {
    // Cache prepare() results for card paragraphs and flip card text
    document.querySelectorAll('.card p, .flip-card-front p, .flip-card-back .prompt-example').forEach(el => {
      const text = el.textContent.trim();
      if (text.length > 0) {
        const font = window.getComputedStyle(el).font;
        try {
          const prepared = prepare(text, font);
          pretextCache.set(el, prepared);
        } catch (e) {
          // Pretext prepare failed for element, skip silently
        }
      }
    });

    // Smart flip card heights — measure front + back, set min-height to taller
    document.querySelectorAll('.flip-card').forEach(card => {
      const front = card.querySelector('.flip-card-front');
      const back = card.querySelector('.flip-card-back');
      if (!front || !back) return;

      const containerWidth = card.offsetWidth - 56; // minus padding
      let maxHeight = 0;

      [front, back].forEach(face => {
        let totalHeight = 0;
        face.querySelectorAll('p, h4, .prompt-example, .flip-hint').forEach(el => {
          const cached = pretextCache.get(el);
          if (cached) {
            const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight) || 24;
            try {
              const measured = layout(cached, containerWidth, lineHeight);
              totalHeight += measured.height + 8;
            } catch (e) {
              totalHeight += el.offsetHeight + 8;
            }
          } else {
            totalHeight += el.offsetHeight + 8;
          }
        });
        maxHeight = Math.max(maxHeight, totalHeight);
      });

      if (maxHeight > 0) {
        card.style.minHeight = (maxHeight + 56) + 'px'; // add padding
      }
    });

    // Balanced card text — set max-width to prevent orphans
    pretextCache.forEach((prepared, el) => {
      if (!el.closest('.card') || el.closest('.flip-card')) return;
      const containerWidth = el.parentElement.offsetWidth;
      const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight) || 24;
      try {
        const measured = layout(prepared, containerWidth, lineHeight);
        if (measured.lines && measured.lines.length > 1) {
          let lo = containerWidth * 0.5;
          let hi = containerWidth;
          for (let i = 0; i < 8; i++) {
            const mid = (lo + hi) / 2;
            const test = layout(prepared, mid, lineHeight);
            if (test.lines.length > measured.lines.length) {
              lo = mid;
            } else {
              hi = mid;
            }
          }
          el.style.maxWidth = Math.ceil(hi) + 'px';
        }
      } catch (e) {
        // layout failed, skip balancing for this element
      }
    });
  });

  // ---- Overflow detection on slide change ----
  function checkOverflow(slide) {
    const content = slide.scrollHeight;
    const viewport = slide.clientHeight;
    if (content > viewport + 10) {
      slide.classList.add('has-overflow');
    } else {
      slide.classList.remove('has-overflow');
    }
  }

  // ---- Resize handler: re-run pretext layout() (cheap) ----
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Re-run flip card height calculations
      document.querySelectorAll('.flip-card').forEach(card => {
        const front = card.querySelector('.flip-card-front');
        const back = card.querySelector('.flip-card-back');
        if (!front || !back) return;

        const containerWidth = card.offsetWidth - 56;
        let maxHeight = 0;

        [front, back].forEach(face => {
          let totalHeight = 0;
          face.querySelectorAll('p, h4, .prompt-example, .flip-hint').forEach(el => {
            const cached = pretextCache.get(el);
            if (cached) {
              const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight) || 24;
              try {
                const measured = layout(cached, containerWidth, lineHeight);
                totalHeight += measured.height + 8;
              } catch (e) {
                totalHeight += el.offsetHeight + 8;
              }
            } else {
              totalHeight += el.offsetHeight + 8;
            }
          });
          maxHeight = Math.max(maxHeight, totalHeight);
        });

        if (maxHeight > 0) {
          card.style.minHeight = (maxHeight + 56) + 'px';
        }
      });

      // Check overflow on current slide
      const current = Reveal.getCurrentSlide();
      if (current) checkOverflow(current);
    }, 150);
  });

  // ---- Reveal slide change event ----
  Reveal.on('slidechanged', event => {
    const slide = event.currentSlide;

    // Counters (non-fragment)
    slide.querySelectorAll('[data-counter]').forEach(el => {
      if (!el.closest('.fragment')) {
        animateCounter(el);
      }
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

    // Overflow check
    checkOverflow(slide);
  });

  // ---- Fragment shown: animate counters inside revealed fragments ----
  Reveal.on('fragmentshown', event => {
    const fragment = event.fragment;
    fragment.querySelectorAll('[data-counter]').forEach(el => {
      animateCounter(el);
    });
    animateProgressBars(fragment);
  });

  // Trigger animations for initial slide
  const firstSlide = Reveal.getCurrentSlide();
  if (firstSlide) {
    firstSlide.querySelectorAll('[data-counter]').forEach(el => {
      if (!el.closest('.fragment')) animateCounter(el);
    });
    animateProgressBars(firstSlide);
    checkOverflow(firstSlide);
  }
}).catch(err => {
  console.error('Reveal.js initialization failed:', err);
}); // end Reveal.initialize()
