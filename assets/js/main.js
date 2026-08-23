/* Md Shahjalal — portfolio interactions
   ------------------------------------------------------------------
   1. sticky nav state + mobile drawer
   2. scroll reveals
   3. seamless marquee
   4. mail handoff — Hire me + contact form, with a fallback panel
   5. pointer tilt on the work + stack cards
------------------------------------------------------------------ */

(function () {
  'use strict';

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. nav ──────────────────────────────────────────── */

  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');

  function onScroll() {
    nav.classList.toggle('is-stuck', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function shutDrawer() {
    drawer.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  }

  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') === 'true';
    if (open) {
      shutDrawer();
    } else {
      drawer.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
    }
  });

  drawer.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') shutDrawer();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      shutDrawer();
      burger.focus();
    }
  });

  /* ── 2. scroll reveals ──────────────────────────────── */

  var hidden = Array.prototype.slice.call(document.querySelectorAll('.rv'));

  if (calm || !('IntersectionObserver' in window)) {
    hidden.forEach(function (el) {
      el.classList.add('is-in');
    });
  } else {
    var reveal = new IntersectionObserver(
      function (rows, self) {
        rows.forEach(function (r) {
          if (r.isIntersecting) {
            r.target.classList.add('is-in');
            self.unobserve(r.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    hidden.forEach(function (el) {
      reveal.observe(el);
    });
  }

  /* ── 3. marquee: duplicate the track so the loop is seamless ── */

  var track = document.querySelector('.ledger__track');
  if (track && !calm) {
    track.innerHTML += track.innerHTML;
  }

  /* ── 4. mail handoff — Hire me + contact form ────────── */
  /* A mailto: link only works if the device has a mail app registered for it.
     On a fresh Windows install, and inside most in-app browsers, the click is
     swallowed silently — no navigation, no error. So: fire the mailto, then
     check whether we actually lost focus to something. If we didn't, the
     hand-off failed and we show the Gmail / copy panel instead. */

  var MAIL_TO = 'shahzalalkhan@gmail.com';

  var box = document.getElementById('mbox');
  var boxSu = document.getElementById('mbox-su');
  var boxSuRow = document.getElementById('mbox-surow');
  var boxBd = document.getElementById('mbox-bd');
  var boxGmail = document.getElementById('mbox-gmail');
  var boxCopy = document.getElementById('mbox-copy');
  var boxX = document.getElementById('mbox-x');
  var lastFocus = null;

  function q(s) {
    return encodeURIComponent(s);
  }

  function shutBox() {
    if (box.open) box.close();
    else box.removeAttribute('open');
    if (lastFocus) lastFocus.focus();
  }

  function openBox(subject, body) {
    boxSu.textContent = subject;
    boxSuRow.hidden = !subject;
    boxBd.textContent = body;
    boxBd.hidden = !body;

    boxGmail.href =
      'https://mail.google.com/mail/?view=cm&fs=1&to=' + q(MAIL_TO) +
      '&su=' + q(subject) + '&body=' + q(body);

    boxCopy.textContent = body ? 'Copy message' : 'Copy email address';
    boxCopy.classList.remove('is-done');
    boxCopy.setAttribute('data-clip', body ? MAIL_TO + '\n\n' + subject + '\n\n' + body : MAIL_TO);

    lastFocus = document.activeElement;
    if (typeof box.showModal === 'function') box.showModal();
    else box.setAttribute('open', '');
    boxGmail.focus();
  }

  function handoff(subject, body) {
    /* only trust the focus test if we had focus to begin with — inside a
       preview pane or an unfocused window it starts out false */
    var couldSee = document.hasFocus();
    var moved = false;
    function mark() {
      moved = true;
    }
    window.addEventListener('blur', mark);
    document.addEventListener('visibilitychange', mark);

    var link = document.createElement('a');
    link.href =
      'mailto:' + MAIL_TO + '?subject=' + q(subject) +
      (body ? '&body=' + q(body) : '');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(function () {
      window.removeEventListener('blur', mark);
      document.removeEventListener('visibilitychange', mark);
      if (couldSee && moved) return; // a mail app took over, nothing to do
      openBox(subject, body);
    }, 1200);
  }

  boxX.addEventListener('click', shutBox);
  box.addEventListener('close', function () {
    if (lastFocus) lastFocus.focus();
  });
  boxGmail.addEventListener('click', function () {
    window.setTimeout(shutBox, 200);
  });

  boxCopy.addEventListener('click', function () {
    var text = boxCopy.getAttribute('data-clip') || '';

    function done(label) {
      boxCopy.textContent = label;
      boxCopy.classList.add('is-done');
    }

    /* writeText needs a focused document and a secure context, so it can
       reject for reasons that have nothing to do with the user. Fall back to
       putting the whole payload on screen and selecting it — then they only
       have to press Ctrl+C, and worst case they can read it off the page. */
    function selectIt() {
      boxBd.hidden = false;
      boxBd.textContent = text;
      var range = document.createRange();
      range.selectNodeContents(boxBd);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

      var copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (err) {
        copied = false;
      }
      done(copied ? 'Copied' : 'Selected — press Ctrl+C');
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        done('Copied');
      }, selectIt);
    } else {
      selectIt();
    }
  });

  /* Hire me — keep the mailto in the href so no-JS and copy-link still work */
  var hire = document.getElementById('hire');
  if (hire) {
    hire.addEventListener('click', function (e) {
      e.preventDefault();
      handoff("Flutter role — let's talk", '');
    });
  }

  /* contact form. It carries novalidate: native bubbles don't render in every
     browser, and a submit that appears to do nothing is worse than an error. */
  var form = document.getElementById('form');
  if (form) {
    var REQUIRED = [
      { id: 'f-name', err: 'e-name' },
      { id: 'f-email', err: 'e-email' }
    ];

    function check(row) {
      var el = document.getElementById(row.id);
      var fld = el.closest('.fld');
      var ok = el.checkValidity() && el.value.trim() !== '';
      fld.classList.toggle('is-bad', !ok);
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (ok) el.removeAttribute('aria-describedby');
      else el.setAttribute('aria-describedby', row.err);
      return ok;
    }

    REQUIRED.forEach(function (row) {
      var el = document.getElementById(row.id);
      // clear the error as soon as they fix it, never nag while they type
      el.addEventListener('input', function () {
        if (el.closest('.fld').classList.contains('is-bad')) check(row);
      });
      el.addEventListener('blur', function () {
        if (el.value.trim() !== '') check(row);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var bad = REQUIRED.filter(function (row) {
        return !check(row);
      });
      if (bad.length) {
        document.getElementById(bad[0].id).focus();
        return;
      }

      var get = function (id) {
        return (document.getElementById(id).value || '').trim();
      };

      var name = get('f-name');
      var email = get('f-email');
      var company = get('f-company');
      var role = get('f-role');
      var msg = get('f-msg');

      var subject = role + ' opportunity' + (company ? ' at ' + company : '');

      var body =
        (msg || 'Hi Shahjalal — I would like to talk about a role.') +
        '\n\n—\n' +
        name +
        (company ? '\n' + company : '') +
        '\n' +
        email;

      handoff(subject, body);
    });
  }

  /* ── 5. pointer tilt on the work + stack cards ───────── */

  var cards = document.querySelectorAll('.proj__i, .grp');
  var TILT = 5; // max degrees on either axis — enough to read as depth, not a gimmick

  function tiltFrom(card, ev) {
    var b = card.getBoundingClientRect();
    var px = (ev.clientX - b.left) / b.width;   // 0 → 1 across
    var py = (ev.clientY - b.top) / b.height;   // 0 → 1 down
    // wide cards swing like a door on the Y axis, so damp that axis by width
    var yAmp = Math.min(TILT, TILT * 340 / b.width);
    card.style.setProperty('--ry', ((px - 0.5) * 2 * yAmp).toFixed(2) + 'deg');
    card.style.setProperty('--rx', ((0.5 - py) * 2 * TILT).toFixed(2) + 'deg');
    card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
  }

  function tiltReset(card) {
    card.classList.remove('is-tilt');
    card.style.removeProperty('--rx');
    card.style.removeProperty('--ry');
  }

  if (!calm && window.matchMedia('(hover: hover)').matches) {
    Array.prototype.forEach.call(cards, function (card) {
      var queued = false;
      var last = null;

      card.addEventListener('pointermove', function (ev) {
        if (ev.pointerType !== 'mouse') return;
        last = ev;
        card.classList.add('is-tilt');
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () {
          queued = false;
          if (last) tiltFrom(card, last);
        });
      });

      card.addEventListener('pointerleave', function () {
        last = null;
        tiltReset(card);
      });
    });
  }
})();
