/* Motion enhancement: native browser APIs, no runtime dependencies. */
(function () {
  'use strict';
  var root = document.documentElement;
  var preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var toggle = document.querySelector('.motion-toggle');
  var saved = null;
  try { saved = localStorage.getItem('portfolio-motion'); } catch (err) { /* Optional storage. */ }
  var enabled = saved !== 'off' && !preference.matches;
  var progress = document.querySelector('.scroll-progress');
  var aura = document.querySelector('.cursor-aura');
  var pointerFrame = 0;
  var scrollFrame = 0;

  function applyMotion() {
    root.dataset.motion = enabled ? 'on' : 'off';
    toggle.setAttribute('aria-pressed', String(!enabled));
    toggle.setAttribute('aria-label', enabled ? 'Pause animations' : 'Enable animations');
    toggle.querySelector('.motion-toggle__label').textContent = enabled ? 'Motion on' : 'Motion off';
    if (!enabled) {
      aura.classList.remove('is-active');
      document.querySelectorAll('.btn').forEach(function (button) {
        button.style.removeProperty('translate');
      });
    }
    window.dispatchEvent(new Event('portfolio:motion'));
  }
  applyMotion();
  toggle.hidden = false;
  toggle.addEventListener('click', function () {
    enabled = !enabled;
    saved = enabled ? 'on' : 'off';
    try { localStorage.setItem('portfolio-motion', saved); } catch (err) { /* Optional storage. */ }
    applyMotion();
  });
  preference.addEventListener('change', function () {
    enabled = !preference.matches && saved !== 'off';
    applyMotion();
  });

  function updateProgress() {
    scrollFrame = 0;
    var distance = root.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0) + ')';
  }
  function queueProgress() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
  }
  window.addEventListener('scroll', queueProgress, { passive: true });
  window.addEventListener('resize', queueProgress, { passive: true });
  window.addEventListener('load', queueProgress);
  updateProgress();

  document.addEventListener('pointermove', function (event) {
    if (!enabled || !finePointer.matches || event.pointerType !== 'mouse') return;
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(function () {
      pointerFrame = 0;
      if (!enabled) return;
      aura.style.transform = 'translate3d(' + event.clientX + 'px,' + event.clientY + 'px,0)';
      aura.classList.add('is-active');
    });
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', function () {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    aura.classList.remove('is-active');
  });

  document.querySelectorAll('.hero__cta .btn, .nav__act .btn').forEach(function (button) {
    var frame = 0;
    button.addEventListener('pointermove', function (event) {
      if (!enabled || !finePointer.matches || event.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        if (!enabled) return;
        var box = button.getBoundingClientRect();
        var x = (event.clientX - box.left - box.width / 2) * .12;
        var y = (event.clientY - box.top - box.height / 2) * .18;
        button.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
      });
    });
    button.addEventListener('pointerleave', function () {
      cancelAnimationFrame(frame);
      button.style.removeProperty('translate');
    });
  });

  // Only the visible, aria-hidden copy counts up; assistive text stays stable.
  if ('IntersectionObserver' in window) {
    var counters = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        counters.unobserve(entry.target);
        if (!enabled) return;
        var number = entry.target;
        var original = number.textContent;
        var value = parseInt(original, 10);
        if (!Number.isFinite(value)) return;
        var textNode = number.firstChild;
        var accessible = document.createElement('span');
        accessible.className = 'sr-only';
        accessible.textContent = original;
        var visual = document.createElement('span');
        visual.className = 'stat-value';
        visual.setAttribute('aria-hidden', 'true');
        while (number.firstChild) visual.appendChild(number.firstChild);
        number.appendChild(accessible);
        number.appendChild(visual);
        var start = performance.now();
        function tick(now) {
          var fraction = enabled ? Math.min(1, (now - start) / 1200) : 1;
          textNode.nodeValue = String(Math.round(value * (1 - Math.pow(1 - fraction, 3))));
          if (fraction < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: .6 });
    document.querySelectorAll('.stats__i dd').forEach(function (number) { counters.observe(number); });
  }

  // Pause ambient animations when the tab is in the background.
  document.addEventListener('visibilitychange', function () {
    root.classList.toggle('page-asleep', document.hidden);
  });
})();
