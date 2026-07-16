// Rise Traditional Chinese Medicine — shared site behavior
// Season theme (five-element / TCM solar-term palette), nav interactions,
// mobile drawer, and scroll-reveal animation. Vanilla JS, no dependencies.

(function () {
  'use strict';

  // ── Five-element season ────────────────────────────────────────────────
  // Fixed month/day boundaries (reused every year — solar terms drift by at
  // most a day or two, which isn't worth an astronomical calculation for a
  // color theme). "MMDD" strings compare correctly with plain <= / >=.
  var SEASONS = {
    wood:  { label: 'Wood · Spring',      logo: 'seal-wood.png',
      video: 'https://videos.pexels.com/video-files/11920003/11920003-hd_1920_1080_25fps.mp4',
      poster: 'https://images.pexels.com/videos/11920003/pexels-photo-11920003.jpeg?auto=compress&cs=tinysrgb&h=1080&fit=crop&w=1920' },
    fire:  { label: 'Fire · Summer',      logo: 'seal-rust.png',
      video: 'https://videos.pexels.com/video-files/15212046/15212046-hd_1920_1080_24fps.mp4',
      poster: 'https://images.pexels.com/videos/15212046/agriculture-antioxidant-background-branch-15212046.jpeg?auto=compress&cs=tinysrgb&h=1080&fit=crop&w=1920' },
    earth: { label: 'Earth · Long Summer', logo: 'seal-earth.png',
      video: 'https://videos.pexels.com/video-files/11202626/11202626-hd_2560_1440_30fps.mp4',
      poster: 'https://images.pexels.com/videos/11202626/pexels-photo-11202626.jpeg?auto=compress&cs=tinysrgb&h=1080&fit=crop&w=1920' },
    metal: { label: 'Metal · Autumn',     logo: 'seal-metal.png',
      video: 'https://videos.pexels.com/video-files/34684726/14701399_2560_1440_24fps.mp4',
      poster: 'https://images.pexels.com/videos/34684726/autumn-canada-34684726.jpeg?auto=compress&cs=tinysrgb&h=1080&fit=crop&w=1920' },
    water: { label: 'Water · Winter',     logo: 'seal-water.png',
      video: 'https://videos.pexels.com/video-files/34941942/14801356_1080_1920_60fps.mp4',
      poster: 'https://images.pexels.com/videos/34941942/pexels-photo-34941942.jpeg?auto=compress&cs=tinysrgb&h=1080&fit=crop&w=1920' }
  };

  function seasonForDate(date) {
    var md = String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
    if (md >= '0204' && md <= '0620') return 'wood';
    if (md >= '0621' && md <= '0807') return 'fire';
    if (md >= '0808' && md <= '0921') return 'earth';
    if (md >= '0922' && md <= '1106') return 'metal';
    return 'water'; // 11-07 .. 12-31 and 01-01 .. 02-03
  }

  function applySeason() {
    var root = document.querySelector('.site');
    if (!root) return;
    var assetRoot = (document.body.getAttribute('data-root') || './') + 'assets/images/';
    var key = seasonForDate(new Date());
    var s = SEASONS[key] || SEASONS.fire;

    root.className = root.className.replace(/\bseason-\S+/g, '').trim() + ' season-' + key;

    document.querySelectorAll('.brand-mark, .footer-mark').forEach(function (img) {
      img.src = assetRoot + s.logo;
    });
    document.querySelectorAll('.season-chip').forEach(function (el) {
      el.textContent = s.label;
    });

    var video = document.querySelector('.hero-video');
    if (video) {
      var source = video.querySelector('source');
      if (source) source.src = s.video;
      video.poster = s.poster;
      video.load();
      video.play().catch(function () {});
    }
  }

  // ── Desktop dropdown nav ────────────────────────────────────────────────
  function initDesktopNav() {
    var navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    var items = navLinks.querySelectorAll('.nav-item');

    function closeAll() {
      items.forEach(function (it) { it.classList.remove('open'); });
    }

    items.forEach(function (item) {
      var btn = item.querySelector('.nav-link');
      item.addEventListener('mouseenter', function () {
        closeAll();
        item.classList.add('open');
      });
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var wasOpen = item.classList.contains('open');
          closeAll();
          if (!wasOpen) item.classList.add('open');
        });
      }
    });

    navLinks.addEventListener('mouseleave', closeAll);
    document.addEventListener('click', function (e) {
      if (!navLinks.contains(e.target)) closeAll();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
  }

  // ── Mobile drawer ───────────────────────────────────────────────────────
  function initMobileDrawer() {
    var drawer = document.querySelector('.mobile-drawer');
    var toggles = document.querySelectorAll('.mobile-toggle, .mobile-drawer-close');
    if (!drawer || !toggles.length) return;

    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        drawer.classList.toggle('open');
      });
    });

    drawer.querySelectorAll('.m-acc').forEach(function (acc) {
      var head = acc.querySelector('.m-acc-head');
      var chevron = acc.querySelector('.m-acc-chevron');
      if (!head) return;
      head.addEventListener('click', function () {
        acc.classList.toggle('open');
        if (chevron) chevron.classList.toggle('m-open');
      });
    });
  }

  // ── Home nav scroll state ───────────────────────────────────────────────
  function initHomeNavScroll() {
    var nav = document.querySelector('.nav-home');
    if (!nav) return;
    function onScroll() {
      var scrolled = window.scrollY > 40;
      nav.classList.toggle('scrolled', scrolled);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Scroll-reveal ───────────────────────────────────────────────────────
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    applySeason();
    initDesktopNav();
    initMobileDrawer();
    initHomeNavScroll();
    initReveal();
  });
})();
