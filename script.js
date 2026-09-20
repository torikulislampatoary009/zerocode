/**
 * ZeroCode Master Engine
 * Fully Vanilla JS - Modular, Interactive, High Performance
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Audio System (Web Audio API)
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
  }

  function playTone(freq, type = "triangle", duration = 0.3) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (audioCtx.state === "suspended") audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context restricted before user interaction", e);
    }
  }

  // Audio button toggle
  const soundBtn = document.getElementById("sound-toggle");
  const soundIcon = document.getElementById("sound-status-icon");
  soundBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
    if (soundEnabled) playTone(523.25, "sine", 0.1);
  });

  // 2. Navigation & Theming
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.target);
      if (target) target.classList.add("active");
      playTone(440, "sine", 0.05);
    });
  });

  const themeSelect = document.getElementById("theme-select");
  themeSelect.addEventListener("change", (e) => {
    document.body.setAttribute("data-theme", e.target.value);
  });

  // 3. Analytics & Dynamic Canvas Chart Engine
  const metricsData = [
    { label: "Performance", value: 92, category: "Core" },
    { label: "Accessibility", value: 88, category: "UX" },
    { label: "Stability", value: 95, category: "Engine" },
    { label: "Creativity", value: 85, category: "Design" },
    { label: "Speed", value: 90, category: "Core" }
  ];

  let currentChartType = "bar";
  const metricsBody = document.getElementById("metrics-body");
  const chartCanvas = document.getElementById("chart-canvas");
  const chartCtx = chartCanvas.getContext("2d");

  function renderTable() {
    metricsBody.innerHTML = "";
    metricsData.forEach((row, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" value="${row.label}" data-index="${index}" data-field="label" /></td>
        <td><input type="number" min="0" max="100" value="${row.value}" data-index="${index}" data-field="value" /></td>
        <td><input type="text" value="${row.category}" data-index="${index}" data-field="category" /></td>
        <td><button class="btn btn-sm btn-danger btn-del" data-index="${index}">&times;</button></td>
      `;
      metricsBody.appendChild(tr);
    });
    calculateStats();
    drawChart();
  }

  function calculateStats() {
    const values = metricsData.map(d => Number(d.value) || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = values.length ? (sum / values.length).toFixed(1) : 0;
    const max = values.length ? Math.max(...values) : 0;

    document.getElementById("stats-summary").innerHTML = `
      <div class="stats-item"><span>Total Metrics</span><strong>${metricsData.length}</strong></div>
      <div class="stats-item"><span>Average Score</span><strong>${avg}</strong></div>
      <div class="stats-item"><span>Peak Metric</span><strong>${max}</strong></div>
    `;
  }

  function drawChart() {
    const width = chartCanvas.width;
    const height = chartCanvas.height;
    chartCtx.clearRect(0, 0, width, height);

    if (metricsData.length === 0) return;

    const accentColor = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#38bdf8";

    if (currentChartType === "bar") {
      const padding = 40;
      const barWidth = (width - padding * 2) / metricsData.length - 12;
      metricsData.forEach((d, i) => {
        const x = padding + i * (barWidth + 12);
        const barHeight = (d.value / 100) * (height - 80);
        const y = height - padding - barHeight;

        chartCtx.fillStyle = accentColor;
        chartCtx.beginPath();
        chartCtx.roundRect ? chartCtx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]) : chartCtx.rect(x, y, barWidth, barHeight);
        chartCtx.fill();

        // Labels
        chartCtx.fillStyle = "#8899ac";
        chartCtx.font = "11px sans-serif";
        chartCtx.textAlign = "center";
        chartCtx.fillText(d.label.substring(0, 7), x + barWidth / 2, height - 15);
        chartCtx.fillText(`${d.value}`, x + barWidth / 2, y - 6);
      });
    } else if (currentChartType === "line") {
      const padding = 40;
      chartCtx.beginPath();
      chartCtx.strokeStyle = accentColor;
      chartCtx.lineWidth = 3;

      metricsData.forEach((d, i) => {
        const x = padding + (i / (metricsData.length - 1 || 1)) * (width - padding * 2);
        const y = height - padding - (d.value / 100) * (height - 80);
        if (i === 0) chartCtx.moveTo(x, y);
        else chartCtx.lineTo(x, y);
      });
      chartCtx.stroke();

      metricsData.forEach((d, i) => {
        const x = padding + (i / (metricsData.length - 1 || 1)) * (width - padding * 2);
        const y = height - padding - (d.value / 100) * (height - 80);
        chartCtx.fillStyle = "#ffffff";
        chartCtx.beginPath();
        chartCtx.arc(x, y, 5, 0, Math.PI * 2);
        chartCtx.fill();
        chartCtx.stroke();
      });
    } else if (currentChartType === "radar") {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 90;
      const total = metricsData.length;

      chartCtx.beginPath();
      chartCtx.strokeStyle = "rgba(136, 153, 172, 0.3)";
      chartCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      chartCtx.stroke();

      chartCtx.beginPath();
      chartCtx.fillStyle = "rgba(56, 189, 248, 0.35)";
      chartCtx.strokeStyle = accentColor;
      chartCtx.lineWidth = 2;

      metricsData.forEach((d, i) => {
        const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
        const dist = (d.value / 100) * radius;
        const x = centerX + Math.cos(angle) * dist;
        const y = centerY + Math.sin(angle) * dist;
        if (i === 0) chartCtx.moveTo(x, y);
        else chartCtx.lineTo(x, y);
      });
      chartCtx.closePath();
      chartCtx.fill();
      chartCtx.stroke();
    }
  }

  // Table & Chart Event Listeners
  metricsBody.addEventListener("input", (e) => {
    const idx = e.target.dataset.index;
    const field = e.target.dataset.field;
    if (idx !== undefined && field) {
      metricsData[idx][field] = field === "value" ? Number(e.target.value) : e.target.value;
      calculateStats();
      drawChart();
    }
  });

  metricsBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-del")) {
      const idx = e.target.dataset.index;
      metricsData.splice(idx, 1);
      renderTable();
    }
  });

  document.getElementById("btn-add-metric").addEventListener("click", () => {
    metricsData.push({ label: "Metric " + (metricsData.length + 1), value: 75, category: "Custom" });
    renderTable();
    playTone(600, "sine", 0.08);
  });

  document.getElementById("btn-randomize").addEventListener("click", () => {
    metricsData.forEach(d => d.value = Math.floor(Math.random() * 80) + 20);
    renderTable();
    playTone(500, "square", 0.08);
  });

  document.querySelectorAll(".chart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".chart-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentChartType = btn.dataset.type;
      drawChart();
      playTone(700, "sine", 0.05);
    });
  });

  // 4. Interactive Physics Particle Engine
  const pCanvas = document.getElementById("physics-canvas");
  const pCtx = pCanvas.getContext("2d");
  let particles = [];
  let particleMode = "connect";
  let mouse = { x: null, y: null, radius: 100 };

  function resizePhysicsCanvas() {
    pCanvas.width = pCanvas.parentElement.clientWidth;
    pCanvas.height = 480;
  }
  window.addEventListener("resize", () => {
    resizePhysicsCanvas();
    drawChart();
  });
  resizePhysicsCanvas();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * pCanvas.width;
      this.y = Math.random() * pCanvas.height;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.radius = Math.random() * 2.5 + 1.5;
    }
    update() {
      if (particleMode === "gravity") {
        this.vy += 0.08;
      }

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          if (particleMode === "vortex") {
            this.vx += -dy * 0.03;
            this.vy += dx * 0.03;
          } else {
            const force = (mouse.radius - dist) / mouse.radius;
            this.vx -= (dx / dist) * force * 3;
            this.vy -= (dy / dist) * force * 3;
          }
        }
      }

      this.x += this.vx;
      this.y += this.vy;

      // Wall bounce
      if (this.x < 0 || this.x > pCanvas.width) this.vx *= -0.9;
      if (this.y < 0 || this.y > pCanvas.height) {
        if (particleMode === "gravity" && this.y > pCanvas.height) {
          this.y = pCanvas.height;
          this.vy *= -0.7;
        } else {
          this.vy *= -0.9;
        }
      }
    }
    draw() {
      pCtx.fillStyle = "#38bdf8";
      pCtx.beginPath();
      pCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      pCtx.fill();
    }
  }

  function initParticles(count) {
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animateParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      if (particleMode === "connect") {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) {
            pCtx.strokeStyle = `rgba(56, 189, 248, ${1 - dist / 85})`;
            pCtx.lineWidth = 0.6;
            pCtx.beginPath();
            pCtx.moveTo(particles[i].x, particles[i].y);
            pCtx.lineTo(particles[j].x, particles[j].y);
            pCtx.stroke();
          }
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }

  pCanvas.addEventListener("mousemove", (e) => {
    const rect = pCanvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  pCanvas.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  document.getElementById("particle-slider").addEventListener("input", (e) => {
    document.getElementById("particle-count-val").textContent = e.target.value;
    initParticles(Number(e.target.value));
  });

  document.querySelectorAll(".pmode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pmode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      particleMode = btn.dataset.mode;
    });
  });

  document.getElementById("btn-clear-canvas").addEventListener("click", () => {
    initParticles(particles.length);
  });

  // 5. Synth Keyboard Generation
  const notes = [
    { key: "1", note: "C4", freq: 261.63 },
    { key: "2", note: "D4", freq: 293.66 },
    { key: "3", note: "E4", freq: 329.63 },
    { key: "4", note: "F4", freq: 349.23 },
    { key: "5", note: "G4", freq: 392.00 },
    { key: "6", note: "A4", freq: 440.00 },
    { key: "7", note: "B4", freq: 493.88 },
    { key: "8", note: "C5", freq: 523.25 }
  ];

  const pianoContainer = document.getElementById("piano-keyboard");
  const waveSelect = document.getElementById("wave-type");

  notes.forEach(n => {
    const keyEl = document.createElement("button");
    keyEl.className = "piano-key";
    keyEl.dataset.key = n.key;
    keyEl.innerHTML = `<span>[${n.key}]</span><strong>${n.note}</strong>`;
    
    const triggerNote = () => {
      playTone(n.freq, waveSelect.value, 0.4);
      keyEl.classList.add("playing");
      setTimeout(() => keyEl.classList.remove("playing"), 200);
    };

    keyEl.addEventListener("mousedown", triggerNote);
    pianoContainer.appendChild(keyEl);
  });

  window.addEventListener("keydown", (e) => {
    const found = notes.find(n => n.key === e.key);
    if (found) {
      const keyBtn = document.querySelector(`.piano-key[data-key="${found.key}"]`);
      if (keyBtn) {
        keyBtn.classList.add("playing");
        setTimeout(() => keyBtn.classList.remove("playing"), 200);
      }
      playTone(found.freq, waveSelect.value, 0.4);
    }
  });

  // Boot & Initial Render
  renderTable();
  initParticles(100);
  animateParticles();
});
