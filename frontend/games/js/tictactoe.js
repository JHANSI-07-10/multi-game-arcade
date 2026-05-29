const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('statusText');
const gameModal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X'; // X always starts
let gameActive = false;
let gameMode = 'PvAI'; // PvAI or PvP

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Initialize Screen View Matrix State
showModal('SYSTEM READY', 'Select game mode to initialize');

function showModal(title, subtitle, isWin = false, winner = null) {
    modalTitle.innerText = title;
    modalSubtitle.innerText = subtitle;
    
    if(isWin) {
        if(winner === 'X') modalTitle.className = "text-4xl font-gaming font-bold mb-2 text-neon-pink drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]";
        else if(winner === 'O') modalTitle.className = "text-4xl font-gaming font-bold mb-2 text-neon-blue drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]";
        else modalTitle.className = "text-4xl font-gaming font-bold mb-2 text-white";
    } else {
        modalTitle.className = "text-4xl font-gaming font-bold mb-2 text-neon-purple";
    }
    
    gameModal.classList.remove('hidden');
}

function startGame(mode) {
    gameMode = mode;
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    
    cells.forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('x', 'o', 'winning-cell');
    });
    
    gameModal.classList.add('hidden');
    updateStatusText();
}

function updateStatusText() {
    if(currentPlayer === 'X') {
        statusText.innerHTML = 'PLAYER <span class="text-neon-pink">X</span> TURN';
    } else {
        statusText.innerHTML = gameMode === 'PvAI' ? 'A.I. <span class="text-neon-blue">O</span> COMPUTING...' : 'PLAYER <span class="text-neon-blue">O</span> TURN';
    }
}

// Handle Player Clicks Input Handlers
cells.forEach(cell => {
    cell.addEventListener('click', () => handleCellClick(cell));
});

function handleCellClick(cell) {
    const index = cell.getAttribute('data-index');
    
    if (board[index] !== '' || !gameActive) return;
    if (gameMode === 'PvAI' && currentPlayer === 'O') return; // Prevent clicking during AI compute turn

    makeMove(index, currentPlayer);
    checkWin();

    if (gameActive && gameMode === 'PvAI' && currentPlayer === 'O') {
        setTimeout(makeAIMove, 500); // Small procedural delay for realism
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].innerText = player;
    cells[index].classList.add(player.toLowerCase());
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatusText();
}

function makeAIMove() {
    if (!gameActive) return;

    // 1. Check if AI can win immediately
    let move = findBestMove('O');
    
    // 2. Check if AI needs to intercept and block Player X
    if (move === -1) move = findBestMove('X');
    
    // 3. Take strategic grid center position if available
    if (move === -1 && board[4] === '') move = 4;
    
    // 4. Take random remaining available spot on board
    if (move === -1) {
        let available = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
        if(available.length > 0) {
            move = available[Math.floor(Math.random() * available.length)];
        }
    }

    if (move !== -1) {
        makeMove(move, 'O');
        checkWin();
    }
}

function findBestMove(player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === player && board[b] === player && board[c] === '') return c;
        if (board[a] === player && board[c] === player && board[b] === '') return b;
        if (board[b] === player && board[c] === player && board[a] === '') return a;
    }
    return -1;
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
            "https://multi-game-arcade.onrender.com/api/score/add",
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify({

                    game: "TicTacToe",

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
    let roundWon = false;
    let winningLine = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winningLine = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        const winner = board[winningLine[0]];
        if (winner === 'X') {

            saveScore(1);

        }
        winningLine.forEach(index => cells[index].classList.add('winning-cell'));
        gameActive = false;
        
        setTimeout(() => {
            let title = winner === 'X' ? 'PLAYER X WINS' : (gameMode === 'PvAI' ? 'A.I. DOMINATION' : 'PLAYER O WINS');
            showModal(title, 'Sequence Complete', true, winner);
        }, 800);
        return;
    }

    if (!board.includes('')) {
        gameActive = false;
        setTimeout(() => showModal('DRAW', 'Grid Locked', true, 'DRAW'), 800);
    }
}