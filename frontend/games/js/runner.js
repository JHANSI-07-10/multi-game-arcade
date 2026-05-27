const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startModal = document.getElementById("startModal");
const gameOverModal = document.getElementById("gameOverModal");
const finalScore = document.getElementById("finalScore");
const liveScore = document.getElementById("liveScore");

// Fixed Game Matrix Framework Rules Variables
let isPlaying = false;
let animationId;
let score = 0;
let gameSpeed = 5;
let obstacleSpawnTimer = 0;

// Grid Track Alignment Data Coordinates Array Maps
const tracks = [45, 145, 245, 345]; // Center coordinates for X track bounds positions
let currentTrack = 1; // Starting Track Index Placement Value

// Game Object Entities Entities Models Definitions
const player = {
    x: tracks[currentTrack],
    y: 480,
    width: 30,
    height: 50,
    targetX: tracks[currentTrack],
    color: '#b026ff',
    speed: 0.25 // Linear Interpolation weight factor calculation scale velocity
};

let obstacles = [];
let particles = [];

class Obstacle {
    constructor() {
        this.trackIndex = Math.floor(Math.random() * tracks.length);
        this.width = 44;
        this.height = 30;
        this.x = tracks[this.trackIndex] - this.width / 2;
        this.y = -this.height;
        this.color = Math.random() > 0.5 ? '#ff5e00' : '#ff2a2a';
        this.passed = false;
    }

    update() {
        this.y += gameSpeed;
    }

    draw() {
        ctx.fillStyle = this.color;
        // Outer Core Matrix Frame glow logic system
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Inner accents structural visual block detail framework drawing
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, 4);
        
        ctx.shadowBlur = 0; // Return context back out to normal baseline rendering operations state
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 6;
        this.speedY = (Math.random() - 0.5) * 6;
        this.color = color;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

function createParticles(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function resetVars() {
    score = 0;
    gameSpeed = 5;
    obstacleSpawnTimer = 0;
    currentTrack = 1;
    player.targetX = tracks[currentTrack];
    player.x = tracks[currentTrack];
    obstacles = [];
    particles = [];
    if (liveScore) liveScore.innerText = "00000";
}

function moveLeft() {
    if (!isPlaying) return;
    if (currentTrack > 0) {
        currentTrack--;
        player.targetX = tracks[currentTrack];
        createParticles(player.x, player.y + player.height / 2, '#00f3ff', 5);
    }
}

function moveRight() {
    if (!isPlaying) return;
    if (currentTrack < tracks.length - 1) {
        currentTrack++;
        player.targetX = tracks[currentTrack];
        createParticles(player.x, player.y + player.height / 2, '#00f3ff', 5);
    }
}

function update() {
    // Smooth Lerp Calculations Interpolation mapping mechanics logic
    const currentDiffX = player.targetX - player.width / 2;
    player.x += (currentDiffX - player.x) * player.speed;

    // Background Particle Tail Emission Loop
    if (Math.random() > 0.4) {
        particles.push(new Particle(player.x + player.width / 2, player.y + player.height, player.color));
    }

    // Dynamic Obstacles Allocation Management Loops
    obstacleSpawnTimer++;
    if (obstacleSpawnTimer > 45) { // Spawn Frequency Steps interval triggers
        obstacles.push(new Obstacle());
        obstacleSpawnTimer = 0;
    }

    // Cycle update loops across active object matrices
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();

        // Standard bounding box intersection vector tests validation algorithms loop
        if (obstacles[i].y + obstacles[i].height > player.y &&
            obstacles[i].y < player.y + player.height &&
            obstacles[i].x + obstacles[i].width > player.x &&
            obstacles[i].x < player.x + player.width) {
            gameOver();
            return;
        }

        // Increment baseline system scoring metrics upon successful row bypass operations
        if (!obstacles[i].passed && obstacles[i].y > player.y + player.height) {
            score += 10;
            obstacles[i].passed = true;
            if (liveScore) liveScore.innerText = String(score).padStart(5, '0');
            
            // Increment overall canvas scrolling speed thresholds periodically
            if (score % 50 === 0) gameSpeed += 0.5;
        }

        // Purge out of scope tracking entities arrays dynamically
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
        }
    }

    // Particle acceleration routines updates logic layer
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}

function draw() {
    // Clear Workspace Context Board
    ctx.fillStyle = "#040406";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Track Alignment lanes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.lineWidth = 2;
    for (let i = 1; i < tracks.length; i++) {
        const laneX = i * 100;
        ctx.beginPath();
        ctx.moveTo(laneX, 0);
        ctx.lineTo(laneX, canvas.height);
        ctx.stroke();
    }

    // Draw Active Obstacles Blocks Systems
    obstacles.forEach(obs => obs.draw());

    // Draw Running Track Particles Clusters
    particles.forEach(p => p.draw());

    // Render Character Entity Model
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Core Engine cockpit indicator core visual element overlay map painting
    ctx.fillStyle = '#00f3ff';
    ctx.fillRect(player.x + player.width / 2 - 4, player.y + 10, 8, 12);
    ctx.shadowBlur = 0;
}


async function saveScore(finalScore) {

    const token = localStorage.getItem("token");

    const username = localStorage.getItem("username");

    if (!token) {

        console.log("User not logged in");

        return;

    }

    try {

        const response = await fetch(
            "http://127.0.0.1:5500/api/score/add",
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify({

                    game: "Runner",

                    score: finalScore,

                    username

                })

            }
        );

        const data = await response.json();

        console.log(data.message);

    } catch (error) {

        console.log(error);

    }

}


function gameLoop() {
    update();
    draw();
    if (isPlaying) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    startModal.classList.add('hidden');
    gameOverModal.classList.add('hidden');
    resetVars();
    isPlaying = true;
    gameLoop();
}

function gameOver() {
    isPlaying = false;
    saveScore(score);
    finalScore.innerText = score;
    createParticles(player.x, player.y + player.height / 2, player.color); // Explosion effect on death
    draw(); // Draw final explosion frame
    setTimeout(() => {
        gameOverModal.classList.remove('hidden');
    }, 500);
}

function resetGame() {
    startGame();
}

// Keyboard Listeners Interceptors
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft();
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight();
});

// Touch Areas Control Listeners Layout Mappings (Mobile)
document.getElementById('btn-left').addEventListener('touchstart', (e) => { e.preventDefault(); moveLeft(); });
document.getElementById('btn-left').addEventListener('mousedown', moveLeft);

document.getElementById('btn-right').addEventListener('touchstart', (e) => { e.preventDefault(); moveRight(); });
document.getElementById('btn-right').addEventListener('mousedown', moveRight);

// Initial draw
draw();