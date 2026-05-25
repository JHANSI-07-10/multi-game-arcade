const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const finalScoreEl = document.getElementById('final-score');
const startOverlay = document.getElementById('start-overlay');
const gameoverOverlay = document.getElementById('gameover-overlay');

const gridSize = 20;
let tileCount;
let snake = [];
let food = {x: 0, y: 0};
let dx = gridSize;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snake_high') || 0;
let gameInterval;
let isPlaying = false;

highScoreEl.textContent = highScore;

function resizeCanvas() {
    const size = canvas.parentElement.clientWidth;
    canvas.width = size;
    canvas.height = size;
    tileCount = size / gridSize;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, type, duration) {
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch(e){}
}

function startGame() {
    startOverlay.classList.add('hidden');
    gameoverOverlay.classList.add('hidden');
    snake = [{x: gridSize * 5, y: gridSize * 5}];
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreEl.textContent = score;
    spawnFood();
    isPlaying = true;
    playTone(400, 'square', 0.25);
    setTimeout(() => playTone(800, 'square', 0.3), 150);
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(update, 110);
}

function spawnFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
    for (let part of snake) {
        if (part.x === food.x && part.y === food.y) spawnFood();
    }
}

function changeDir(dir) {
    if (!isPlaying) return;
    if (dir === 'left' && dx === 0) { dx = -gridSize; dy = 0; }
    if (dir === 'right' && dx === 0) { dx = gridSize; dy = 0; }
    if (dir === 'up' && dy === 0) { dx = 0; dy = -gridSize; }
    if (dir === 'down' && dy === 0) { dx = 0; dy = gridSize; }
    playTone(300, 'triangle', 0.05);
}

window.addEventListener('keydown', e => {
    if (['ArrowUp', 'KeyW'].includes(e.code)) changeDir('up');
    if (['ArrowDown', 'KeyS'].includes(e.code)) changeDir('down');
    if (['ArrowLeft', 'KeyA'].includes(e.code)) changeDir('left');
    if (['ArrowRight', 'KeyD'].includes(e.code)) changeDir('right');
});

function update() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver();
        return;
    }

    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        playTone(600, 'sine', 0.15);
        spawnFood();
        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = highScore;
            localStorage.setItem('snake_high', highScore);
        }
    } else {
        snake.pop();
    }

    draw();
}

function draw() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#39ff14';
    ctx.fillStyle = '#39ff14';
    ctx.fillRect(food.x + 2, food.y + 2, gridSize - 4, gridSize - 4);

    snake.forEach((part, idx) => {
        ctx.shadowBlur = idx === 0 ? 15 : 0;
        ctx.shadowColor = '#00f0ff';
        ctx.fillStyle = idx === 0 ? '#00f0ff' : 'rgba(0, 240, 255, ' + (1 - idx/snake.length * 0.7) + ')';
        ctx.fillRect(part.x + 1, part.y + 1, gridSize - 2, gridSize - 2);
    });
    ctx.shadowBlur = 0;
}

function gameOver() {
    isPlaying = false;
    clearInterval(gameInterval);
    playTone(150, 'sawtooth', 0.6);
    finalScoreEl.textContent = score;
    gameoverOverlay.classList.remove('hidden');
}

// Touch Sweep Direction Processing Controls Mapping
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, {passive: true});

canvas.addEventListener('touchend', e => {
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 30) changeDir('right');
        else if (diffX < -30) changeDir('left');
    } else {
        if (diffY > 30) changeDir('down');
        else if (diffY < -30) changeDir('up');
    }
}, {passive: true});