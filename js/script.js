(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Tema claro / oscuro */
  var root = document.documentElement;
  try { var saved = localStorage.getItem('dc-theme'); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
  $('#theme').addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('dc-theme', next); } catch (e) {}
  });

  /* Menú del celular */
  var burger = $('#burger'), menu = $('#menu');
  function closeMenu() { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* Sombra del menú, efecto de la portada y enlace activo */
  var nav = $('#nav'), heroBg = $('#heroBg');
  var links = $$('#menu a'), sections = links.map(function (a) { return $(a.getAttribute('href')); });
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('scrolled', y > 10);
    if (heroBg && y < 900 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      heroBg.style.transform = 'translateY(' + (y * 0.25) + 'px)';
    }
    var cur = -1;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Aparecer al bajar */
  var items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  /* Palabras que cambian en la portada */
  var words = ['despensa', 'bebidas frías', 'licores y vinos', 'víveres frescos', 'congelados', 'snacks y galletas'];
  var wEl = $('#word'), wi = 0;
  setInterval(function () {
    wEl.classList.add('out');
    setTimeout(function () { wi = (wi + 1) % words.length; wEl.textContent = words[wi]; wEl.classList.remove('out'); }, 350);
  }, 2400);

  /* Filtros de productos */
  var tabs = $$('.tab'), cards = $$('.card');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.toggle('on', x === t); });
      var f = t.getAttribute('data-f');
      cards.forEach(function (c) { c.classList.toggle('hide', f !== 'all' && c.getAttribute('data-c') !== f); });
    });
  });

  /* Visor de fotos */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), idx = 0, shown = [];
  function show(i) {
    idx = (i + shown.length) % shown.length;
    var img = $('img', shown[idx]);
    lbImg.src = img.src; lbImg.alt = img.alt; lbCap.textContent = $('h3', shown[idx]).textContent;
  }
  function openLb(card) {
    shown = cards.filter(function (c) { return !c.classList.contains('hide'); });
    show(shown.indexOf(card)); lb.hidden = false; document.body.style.overflow = 'hidden';
  }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; }
  cards.forEach(function (c) { c.addEventListener('click', function () { openLb(c); }); });
  $('#lbX').addEventListener('click', closeLb);
  $('#lbP').addEventListener('click', function () { show(idx - 1); });
  $('#lbN').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  var sx = 0;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  });

  /* Abierto o cerrado (hora de República Dominicana) */
  function status() {
    var el = $('#open');
    try {
      var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Santo_Domingo', weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(new Date());
      var w = p.filter(function (x) { return x.type === 'weekday'; })[0].value;
      var h = parseInt(p.filter(function (x) { return x.type === 'hour'; })[0].value, 10) % 24;
      var d = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(w);
      var start = d === 0 ? 8 : 7, on = h >= start && h < 20;
      var nd = h < start ? d : (d + 1) % 7;
      el.innerHTML = on
        ? '<span class="dot"></span>Abierto ahora · hasta las 8:00 pm'
        : '<span class="dot off"></span>Cerrado · abrimos ' + (h < start ? 'hoy' : 'mañana') + ' a las ' + (nd === 0 ? '8' : '7') + ':00 am';
      $$('#hrs tr').forEach(function (r) { r.className = r.getAttribute('data-d').split(',').indexOf(String(d)) > -1 ? 'today' : ''; });
    } catch (e) {}
  }
  status(); setInterval(status, 60000);
})();
