/* =========================================================
   Mentoría de Pau Funes — interacciones y animaciones (GSAP)
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- Sin GSAP: mostrar todo y salir de las animaciones ---------- */
  if (!hasGsap) {
    root.classList.remove('js');
    initBasics(false);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  initBasics(true);

  var mm = gsap.matchMedia();

  /* ---------- Movimiento reducido: todo visible y estático ---------- */
  mm.add('(prefers-reduced-motion: reduce)', function () {
    gsap.set('[data-intro], [data-split], [data-phone]', { autoAlpha: 1 });
  });

  /* ---------- Animaciones completas ---------- */
  mm.add('(prefers-reduced-motion: no-preference)', function () {

    /* 1. Entrada de la portada */
    var title = document.querySelector('[data-split]');
    splitWords(title);

    var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
    intro
      .set('[data-split], [data-intro], [data-phone]', { autoAlpha: 1 })
      .from('.nav', { y: -30, autoAlpha: 0, duration: 1 })
      .from('.hero__name', { y: 20, autoAlpha: 0, duration: 1 }, '-=.7')
      .from('.hero__title .w > span', { yPercent: 110, duration: 1.2, stagger: .06 }, '-=.8')
      .from('[data-intro-rule]', { scaleX: 0, duration: 1.2, ease: 'power3.inOut' }, '-=.9')
      .from('.hero__lead', { y: 24, autoAlpha: 0, duration: 1 }, '-=.9')
      .from('.hero__ctas > *', { y: 24, autoAlpha: 0, duration: 1, stagger: .1 }, '-=.8')
      .from('.phone', { y: 80, rotate: 6, autoAlpha: 0, duration: 1.6 }, '-=1.4')
      .from('.phone__glow', { autoAlpha: 0, scale: .6, duration: 1.6 }, '<');

    /* 2. El teléfono flota y reacciona al scroll */
    gsap.to('.phone', { y: -14, duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.6 });
    gsap.to('.hero__visual', {
      yPercent: 18, rotate: -3, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.orb--a', { scale: 1.08, duration: 2.4, ease: 'sine.inOut', repeat: -1, yoyo: true });
    gsap.to('.orb--c', { rotate: 360, duration: 12, ease: 'none', repeat: -1 });

    /* 3. Subtítulos del Short del teléfono */
    playCaptions();

    /* 4. Cinta infinita */
    var track = document.querySelector('.marquee__track');
    if (track) {
      gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
    }

    /* 5. Contadores de cifras */
    gsap.utils.toArray('[data-count]').forEach(function (el) {
      var end = parseInt(el.getAttribute('data-count'), 10);
      var start = parseInt(el.getAttribute('data-from') || '0', 10);
      var obj = { v: start };
      el.textContent = start;
      gsap.to(obj, {
        v: end,
        duration: 1.8,
        ease: 'power2.out',
        snap: { v: 1 },
        onUpdate: function () { el.textContent = Math.round(obj.v); },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* 6. Revelado de títulos y textos */
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.from(el, {
        y: 40, autoAlpha: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* 7. Elementos en cascada */
    ScrollTrigger.batch('[data-stagger]', {
      start: 'top 90%',
      once: true,
      onEnter: function (batch) {
        gsap.from(batch, { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: .1 });
      }
    });

    /* 8. Línea dorada del proceso */
    gsap.from('.proc__line span', {
      scaleY: 0, ease: 'none',
      scrollTrigger: { trigger: '.proc', start: 'top 70%', end: 'bottom 70%', scrub: .6 }
    });
    gsap.utils.toArray('.proc__step').forEach(function (step) {
      ScrollTrigger.create({
        trigger: step, start: 'top 70%',
        onEnter: function () { step.classList.add('is-on'); },
        onLeaveBack: function () { step.classList.remove('is-on'); }
      });
      gsap.from(step.querySelector('div'), {
        x: 30, autoAlpha: 0, duration: .9, ease: 'expo.out',
        scrollTrigger: { trigger: step, start: 'top 85%', once: true }
      });
    });

    /* 9. Monograma de «Sobre mí» */
    gsap.from('.about__mark', {
      scale: .7, rotate: -20, autoAlpha: 0, duration: 1.4, ease: 'expo.out',
      scrollTrigger: { trigger: '.about', start: 'top 75%', once: true }
    });

    /* 10. Tarjeta de precio: entrada, contador y brillo */
    var card = document.querySelector('[data-price]');
    if (card) {
      var num = card.querySelector('[data-price-num]');
      var p = { v: 0 };
      var priceTl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 80%', once: true } });
      priceTl
        .from(card, { y: 60, autoAlpha: 0, duration: 1.2, ease: 'expo.out' })
        .from(card.querySelectorAll('li'), { x: -20, autoAlpha: 0, duration: .7, stagger: .08, ease: 'expo.out' }, '-=.7')
        .to(p, {
          v: 40, duration: 1.4, ease: 'power3.out', snap: { v: 1 },
          onUpdate: function () { num.textContent = Math.round(p.v); }
        }, '<');
      gsap.to('.price__shine', { left: '130%', duration: 2.4, ease: 'power2.inOut', repeat: -1, repeatDelay: 2.5 });
    }

    return function () { /* limpieza automática de gsap.matchMedia */ };
  });

  /* =========================================================
     Funciones
     ========================================================= */

  function initBasics(animated) {
    navOnScroll();
    stickyCta();
    faqAccordion(animated);
  }

  // Parte el título en palabras para animarlas desde una máscara
  function splitWords(el) {
    if (!el || el.dataset.splitDone) return;
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.textContent = '';
    nodes.forEach(function (node) {
      var isEm = node.nodeType === 1 && node.tagName === 'EM';
      var text = node.textContent;
      var target = el;
      if (isEm) { target = document.createElement('em'); el.appendChild(target); }
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { target.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span');
        w.className = 'w';
        var inner = document.createElement('span');
        inner.textContent = part;
        w.appendChild(inner);
        target.appendChild(w);
      });
    });
    el.dataset.splitDone = '1';
  }

  // Subtítulos palabra a palabra dentro del teléfono
  function playCaptions() {
    var cap = document.querySelector('.phone__caption');
    var bar = document.querySelector('.phone__progress span');
    if (!cap) return;
    var lines = [
      ['Sin', 'cámara'],
      ['Sin', 'saber', 'editar'],
      ['Solo', 'hablando', 'con', 'Claude']
    ];
    var keys = { 'cámara': 1, 'editar': 1, 'Claude': 1 };
    var tl = gsap.timeline({ repeat: -1, delay: 1.8 });
    lines.forEach(function (words) {
      tl.call(function () {
        cap.textContent = '';
        words.forEach(function (w, i) {
          var s = document.createElement('span');
          s.className = 'word' + (keys[w] ? ' is-key' : '');
          s.textContent = w;
          cap.appendChild(s);
          if (i < words.length - 1) cap.appendChild(document.createTextNode(' '));
        });
        gsap.from(cap.querySelectorAll('.word'), { y: 18, scale: .8, autoAlpha: 0, duration: .45, ease: 'back.out(2)', stagger: .18 });
      });
      tl.to({}, { duration: 2 });
      tl.to(cap, { autoAlpha: 0, duration: .25 });
      tl.set(cap, { autoAlpha: 1 });
    });
    if (bar) {
      gsap.fromTo(bar, { width: '0%' }, { width: '100%', duration: tl.duration(), ease: 'none', repeat: -1, delay: 1.8 });
    }
  }

  // Barra de navegación sólida al hacer scroll
  function navOnScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var update = function () { nav.classList.toggle('is-solid', window.scrollY > 40); };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // Botón fijo de compra en el móvil
  function stickyCta() {
    var bar = document.getElementById('sticky');
    var hero = document.querySelector('.hero');
    var end = document.getElementById('precio');
    if (!bar || !hero || !end || !('IntersectionObserver' in window)) return;
    var heroOut = false, endIn = false;
    var link = bar.querySelector('a');
    var update = function () {
      var show = heroOut && !endIn;
      bar.classList.toggle('is-shown', show);
      bar.setAttribute('aria-hidden', show ? 'false' : 'true');
      if (link) link.tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(function (e) { endIn = e[0].isIntersecting; update(); }).observe(end);
  }

  // Preguntas con apertura animada
  function faqAccordion(animated) {
    var items = document.querySelectorAll('.faq__item');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    Array.prototype.forEach.call(items, function (item) {
      var summary = item.querySelector('summary');
      var body = item.querySelector('.faq__a');
      if (!summary || !body || !animated || reduce) return;
      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (item.open) {
          gsap.to(body, {
            height: 0, autoAlpha: 0, duration: .45, ease: 'power3.inOut',
            onComplete: function () { item.open = false; gsap.set(body, { clearProps: 'all' }); }
          });
        } else {
          item.open = true;
          gsap.fromTo(body, { height: 0, autoAlpha: 0 }, {
            height: 'auto', autoAlpha: 1, duration: .55, ease: 'power3.out',
            onComplete: function () { gsap.set(body, { clearProps: 'height' }); }
          });
        }
      });
    });
  }
})();
