const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startModal = document.getElementById("startModal");
const gameOverModal = document.getElementById("gameOverModal");
const winnerText = document.getElementById("winnerText");

// Game Configuration
const WINNING_SCORE = 3;
let isPlaying = false;
let animationId;

// Entities
const player = { x: 20, y: canvas.height/2 - 50, width: 12, height: 100, score: 0, dy: 0, speed: 7, color: '#00f3ff' };
const ai = { x: canvas.width - 32, y: canvas.height/2 - 50, width: 12, height: 100, score: 0, speed: 5, color: '#ff00ff' };
const ball = { x: canvas.width/2, y: canvas.height/2, radius: 8, speed: 7, dx: 7, dy: 7, color: '#ffffff' };

// Input tracking
const keys = { w: false, s: false, ArrowUp: false, ArrowDown: false };

function drawRect(x, y, w, h, color, isGlow) {
    ctx.fillStyle = color;
    if(isGlow) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
    }
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "bold 60px 'Orbitron', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
}

function drawNet() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    for(let i = 0; i <= canvas.height; i += 30) {
        ctx.fillRect(canvas.width/2 - 1, i, 2, 15);
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Reverse direction and randomize angle slightly
    ball.dx = -ball.dx;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 4 + 3);
    ball.speed = 7; // Reset speed
}

function update() {
    if(!isPlaying) return;

    // Player Movement based on input
    if(keys.w || keys.ArrowUp) player.y -= player.speed;
    if(keys.s || keys.ArrowDown) player.y += player.speed;

    // Boundaries for paddles
    if(player.y < 0) player.y = 0;
    if(player.y + player.height > canvas.height) player.y = canvas.height - player.height;
    if(ai.y < 0) ai.y = 0;
    if(ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;

    // Simple AI Logic: Follow the ball Y
    let aiCenter = ai.y + ai.height/2;
    if(aiCenter < ball.y - 15) {
        ai.y += ai.speed;
    } else if (aiCenter > ball.y + 15) {
        ai.y -= ai.speed;
    }

    // Ball Movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and Bottom Wall Collision
    if(ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
    }

    // Paddle Collision Logic
    let paddle = (ball.x < canvas.width/2) ? player : ai;

    // Check if ball hits paddle
    if(ball.x - ball.radius < paddle.x + paddle.width && 
       ball.x + ball.radius > paddle.x &&
       ball.y + ball.radius > paddle.y && 
       ball.y - ball.radius < paddle.y + paddle.height) {
        
        // Calculate hit point relative to center of paddle to add spin
        let collidePoint = (ball.y - (paddle.y + paddle.height/2));
        // Normalize it
        collidePoint = collidePoint / (paddle.height/2);
        
        // Calculate angle in Radian (max 45 deg)
        let angleRad = (Math.PI/4) * collidePoint;
        
        // Direction of ball based on which paddle hit it
        let direction = (ball.x < canvas.width/2) ? 1 : -1;
        
        ball.dx = direction * ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);
        
        // Speed up ball slightly after every hit
        ball.speed += 0.5;
    }

    // Score updates
    if(ball.x - ball.radius < 0) {
        ai.score++;
        checkWin();
        if(isPlaying) resetBall();
    } else if(ball.x + ball.radius > canvas.width) {
        player.score++;
        checkWin();
        if(isPlaying) resetBall();
    }
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

                    game: "Pong",

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

function checkWin() {
    if(player.score >= WINNING_SCORE || ai.score >= WINNING_SCORE) {
        isPlaying = false;
        if(player.score >= WINNING_SCORE) {
            saveScore(player.score);
            winnerText.innerText = "VICTORY";
            winnerText.className = "text-5xl font-gaming font-black mb-6 text-neon-blue drop-shadow-[0_0_15px_rgba(0,243,255,0.8)]";
        } else {
            winnerText.innerText = "DEFEAT";
            winnerText.className = "text-5xl font-gaming font-black mb-6 text-neon-pink drop-shadow-[0_0_15px_rgba(255,0,255,0.8)]";
        }
        gameOverModal.classList.remove('hidden');
    }
}

function draw() {
    // Clear
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawNet();
    
    // Draw Scores (faded in background)
    drawText(player.score, canvas.width/4, 100, "rgba(0, 243, 255, 0.2)");
    drawText(ai.score, 3*canvas.width/4, 100, "rgba(255, 0, 255, 0.2)");

    // Draw Paddles
    drawRect(player.x, player.y, player.width, player.height, player.color, true);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color, true);

    // Draw Ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

function gameLoop() {
    update();
    draw();
    if(isPlaying) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    startModal.classList.add('hidden');
    gameOverModal.classList.add('hidden');
    player.score = 0;
    ai.score = 0;
    player.y = canvas.height/2 - 50;
    ai.y = canvas.height/2 - 50;
    resetBall();
    isPlaying = true;
    gameLoop();
}

function resetGame() {
    startGame();
}

// Controls Event Listeners
window.addEventListener('keydown', (e) => {
    if(keys.hasOwnProperty(e.key)) keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    if(keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// Touch Control Implementation for Mobile
const touchUp = document.getElementById('touch-up');
const touchDown = document.getElementById('touch-down');

touchUp.addEventListener('touchstart', (e) => { e.preventDefault(); keys.w = true; });
touchUp.addEventListener('touchend', (e) => { e.preventDefault(); keys.w = false; });

touchDown.addEventListener('touchstart', (e) => { e.preventDefault(); keys.s = true; });
touchDown.addEventListener('touchend', (e) => { e.preventDefault(); keys.s = false; });

// Initial render
draw();