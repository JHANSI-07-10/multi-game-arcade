// ================================================
// SPACE BACKGROUND CANVAS
// ================================================
(function() {
    const canvas = document.getElementById('space-canvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Particle types: star, circle, cross, rocket, controller, diamond
    const ICONS = ['★', '✦', '◆', '🚀', '🎮', '⭐', '✸', '✺', '✻'];
    const particles = [];
    const COUNT = 120;

    for (let i = 0; i < COUNT; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 14 + 5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.55 + 0.08,
            icon: ICONS[Math.floor(Math.random() * ICONS.length)],
            hue: Math.random() * 360,
            pulseSpeed: Math.random() * 0.02 + 0.005,
            pulseOffset: Math.random() * Math.PI * 2
        });
    }

    let frame = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame++;

        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap around edges
            if (p.x < -30) p.x = canvas.width + 30;
            if (p.x > canvas.width + 30) p.x = -30;
            if (p.y < -30) p.y = canvas.height + 30;
            if (p.y > canvas.height + 30) p.y = -30;

            // Pulse opacity
            const pulse = Math.sin(frame * p.pulseSpeed + p.pulseOffset);
            const alpha = p.opacity + pulse * 0.12;

            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            ctx.font = `${p.size}px serif`;
            ctx.fillStyle = `hsl(${p.hue}, 90%, 75%)`;
            ctx.shadowColor = `hsl(${p.hue}, 100%, 60%)`;
            ctx.shadowBlur = 8;
            ctx.fillText(p.icon, p.x, p.y);
            ctx.restore();
        });

        requestAnimationFrame(draw);
    }
    draw();
})();

// ================================================
// THEME: DARK / LIGHT
// ================================================
let currentTheme = localStorage.getItem('nexus_theme') || 'dark';

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    }
    const icon = document.getElementById('theme-icon');
    const iconMob = document.getElementById('theme-icon-mob');
    if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    if (iconMob) iconMob.className = theme === 'dark' ? 'fa-solid fa-sun text-sm' : 'fa-solid fa-moon text-sm';
    localStorage.setItem('nexus_theme', theme);
    currentTheme = theme;
}

function toggleTheme() {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    playInterfaceSfx(500, 'sine', 0.1);
}

applyTheme(currentTheme);

// ================================================
// WEB AUDIO SYNTHESIZER
// ================================================
let audioCtx;
function playInterfaceSfx(freq, type, duration) {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
}

// ================================================
// SIGN-IN SYSTEM
// ================================================
let pilotName = localStorage.getItem('nexus_pilot') || '';

function handleSignIn() {
    const input = document.getElementById('signin-name');
    const err = document.getElementById('signin-error');
    const val = input.value.trim();
    if (val.length < 2) {
        err.classList.remove('hidden');
        input.style.borderColor = 'rgba(248,113,113,0.6)';
        return;
    }
    err.classList.add('hidden');
    pilotName = val.toUpperCase().replace(/\s+/g, '_');
    localStorage.setItem('nexus_pilot', pilotName);
    playInterfaceSfx(600, 'sine', 0.1);
    setTimeout(() => playInterfaceSfx(900, 'sine', 0.18), 100);
    dismissSignIn();
    updatePilotUI();
}

function dismissSignIn() {
    const overlay = document.getElementById('signin-overlay');
    overlay.style.opacity = '0';
    setTimeout(() => overlay.style.display = 'none', 500);
}

function signOut() {
    pilotName = '';
    localStorage.removeItem('nexus_pilot');
    updatePilotUI();
    // Show sign-in again
    const overlay = document.getElementById('signin-overlay');
    overlay.style.display = 'flex';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.style.opacity = '1', 10);
    document.getElementById('signin-name').value = '';
}

function updatePilotUI() {
    const tag = document.getElementById('pilot-tag');
    const nameDisp = document.getElementById('pilot-name-display');
    const tagMob = document.getElementById('pilot-tag-mob');
    const nameMob = document.getElementById('pilot-name-mob');

    if (pilotName) {
        tag.style.display = 'flex';
        nameDisp.textContent = pilotName;
        if (tagMob) { tagMob.classList.remove('hidden'); nameMob.textContent = pilotName; }
        // Auto-fill review name
        const rn = document.getElementById('reviewName');
        if (rn) rn.value = pilotName;
    } else {
        tag.style.display = 'none';
        if (tagMob) tagMob.classList.add('hidden');
    }
}

