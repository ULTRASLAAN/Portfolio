const revealElements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
  }
);

revealElements.forEach((el) => observer.observe(el));

const canvas = document.getElementById('space-canvas');

if (canvas) {
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const stars = [];
    const comets = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let cometTimer = 0;

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stars.length = 0;
      const density = Math.floor((width * height) / 2200);

      for (let i = 0; i < density; i += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: rand(0.35, 1.65),
          alpha: rand(0.2, 0.95),
          twinkleSpeed: rand(0.003, 0.018),
          twinkleOffset: rand(0, Math.PI * 2),
          hue: Math.random() > 0.88 ? rand(38, 50) : rand(196, 220),
        });
      }
    }

    function spawnComet() {
      const startY = rand(height * 0.15, height * 0.78);
      comets.push({
        x: -120,
        y: startY,
        speed: rand(2.8, 4.6),
        size: rand(1.8, 3),
        angle: rand(-0.38, -0.2),
        trail: rand(170, 340),
        alpha: rand(0.5, 0.95),
      });
    }

    function drawSpaceBackground() {
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#02030b');
      bgGradient.addColorStop(0.45, '#040914');
      bgGradient.addColorStop(1, '#010208');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      const galaxy = ctx.createRadialGradient(width * 0.82, height * 0.2, 0, width * 0.82, height * 0.2, Math.min(width, height) * 0.24);
      galaxy.addColorStop(0, 'rgba(255,255,255,0.16)');
      galaxy.addColorStop(0.32, 'rgba(170,205,255,0.09)');
      galaxy.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = galaxy;
      ctx.fillRect(0, 0, width, height);
    }

    function drawStars(time) {
      for (let i = 0; i < stars.length; i += 1) {
        const star = stars[i];
        const pulse = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.22;
        const alpha = Math.max(0.08, star.alpha + pulse);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${star.hue}, 95%, 88%, ${alpha})`;
        ctx.fill();
      }
    }

    function drawComets() {
      for (let i = comets.length - 1; i >= 0; i -= 1) {
        const comet = comets[i];
        const vx = comet.speed;
        const vy = comet.speed * comet.angle;
        comet.x += vx;
        comet.y += vy;

        const tailX = comet.x - comet.trail;
        const tailY = comet.y - comet.trail * comet.angle;

        const trailGradient = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
        trailGradient.addColorStop(0, `rgba(133, 235, 255, ${comet.alpha})`);
        trailGradient.addColorStop(0.35, `rgba(133, 196, 255, ${comet.alpha * 0.5})`);
        trailGradient.addColorStop(1, 'rgba(133, 196, 255, 0)');

        ctx.lineWidth = comet.size;
        ctx.lineCap = 'round';
        ctx.strokeStyle = trailGradient;
        ctx.beginPath();
        ctx.moveTo(comet.x, comet.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        const headGlow = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, comet.size * 8);
        headGlow.addColorStop(0, `rgba(190, 245, 255, ${Math.min(1, comet.alpha + 0.2)})`);
        headGlow.addColorStop(0.5, `rgba(99, 216, 255, ${comet.alpha * 0.45})`);
        headGlow.addColorStop(1, 'rgba(99, 216, 255, 0)');

        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, comet.size * 8, 0, Math.PI * 2);
        ctx.fill();

        if (comet.x - comet.trail > width + 140 || comet.y < -120 || comet.y > height + 120) {
          comets.splice(i, 1);
        }
      }
    }

    function animate(time) {
      drawSpaceBackground();
      drawStars(time);

      cometTimer += 1;
      if (cometTimer > rand(120, 260) && comets.length < 2) {
        spawnComet();
        cometTimer = 0;
      }

      drawComets();
      requestAnimationFrame(animate);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    requestAnimationFrame(animate);
  }
}
