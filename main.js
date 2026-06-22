/* ============================================================
   COSMOS CANVAS — large-scale structure node graph
   Nodes drift slowly; edges drawn to neighbours within radius.
   Mouse proximity adds gentle attraction/repulsion.
   ============================================================ */
(function () {
  const canvas = document.getElementById('cosmosCanvas');
  const ctx = canvas.getContext('2d');

  let W, H, nodes = [], mouse = { x: -9999, y: -9999 };
  const NODE_COUNT = 90;
  const LINK_RADIUS = 180;
  const MOUSE_RADIUS = 140;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomNode() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r:  Math.random() * 1.6 + 0.5,
    };
  }

  function init() {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, randomNode);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_RADIUS) {
          const alpha = (1 - d / LINK_RADIUS) * 0.35;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(99,179,237,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    // nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(118,228,247,0.75)';
      ctx.fill();
    });
  }

  function update() {
    nodes.forEach(n => {
      // mouse attraction (subtle)
      const mdx = mouse.x - n.x;
      const mdy = mouse.y - n.y;
      const md  = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < MOUSE_RADIUS && md > 0) {
        const force = (MOUSE_RADIUS - md) / MOUSE_RADIUS * 0.018;
        n.vx += mdx / md * force;
        n.vy += mdy / md * force;
      }

      n.x += n.vx;
      n.y += n.vy;

      // dampen velocity
      n.vx *= 0.992;
      n.vy *= 0.992;

      // wrap edges
      if (n.x < -20)  n.x = W + 20;
      if (n.x > W+20) n.x = -20;
      if (n.y < -20)  n.y = H + 20;
      if (n.y > H+20) n.y = -20;
    });
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); });
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  window.addEventListener('touchmove', e => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouse.x = touch.clientX - rect.left;
    mouse.y = touch.clientY - rect.top;
  }, { passive: true });

  init();
  loop();
})();


/* ============================================================
   NAVBAR — scroll & active link
   ============================================================ */
(function () {
  const navbar  = document.getElementById('navbar');
  const links   = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    // active nav highlight
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ============================================================
   MOBILE MENU
   ============================================================ */
(function () {
  const toggle = document.getElementById('navToggle');
  const menu   = document.querySelector('.nav-links');

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  // close on link click
  menu.querySelectorAll('.nav-link').forEach(l => {
    l.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    });
  });
})();


/* ============================================================
   SCROLL REVEAL
   ============================================================ */
(function () {
  const reveals = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('visible'));
    return;
  }

  // stagger children inside each section
  document.querySelectorAll('.research-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.12}s`;
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => io.observe(el));
})();