// On page load: check if already signed in
window.addEventListener('load', () => {
    if (pilotName) {
        dismissSignIn();
        updatePilotUI();
    }
});

// ================================================
// LEADERBOARD
// ================================================
let lbFilter = 'All';
const DEMO_LB = [
    { name: 'CYBER_WOLFE', game: 'Neon Snake', score: 3480, date: '05/22/2026' },
    { name: 'SYNAPSE_GRID', game: 'Cyber Pong', score: 2960, date: '05/21/2026' },
    { name: 'BARRIER_BREAKER', game: 'Cyber Runner', score: 2750, date: '05/20/2026' },
    { name: 'VECTOR_KID', game: 'Neon Tic-Tac-Toe', score: 1900, date: '05/19/2026' },
    { name: 'NEON_GHOST', game: 'Neon Snake', score: 1650, date: '05/18/2026' },
];

function getLeaderboard() {
    return JSON.parse(localStorage.getItem('nexus_leaderboard') || JSON.stringify(DEMO_LB));
}
function saveLeaderboard(data) {
    localStorage.setItem('nexus_leaderboard', JSON.stringify(data));
}

// Expose global function so game pages can call it
window.nexusLogScore = function(gameName, score) {
    if (!pilotName) return;
    const lb = getLeaderboard();
    lb.push({ name: pilotName, game: gameName, score: parseInt(score), date: new Date().toLocaleDateString() });
    lb.sort((a,b) => b.score - a.score);
    saveLeaderboard(lb.slice(0, 50));
    renderLeaderboard();
};

function addLeaderboardScore() {
    if (!pilotName) {
        alert('Please sign in first!');
        return;
    }
    const game = document.getElementById('lb-game').value;
    const score = parseInt(document.getElementById('lb-score').value);
    if (!score || score <= 0) return;
    window.nexusLogScore(game, score);
    document.getElementById('lb-score').value = '';
    playInterfaceSfx(660, 'sine', 0.1);
    setTimeout(() => playInterfaceSfx(990, 'sine', 0.2), 100);
}

function filterLeaderboard(filter) {
    lbFilter = filter;
    document.querySelectorAll('.lb-tab').forEach(tab => {
        const isActive = tab.getAttribute('data-lb') === filter;
        tab.style.borderColor = isActive ? '#ffe600' : 'var(--border-color)';
        tab.style.background = isActive ? 'rgba(255,230,0,0.12)' : 'transparent';
        tab.style.color = isActive ? 'var(--text-primary)' : 'var(--text-muted)';
    });
    renderLeaderboard();
}

