/**
 * ============================================================================
 * YOKESHWARAN - PORTFOLIO INTERACTIVE CONTROLLER
 * Aspiring Software Engineer & Full-Stack Developer
 * 3rd Year B.E CSE Student @ Prince Dr. K. Vasudevan College, Chennai
 * Projects: Groot AI, Typeverse, Careerpilot
 * ============================================================================
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER (WEB AUDIO API) ---
  class SoundEngine {
    constructor() {
      this.enabled = localStorage.getItem('portfolio_sound') === 'true';
      this.audioCtx = null;
    }

    init() {
      if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
      }
    }

    playClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.audioCtx) return;
      try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.05);
      } catch (e) {
        // silent fail
      }
    }

    playSuccess() {
      if (!this.enabled) return;
      this.init();
      if (!this.audioCtx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.08 + 0.2);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(this.audioCtx.currentTime + idx * 0.08);
          osc.stop(this.audioCtx.currentTime + idx * 0.08 + 0.2);
        });
      } catch (e) {
        // silent fail
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('portfolio_sound', this.enabled);
      if (this.enabled) {
        this.playClick();
        showToast('🔊 Audio feedback enabled', 'info');
      } else {
        showToast('🔇 Audio muted', 'info');
      }
      return this.enabled;
    }
  }

  const sound = new SoundEngine();

  // --- AMBIENT CANVAS BACKGROUND ---
  function initAmbientCanvas() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: -1000, y: -1000, radius: 140 };

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    const particleCount = Math.min(Math.floor((width * height) / 18000), 75);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 0.8,
        color: i % 3 === 0 ? 'rgba(99, 102, 241, ' : (i % 3 === 1 ? 'rgba(6, 182, 212, ' : 'rgba(16, 185, 129, '),
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 125) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 125)})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < mouse.radius) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.35 * (1 - mDist / mouse.radius)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // --- TYPING ANIMATION IN HERO ---
  function initTyping() {
    const el = document.getElementById('typing-text');
    if (!el) return;

    const phrases = [
      'Aspiring Software Engineer',
      'Full-Stack Developer',
      '3rd Year CSE @ Prince Dr. K. Vasudevan College',
      'React & Next.js Enthusiast',
      'Python, Java & Node.js Developer',
      'Creator of Groot AI, Typeverse & Careerpilot'
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let delay = 90;

    function tick() {
      const current = phrases[phraseIdx];
      if (isDeleting) {
        el.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        delay = 45;
      } else {
        el.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        delay = 85;
      }

      if (!isDeleting && charIdx === current.length) {
        delay = 2000;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        delay = 400;
      }

      setTimeout(tick, delay);
    }

    tick();
  }

  // --- HERO CODE SANDBOX TABS & RUNNER ---
  const codeFiles = {
    'Developer.ts': `<span class="t-keyword">import</span> { <span class="t-type">ComputerScienceStudent</span>, <span class="t-type">FullStackDeveloper</span> } <span class="t-keyword">from</span> <span class="t-string">'@chennai/tech'</span>;

<span class="t-keyword">export class</span> <span class="t-type">Yokeshwaran</span> <span class="t-keyword">implements</span> <span class="t-type">FullStackDeveloper</span> {
  <span class="t-keyword">readonly</span> <span class="t-prop">name</span>: <span class="t-type">string</span> = <span class="t-string">'Yokeshwaran'</span>;
  <span class="t-keyword">readonly</span> <span class="t-prop">education</span>: <span class="t-type">string</span> = <span class="t-string">'3rd Year B.E. CSE'</span>;
  <span class="t-keyword">readonly</span> <span class="t-prop">college</span>: <span class="t-type">string</span> = <span class="t-string">'Prince Dr.K.Vasudevan College of Engg & Tech'</span>;
  <span class="t-keyword">readonly</span> <span class="t-prop">location</span>: <span class="t-type">string</span> = <span class="t-string">'Chennai, India'</span>;
  <span class="t-keyword">readonly</span> <span class="t-prop">ambition</span>: <span class="t-type">string</span> = <span class="t-string">'Software Engineer / Full-Stack Developer'</span>;

  <span class="t-keyword">readonly</span> <span class="t-prop">skills</span> = {
    <span class="t-prop">languages</span>: [<span class="t-string">'Python'</span>, <span class="t-string">'Java'</span>, <span class="t-string">'JavaScript'</span>, <span class="t-string">'TypeScript'</span>, <span class="t-string">'HTML/CSS'</span>, <span class="t-string">'SQL'</span>],
    <span class="t-prop">frameworks</span>: [<span class="t-string">'React'</span>, <span class="t-string">'Next.js'</span>, <span class="t-string">'Node.js'</span>, <span class="t-string">'Express.js'</span>],
    <span class="t-prop">databases</span>: [<span class="t-string">'MySQL'</span>, <span class="t-string">'Supabase'</span>],
    <span class="t-prop">cloud</span>: [<span class="t-string">'AWS (Foundational)'</span>, <span class="t-string">'Git/GitHub'</span>]
  };

  async launchProjects() {
    // Note: All project works are actively ongoing & continuously iterated
    return [
      'Groot AI',     // Intelligent AI Assistant (Ongoing)
      'TypeVerse',    // Typing Speed Arena (Ongoing)
      'CareerPilot'   // AI Interview Coach (Ongoing)
    ];
  }
}`,
    'profile.json': `{
  <span class="t-prop">"name"</span>: <span class="t-string">"Yokeshwaran"</span>,
  <span class="t-prop">"degree"</span>: <span class="t-string">"B.E. Computer Science and Engineering"</span>,
  <span class="t-prop">"year_of_study"</span>: <span class="t-string">"3rd Year"</span>,
  <span class="t-prop">"institution"</span>: <span class="t-string">"Prince Dr.K.Vasudevan College of Engg & Tech"</span>,
  <span class="t-prop">"city"</span>: <span class="t-string">"Chennai, Tamil Nadu, India"</span>,
  <span class="t-prop">"email"</span>: <span class="t-string">"yokiw803@gmail.com"</span>,
  <span class="t-prop">"target_role"</span>: <span class="t-string">"Software Engineer / Full-Stack Developer"</span>,
  <span class="t-prop">"project_status"</span>: <span class="t-string">"Active Ongoing Development (Groot AI, TypeVerse, CareerPilot)"</span>
}`,
    'stack.config': `<span class="t-comment"># Yokeshwaran's Tech Arsenal</span>
<span class="t-keyword">core_languages</span>:
  - Python
  - Java
  - JavaScript & TypeScript
  - HTML5 & CSS3
<span class="t-keyword">frontend_stack</span>:
  - React & Next.js
  - Responsive Web Design
<span class="t-keyword">backend_services</span>:
  - Node.js & Express.js
  - RESTful APIs
<span class="t-keyword">databases_cloud</span>:
  - MySQL & Supabase
  - AWS (Cloud Foundations)
  - Git & GitHub`
  };

  function initCodeSandbox() {
    const tabs = document.querySelectorAll('.card-tab');
    const codePre = document.getElementById('sandbox-code');
    const runBtn = document.getElementById('run-code-btn');
    const termOutput = document.getElementById('terminal-output');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        sound.playClick();
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const filename = tab.dataset.file;
        if (codeFiles[filename] && codePre) {
          codePre.innerHTML = codeFiles[filename];
        }
      });
    });

    if (runBtn && termOutput) {
      runBtn.addEventListener('click', () => {
        sound.playClick();
        runBtn.innerHTML = '⚡ Compiling...';
        termOutput.classList.remove('visible');

        setTimeout(() => {
          sound.playSuccess();
          runBtn.innerHTML = '▶ Run Code';
          termOutput.innerHTML = `
            <div><strong>✔ Build Succeeded</strong> in 18ms</div>
            <div>[Developer] <strong>Yokeshwaran</strong> | B.E. CSE 3rd Year</div>
            <div>[College] Prince Dr.K.Vasudevan College of Engg & Tech, Chennai</div>
            <div>[Target Role] <strong>Software Engineer / Full-Stack Developer</strong></div>
            <div>[Active Projects] Groot AI • TypeVerse • CareerPilot (All Works Actively Ongoing 🔨)</div>
            <div>[Status] Actively building & open for engineering opportunities!</div>
          `;
          termOutput.classList.add('visible');
          showToast('Yokeshwaran profile executed in terminal!', 'success');
        }, 550);
      });
    }
  }

  // --- PROJECT DATA & CASE STUDY MODAL ---
  const projectDatabase = {
    'groot-ai': {
      title: 'Groot AI - Intelligent Generative AI Assistant',
      badge: 'Generative AI & Modern Web',
      image: 'assets/images/project-groot.jpg',
      headline: 'Next-generation AI conversational assistant with prompt intelligence and code assistance.',
      metrics: {
        rps: 'LLM API Integration',
        latency: '< 450ms TTFT',
        uptime: 'Supabase Persistent'
      },
      tags: ['React', 'Next.js', 'Python', 'Node.js', 'Express.js', 'Supabase', 'AI/LLM API'],
      overview: 'Groot AI is an intelligent conversational agent engineered by Yokeshwaran to assist students and developers with code debugging, concept summarization, and query resolution. Built with Next.js, Express, and Supabase for real-time history and user sessions.',
      challenges: 'Handling streaming AI responses smoothly in the frontend interface without jank, and structuring secure API endpoints with Supabase for persistent conversation memory.',
      architecture: [
        'Frontend Interface: Modern Next.js application with interactive prompt suggestions and markdown syntax highlighting.',
        'Backend Service: Node.js & Express.js proxy with Python AI helper scripts for request sanitization and prompt token optimization.',
        'Data Layer: Supabase PostgreSQL database managing conversation history and user session persistence.',
        'Cloud & Security: Environment-based API key safety with CORS security.'
      ],
      liveUrl: 'https://github.com',
      githubUrl: 'https://github.com'
    },
    'typeverse': {
      title: 'TypeVerse - Type Faster. Think Smarter.',
      badge: 'Frontend Engineering & Real-Time Stats',
      image: 'assets/images/project-typeverse.png',
      headline: 'Unlock your true typing potential with TypeVerse. Scientifically designed challenges, real-time feedback, and beautiful visualizations.',
      metrics: {
        rps: '150+ WPM Tracked',
        latency: '99% Accuracy',
        uptime: '#1 Leaderboard Rank'
      },
      tags: ['React', 'TypeScript', 'Next.js', 'HTML5/CSS3', 'Real-time Telemetry', 'State Architecture'],
      overview: 'TypeVerse is an immersive, high-speed typing platform designed to help users type faster and think smarter. Featuring scientifically designed challenges, precision keystroke feedback, and beautiful analytics visualizations.',
      challenges: 'Calculating exact millisecond-accurate keystroke timings, error metrics, and high-frequency WPM curves while maintaining a zero-latency responsive typing interface.',
      architecture: [
        'Real-time Telemetry: Custom state reducer logging live keystrokes with precision microsecond timestamps.',
        'Visualizations: Live responsive WPM charts and accuracy progression bars.',
        'Responsive UI: Dark modern aesthetic with custom glassmorphic cards and keyboard layout.'
      ],
      liveUrl: 'https://github.com',
      githubUrl: 'https://github.com'
    },
    'careerpilot': {
      title: 'CareerPilot - Master Your Interview Skills',
      badge: 'AI-Powered Interview Coach & Full-Stack',
      image: 'assets/images/project-careerpilot.png',
      headline: 'AI-powered interview coach that provides real-time feedback, helps candidates practice with realistic scenarios, and boosts confidence.',
      metrics: {
        rps: 'AI Interviewer Online',
        latency: 'Real-Time Feedback',
        uptime: 'Realistic Scenarios'
      },
      tags: ['Next.js', 'React', 'Node.js', 'Express.js', 'MySQL', 'Supabase', 'AI Audio Coach'],
      overview: 'CareerPilot is an AI-powered interview coaching platform designed to help engineering students and job candidates master technical and behavioral interviews. It provides live AI interviewer simulations, instant feedback, and realistic interview drills.',
      challenges: 'Synchronizing real-time AI evaluation feedback with audio prompts and structuring persistent relational interview history across MySQL and Supabase.',
      architecture: [
        'AI Interview Simulation: Real-time conversational interview coach evaluating speech, prompt answers, and domain knowledge.',
        'Backend Engine: Express.js REST API handling interview scenario selection and feedback scoring.',
        'Data Persistence: MySQL and Supabase databases storing candidate session logs, questions, and progress analytics.'
      ],
      liveUrl: 'https://github.com',
      githubUrl: 'https://github.com'
    }
  };

  function initProjects() {
    const filterBtns = document.querySelectorAll('.project-filter-btn');
    const cards = document.querySelectorAll('.project-card');
    const modalOverlay = document.getElementById('case-study-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.playClick();
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        cards.forEach((card) => {
          if (filter === 'all' || card.dataset.category.includes(filter)) {
            card.style.display = 'flex';
            card.style.animation = 'fadeIn 0.3s ease';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    document.querySelectorAll('.open-case-study').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        sound.playClick();
        const projectId = trigger.dataset.project;
        const data = projectDatabase[projectId];
        if (!data || !modalOverlay) return;

        document.getElementById('modal-banner').src = data.image;
        document.getElementById('modal-banner').alt = data.title;
        document.getElementById('modal-badge').textContent = data.badge;
        document.getElementById('modal-title').textContent = data.title;
        document.getElementById('modal-headline').textContent = data.headline;
        document.getElementById('modal-overview').textContent = data.overview;
        document.getElementById('modal-challenges').textContent = data.challenges;

        document.getElementById('modal-spec-rps').textContent = data.metrics.rps;
        document.getElementById('modal-spec-lat').textContent = data.metrics.latency;
        document.getElementById('modal-spec-sla').textContent = data.metrics.uptime;

        const archList = document.getElementById('modal-architecture-list');
        archList.innerHTML = '';
        data.architecture.forEach((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          archList.appendChild(li);
        });

        const tagsContainer = document.getElementById('modal-tags');
        tagsContainer.innerHTML = '';
        data.tags.forEach((tag) => {
          const span = document.createElement('span');
          span.className = 'tag-pill';
          span.textContent = tag;
          tagsContainer.appendChild(span);
        });

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeModal() {
      if (!modalOverlay) return;
      sound.playClick();
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // --- SKILLS FILTER ---
  function initSkills() {
    const tabBtns = document.querySelectorAll('.skill-tab-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.playClick();
        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.category;

        skillCards.forEach((card) => {
          if (cat === 'all' || card.dataset.category === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // --- COMMAND PALETTE (CTRL+K) ---
  function initCommandPalette() {
    const overlay = document.getElementById('cmd-palette-modal');
    const input = document.getElementById('cmd-search-input');
    const itemsList = document.getElementById('cmd-items-list');
    const triggerBtn = document.getElementById('cmd-k-trigger');

    if (!overlay || !input || !itemsList) return;

    function openPalette() {
      sound.playClick();
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      input.value = '';
      filterItems('');
      setTimeout(() => input.focus(), 50);
    }

    function closePalette() {
      sound.playClick();
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (triggerBtn) triggerBtn.addEventListener('click', openPalette);

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (overlay.classList.contains('active')) {
          closePalette();
        } else {
          openPalette();
        }
      } else if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closePalette();
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePalette();
    });

    const items = itemsList.querySelectorAll('.cmd-item');

    function filterItems(query) {
      const q = query.toLowerCase().trim();
      let firstVisible = null;
      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          item.style.display = 'flex';
          if (!firstVisible) firstVisible = item;
        } else {
          item.style.display = 'none';
        }
      });
      items.forEach((i) => i.classList.remove('selected'));
      if (firstVisible) firstVisible.classList.add('selected');
    }

    input.addEventListener('input', (e) => {
      filterItems(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
      const visibleItems = Array.from(items).filter((i) => i.style.display !== 'none');
      if (!visibleItems.length) return;
      const currentIdx = visibleItems.findIndex((i) => i.classList.contains('selected'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (currentIdx + 1) % visibleItems.length;
        visibleItems.forEach((i) => i.classList.remove('selected'));
        visibleItems[nextIdx].classList.add('selected');
        visibleItems[nextIdx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = (currentIdx - 1 + visibleItems.length) % visibleItems.length;
        visibleItems.forEach((i) => i.classList.remove('selected'));
        visibleItems[prevIdx].classList.add('selected');
        visibleItems[prevIdx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentIdx >= 0) {
          executeCommand(visibleItems[currentIdx]);
        }
      }
    });

    items.forEach((item) => {
      item.addEventListener('click', () => {
        executeCommand(item);
      });
    });

    function executeCommand(item) {
      const action = item.dataset.action;
      closePalette();

      if (action.startsWith('#')) {
        const target = document.querySelector(action);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (action === 'resume') {
        openResumeModal();
      } else if (action === 'copy-email') {
        copyEmailAddress();
      } else if (action === 'linkedin') {
        window.open('https://www.linkedin.com/in/yokeshwaran-s-629030301', '_blank', 'noopener,noreferrer');
      } else if (action === 'github') {
        window.open('https://github.com/yokiw803-hash', '_blank', 'noopener,noreferrer');
      } else if (action === 'sound-toggle') {
        sound.toggle();
      }
    }
  }

  // --- RESUME MODAL ---
  function openResumeModal() {
    const modal = document.getElementById('resume-modal');
    if (!modal) return;
    sound.playClick();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function initResume() {
    const modal = document.getElementById('resume-modal');
    const openBtns = document.querySelectorAll('.open-resume-btn');
    const closeBtn = document.getElementById('resume-close-btn');
    const printBtn = document.getElementById('print-resume-btn');

    openBtns.forEach((btn) => btn.addEventListener('click', openResumeModal));

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        sound.playClick();
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // --- COPY EMAIL & TOAST NOTIFICATION SYSTEM ---
  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? '✔' : (type === 'error' ? '✖' : 'ℹ');
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 20);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  }

  function copyEmailAddress() {
    const email = 'yokiw803@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      sound.playSuccess();
      showToast(`Copied ${email} to clipboard!`, 'success');
    }).catch(() => {
      showToast('Could not access clipboard', 'error');
    });
  }

  function initCopyButtons() {
    document.querySelectorAll('.copy-email-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        copyEmailAddress();
      });
    });
  }

  // --- CONTACT FORM SUBMISSION ---
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      sound.playClick();

      const nameInput = form.querySelector('[name="name"]');
      const emailInput = form.querySelector('[name="email"]');
      const topicInput = form.querySelector('[name="topic"]');
      const messageInput = form.querySelector('[name="message"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const topic = topicInput ? topicInput.value.trim() : 'Portfolio Inquiry';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !email || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⚡ Transmitting message to Yokeshwaran...';

      const payload = {
        name: name,
        email: email,
        topic: topic,
        message: message,
        _subject: `New Portfolio Message from ${name} (${topic})`,
        _replyto: email
      };

      fetch('https://formsubmit.co/ajax/yokiw803@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error status ${res.status}`);
          }
          return res.json();
        })
        .then(() => {
          sound.playSuccess();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          form.reset();
          showToast(`Thank you, ${name}! Your message has been sent to Yokeshwaran's inbox.`, 'success');
        })
        .catch((err) => {
          console.warn('FormSubmit AJAX failed, falling back to mailto:', err);
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;

          // Seamless mailto fallback
          const subject = encodeURIComponent(`Portfolio Inquiry: ${topic} from ${name}`);
          const body = encodeURIComponent(`Hi Yokeshwaran,\n\n${message}\n\n---\nFrom: ${name}\nEmail: ${email}\nTopic: ${topic}`);
          window.location.href = `mailto:yokiw803@gmail.com?subject=${subject}&body=${body}`;

          showToast('Notice: Opening your email client to send your message directly.', 'info');
        });
    });
  }

  // --- NAVBAR SCROLL & ACTIVE LINK SPY ---
  function initNav() {
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navMenu.classList.toggle('open');
        mobileToggle.innerHTML = isOpen ? '✕' : '☰';
      });
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
          mobileToggle.innerHTML = '☰';
        });
      });
      document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
          navMenu.classList.remove('open');
          mobileToggle.innerHTML = '☰';
        }
      });
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      let currentSection = '';
      sections.forEach((section) => {
        const top = section.offsetTop - 120;
        const height = section.offsetHeight;
        if (window.scrollY >= top && window.scrollY < top + height) {
          currentSection = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
          link.classList.add('active');
        }
      });
    });
  }

  // --- FOOTER LIVE CLOCK (IST / Chennai) ---
  function initLiveClock() {
    const clockEl = document.getElementById('live-utc-clock');
    if (!clockEl) return;

    function update() {
      const now = new Date();
      // Indian Standard Time (IST) is UTC+5:30
      const options = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const istString = now.toLocaleTimeString('en-US', options);
      clockEl.textContent = `${istString} IST (Chennai)`;
    }

    update();
    setInterval(update, 1000);
  }

  // --- INTERACTIVE CUSTOM CURSOR ---
  function initInteractiveCursor() {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const dot = document.getElementById('cursor-dot');
    const outline = document.getElementById('cursor-outline');
    if (!dot || !outline) return;

    let mouseX = -100;
    let mouseY = -100;
    let outlineX = -100;
    let outlineY = -100;
    let isVisible = false;
    let isHovered = false;
    let isActive = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        dot.classList.add('visible');
        outline.classList.add('visible');
        outlineX = mouseX;
        outlineY = mouseY;
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      dot.classList.remove('visible');
      outline.classList.remove('visible');
    });

    document.addEventListener('mouseenter', () => {
      isVisible = true;
      dot.classList.add('visible');
      outline.classList.add('visible');
    });

    window.addEventListener('mousedown', () => {
      isActive = true;
      dot.classList.add('active');
      outline.classList.add('active');
    });

    window.addEventListener('mouseup', () => {
      isActive = false;
      dot.classList.remove('active');
      outline.classList.remove('active');
    });

    const interactiveSelector = 'a, button, input, textarea, select, .project-card, .skill-card, .stat-badge, .filter-btn, .cmd-item, [role="button"]';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelector)) {
        isHovered = true;
        dot.classList.add('hovered');
        outline.classList.add('hovered');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelector)) {
        isHovered = false;
        dot.classList.remove('hovered');
        outline.classList.remove('hovered');
      }
    });

    function render() {
      outlineX += (mouseX - outlineX) * 0.18;
      outlineY += (mouseY - outlineY) * 0.18;

      const scale = isActive ? 0.8 : (isHovered ? 1.55 : 1);

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      outline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%) scale(${scale})`;

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  // --- INITIALIZE EVERYTHING ON DOM READY ---
  document.addEventListener('DOMContentLoaded', () => {
    initAmbientCanvas();
    initInteractiveCursor();
    initTyping();
    initCodeSandbox();
    initProjects();
    initSkills();
    initCommandPalette();
    initResume();
    initCopyButtons();
    initContactForm();
    initNav();
    initLiveClock();
  });
})();
