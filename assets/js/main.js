/* =========================================================
   HidrauMeister · Interações da página
   Cada recurso tem a sua função init*(). Elas são chamadas
   no final do arquivo; para desligar um recurso, basta
   comentar a chamada correspondente.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Configuração ---------- */
  var CONFIG = {
    whatsapp: '5511941940319',          // número que recebe o formulário
    email: 'hidraumeister@gmail.com',
    scrollShadowOffset: 10,             // px rolados até o cabeçalho ganhar sombra
    counterDuration: 1400               // ms da animação dos números
  };

  var hasObserver = 'IntersectionObserver' in window;

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

  /* ---------- Ano no rodapé ---------- */
  function initYear() {
    var el = $('#ano');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Cabeçalho com sombra ao rolar ---------- */
  function initHeader() {
    var header = $('.header');
    if (!header) return;
    function onScroll() {
      header.classList.toggle('is-scrolled', window.scrollY > CONFIG.scrollShadowOffset);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Logo volta ao topo ----------
     O alvo #topo é o próprio cabeçalho sticky, que nunca sai da
     tela; por isso o salto pela âncora não chegava ao topo. */
  function initLogo() {
    var logo = $('.nav__logo');
    if (!logo) return;
    logo.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0 });   // suave via CSS (scroll-behavior)
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    });
  }

  /* ---------- Menu mobile ---------- */
  function initMobileMenu() {
    var toggle = $('.nav__toggle');
    var menu = $('#menu');
    if (!toggle || !menu) return;

    function setMenu(open) {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }
    toggle.addEventListener('click', function () {
      setMenu(!menu.classList.contains('is-open'));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }

  /* ---------- Link ativo conforme a seção visível ---------- */
  function initActiveLink() {
    if (!hasObserver) return;
    var links = $$('.nav__menu a:not(.btn)');
    var sections = links
      .map(function (a) { return $(a.getAttribute('href')); })
      .filter(Boolean);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- Animação de entrada ---------- */
  function initReveal() {
    var items = $$('.reveal');
    if (!hasObserver) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 80 + 'ms';
      observer.observe(el);
    });
  }

  /* ---------- Contador animado ---------- */
  function initCounters() {
    var counters = $$('.counter');

    function animate(el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / CONFIG.counterDuration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!hasObserver) {
      counters.forEach(function (c) { c.textContent = c.getAttribute('data-target'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { observer.observe(c); });
  }

  /* ---------- Catálogo de peças: filtro + lightbox ---------- */
  function initCatalog() {
    var filters = $$('.filter');
    var parts = $$('.part');
    var lb = $('#lightbox');
    if (!parts.length || !lb) return;

    // Filtro por categoria (data-filter do botão = data-cat da peça)
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-filter');
        filters.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', String(active));
        });
        parts.forEach(function (p) {
          p.classList.toggle('is-hidden', cat !== 'todas' && p.getAttribute('data-cat') !== cat);
        });
      });
    });

    // Lightbox: navega apenas entre as peças visíveis no filtro atual
    var lbImg = $('img', lb);
    var lbCap = $('figcaption', lb);
    var current = 0;

    function visibleParts() {
      return parts.filter(function (p) { return !p.classList.contains('is-hidden'); });
    }
    function show(index) {
      var list = visibleParts();
      if (!list.length) return;
      current = (index + list.length) % list.length;
      var img = $('img', list[current]);
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = $('figcaption', list[current]).textContent;
    }
    function open(part) {
      show(visibleParts().indexOf(part));
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      $('.lightbox__close', lb).focus();
    }
    function close() {
      lb.hidden = true;
      document.body.style.overflow = '';
    }

    parts.forEach(function (p) {
      p.setAttribute('tabindex', '0');
      p.addEventListener('click', function () { open(p); });
      p.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(p); }
      });
    });
    $('.lightbox__close', lb).addEventListener('click', close);
    $('.lightbox__prev', lb).addEventListener('click', function () { show(current - 1); });
    $('.lightbox__next', lb).addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- Formulário de contato (WhatsApp ou e-mail) ---------- */
  function initContactForm() {
    var form = $('#form-contato');
    if (!form) return;
    var errorBox = $('.form__error', form);
    var f = form.elements;
    var via = 'whatsapp';

    // Máscara simples de telefone: (00) 00000-0000
    f.telefone.addEventListener('input', function () {
      var d = f.telefone.value.replace(/\D/g, '').slice(0, 11);
      var out = d;
      if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
      f.telefone.value = out;
    });

    // Cada botão de envio define o canal (data-via="whatsapp" | "email")
    $$('button[type="submit"]', form).forEach(function (b) {
      b.addEventListener('click', function () { via = b.getAttribute('data-via'); });
    });

    function validate() {
      var ok = true;
      ['nome', 'telefone', 'mensagem'].forEach(function (name) {
        var valid = f[name].value.trim().length > (name === 'telefone' ? 9 : 1);
        f[name].classList.toggle('is-invalid', !valid);
        if (!valid) ok = false;
      });
      errorBox.hidden = ok;
      return ok;
    }

    function buildMessage() {
      return [
        'Olá, vim pelo site da HidrauMeister.',
        '',
        'Nome: ' + f.nome.value.trim(),
        f.empresa.value.trim() ? 'Empresa: ' + f.empresa.value.trim() : null,
        'Telefone: ' + f.telefone.value.trim(),
        'Assunto: ' + f.assunto.value,
        '',
        f.mensagem.value.trim()
      ].filter(function (l) { return l !== null; }).join('\n');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;
      var text = buildMessage();
      if (via === 'email') {
        window.location.href = 'mailto:' + CONFIG.email +
          '?subject=' + encodeURIComponent('Orçamento pelo site: ' + f.assunto.value) +
          '&body=' + encodeURIComponent(text);
      } else {
        window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      }
    });
  }

  /* ---------- Inicialização ---------- */
  document.documentElement.classList.remove('no-js');
  initYear();
  initHeader();
  initLogo();
  initMobileMenu();
  initActiveLink();
  initReveal();
  initCounters();
  initCatalog();
  initContactForm();
})();