function renderLeaderboard() {
    const body = document.getElementById('leaderboard-body');
    const empty = document.getElementById('lb-empty');
    const lb = getLeaderboard();
    const filtered = lbFilter === 'All' ? lb : lb.filter(e => e.game === lbFilter);

    if (filtered.length === 0) {
        body.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    const gameColors = {
        'Neon Snake': '#39ff14',
        'Cyber Pong': '#00f3ff',
        'Cyber Runner': '#ff5e00',
        'Neon Tic-Tac-Toe': '#b026ff',
    };

    body.innerHTML = filtered.map((e, i) => {
        const rankColors = ['#ffe600','#c0c0c0','#cd7f32'];
        const rankColor = i < 3 ? rankColors[i] : 'var(--text-muted)';
        const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
        const gameColor = gameColors[e.game] || '#fff';
        const isCurrentPilot = e.name === pilotName;
        return `
        <div class="lb-row grid grid-cols-4 px-6 py-4 rounded-lg transition-all" style="${isCurrentPilot ? 'background:rgba(176,38,255,0.08);' : ''}border-bottom:1px solid var(--border-color);">
            <span class="font-gaming text-sm font-bold" style="color:${rankColor};">${rankIcon}</span>
            <span class="font-gaming text-sm" style="color:${isCurrentPilot ? '#b026ff' : 'var(--text-primary)'};">
                ${e.name}${isCurrentPilot ? ' <span class="text-[9px] text-[#b026ff]">◀ YOU</span>' : ''}
            </span>
            <span class="text-xs font-gaming" style="color:${gameColor};">${e.game}</span>
            <span class="text-right font-gaming font-bold" style="color:var(--text-primary);">${e.score.toLocaleString()}</span>
        </div>`;
    }).join('');
}

// ================================================
// REVIEWS
// ================================================
const mockReviews = [
    { id:1, name:'CYBER_WOLFE', game:'Neon Snake', stars:5, body:'This version of Snake runs incredibly smooth! The glowing particle systems and localized high scores add a perfect arcade feeling.', date:'04/18/2026', avatarColor:'from-[#39ff14] to-[#0c6300]' },
    { id:2, name:'SYNAPSE_GRID', game:'Cyber Pong', stars:5, body:'I\'m genuinely impressed with the responsive AI tracking. The screen shake and synth sounds on ball impacts make standard Pong intense!', date:'05/02/2026', avatarColor:'from-[#00f3ff] to-[#004e6e]' },
    { id:3, name:'BARRIER_BREAKER', game:'Cyber Runner', stars:4, body:'The 3-lane mechanics translate wonderfully on mobile. Jumping and sliding over lasers works perfectly using swipes. Highly addictive!', date:'05/14/2026', avatarColor:'from-[#ff5e00] to-[#8a3300]' },
    { id:4, name:'VECTOR_KID', game:'Neon Tic-Tac-Toe', stars:5, body:'The Minimax AI algorithm is literally unbeatable. The neat neon interface is satisfying to interact with.', date:'05/20/2026', avatarColor:'from-[#b026ff] to-[#4c007a]' },
];

let reviews = JSON.parse(localStorage.getItem('nexus_player_reviews') || JSON.stringify(mockReviews));
let activeFilter = 'All';
let selectedStars = 5;

function setStarRating(num) {
    selectedStars = num;
    document.querySelectorAll('.star-select').forEach((star, idx) => {
        star.className = idx < num
            ? 'fa-solid fa-star text-lg cursor-pointer star-select'
            : 'fa-regular fa-star text-lg cursor-pointer star-select';
        star.style.color = idx < num ? '#ff00ff' : 'var(--text-muted)';
    });
    playInterfaceSfx(400 + num * 60, 'sine', 0.08);
}

function renderReviews() {
    const container = document.getElementById('reviews-grid');
    container.innerHTML = '';
    const filtered = reviews.filter(r => activeFilter === 'All' || r.game === activeFilter);

    if (filtered.length === 0) {
        container.innerHTML = `<div class="col-span-full py-12 text-center glass-panel rounded-2xl" style="border:1px solid var(--border-color);">
            <i class="fa-solid fa-ghost text-4xl block mb-3" style="color:var(--text-muted);"></i>
            <p class="font-gaming text-sm tracking-widest" style="color:var(--text-muted);">NO TRANSMISSIONS LOADED</p>
        </div>`;
        return;
    }

    const gameColors = { 'Neon Snake':'#39ff14','Cyber Pong':'#00f3ff','Cyber Runner':'#ff5e00','Neon Tic-Tac-Toe':'#b026ff' };
    const gameBg = { 'Neon Snake':'rgba(57,255,20,0.08)','Cyber Pong':'rgba(0,243,255,0.08)','Cyber Runner':'rgba(255,94,0,0.08)','Neon Tic-Tac-Toe':'rgba(176,38,255,0.08)' };

    filtered.forEach((r, idx) => {
        const starsHtml = Array.from({length:5}, (_,i) =>
            `<i class="${i < r.stars ? 'fa-solid' : 'fa-regular'} fa-star text-xs mr-0.5" style="color:${i < r.stars ? '#ff00ff' : 'var(--text-muted)'}"></i>`
        ).join('');
        const color = gameColors[r.game] || '#fff';
        const bg = gameBg[r.game] || 'transparent';

        const card = document.createElement('div');
        card.className = 'review-card glass-panel p-6 rounded-2xl flex flex-col justify-between';
        card.style.cssText = `border:1px solid var(--border-color);opacity:0;transform:translateY(20px);animation:fadeUp 0.4s ease-out ${idx * 0.07}s forwards;`;
        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center font-gaming text-sm font-black text-black" style="background:${color};">
                            ${r.name.charAt(0)}
                        </div>
                        <div>
                            <h4 class="font-gaming text-sm tracking-wider" style="color:var(--text-primary);">${r.name}</h4>
                            <p class="text-[10px]" style="color:var(--text-muted);">${r.date}</p>
                        </div>
                    </div>
                    <span class="px-2.5 py-1 text-[9px] font-gaming tracking-wider border rounded" style="color:${color};border-color:${color};background:${bg};">${r.game.toUpperCase()}</span>
                </div>
                <div class="flex mb-3">${starsHtml}</div>
                <p class="text-sm leading-relaxed mb-4" style="color:var(--text-secondary);">"${r.body}"</p>
            </div>
            <div class="flex justify-between items-center text-[10px] font-gaming pt-3" style="border-top:1px solid var(--border-color);color:var(--text-muted);">
                <span>TRANSMISSION OK</span>
                <i class="fa-solid fa-shield-halved" style="color:rgba(0,243,255,0.4);"></i>
            </div>`;
        container.appendChild(card);
    });
}

function filterReviews(val) {
    activeFilter = val;
    document.querySelectorAll('.tab-btn').forEach(tab => {
        const isActive = tab.getAttribute('data-filter') === val;
        tab.style.borderColor = isActive ? '#00f3ff' : 'var(--border-color)';
        tab.style.background = isActive ? 'rgba(0,243,255,0.12)' : 'transparent';
        tab.style.color = isActive ? 'var(--text-primary)' : 'var(--text-muted)';
    });
    playInterfaceSfx(300, 'sine', 0.08);
    renderReviews();
}

function openReviewModal() {
    const rn = document.getElementById('reviewName');
    if (pilotName) rn.value = pilotName;
    document.getElementById('reviewModal').classList.remove('hidden');
    setStarRating(5);
    playInterfaceSfx(500, 'triangle', 0.1);
}

function closeReviewModal() {
    document.getElementById('reviewModal').classList.add('hidden');
    playInterfaceSfx(200, 'triangle', 0.1);
}

function submitReview() {
    const nameInput = document.getElementById('reviewName');
    const gameSelect = document.getElementById('reviewGame');
    const textInput = document.getElementById('reviewText');
    const name = nameInput.value.trim().toUpperCase().replace(/\s+/g, '_');
    const text = textInput.value.trim();
    if (!name || !text) return;

    const gameGrad = {
        'Neon Snake': '#39ff14', 'Cyber Pong': '#00f3ff',
        'Cyber Runner': '#ff5e00', 'Neon Tic-Tac-Toe': '#b026ff'
    };

    reviews.unshift({
        id: Date.now(),
        name, game: gameSelect.value, stars: selectedStars, body: text,
        date: new Date().toLocaleDateString(),
        avatarColor: gameGrad[gameSelect.value] || '#b026ff'
    });
    localStorage.setItem('nexus_player_reviews', JSON.stringify(reviews));
    playInterfaceSfx(600, 'sine', 0.12);
    setTimeout(() => playInterfaceSfx(880, 'sine', 0.2), 100);
    nameInput.value = ''; textInput.value = '';
    closeReviewModal();
    renderReviews();
}

// ================================================
// NEWSLETTER
// ================================================
function subscribeNewsletter() {
    const emailInput = document.getElementById('newsletter-email');
    const statusDisplay = document.getElementById('newsletter-status');
    if (!emailInput.value) return;
    playInterfaceSfx(550, 'sawtooth', 0.1);
    setTimeout(() => playInterfaceSfx(1100, 'sine', 0.3), 90);
    statusDisplay.textContent = '✓ PILOT LINK ESTABLISHED. ALERTS ENABLED!';
    statusDisplay.classList.remove('hidden');
    emailInput.value = '';
    setTimeout(() => statusDisplay.classList.add('hidden'), 6000);
}

// ================================================
// MOBILE NAV
// ================================================
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
    playInterfaceSfx(400, 'triangle', 0.08);
});
function closeMobileMenu() {
    document.getElementById('mobile-menu').classList.add('hidden');
}

// ================================================
// NAVBAR SCROLL EFFECT
// ================================================
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 40) {
        nav.style.boxShadow = '0 4px 30px rgba(0,0,0,0.4)';
    } else {
        nav.style.boxShadow = 'none';
    }
});

// ================================================
// ADD KEYFRAME ANIMATION
// ================================================
const styleTag = document.createElement('style');
styleTag.innerHTML = `
    @keyframes fadeUp {
        from { opacity:0; transform:translateY(20px); }
        to   { opacity:1; transform:translateY(0);    }
    }
`;
document.head.appendChild(styleTag);

// ================================================
// INIT
// ================================================
window.addEventListener('load', () => {
    renderReviews();
    renderLeaderboard();
    updatePilotUI();
});

// Expose pilot name for other pages
window.getNexusPilot = () => localStorage.getItem('nexus_pilot') || '';