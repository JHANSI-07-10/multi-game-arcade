const emojis = [

    "🎮","🎮",
    "🚀","🚀",
    "🔥","🔥",
    "👾","👾",
    "⚡","⚡",
    "🎲","🎲",
    "🕹️","🕹️",
    "💎","💎"

];

emojis.sort(() => Math.random() - 0.5);

const gameBoard =
document.getElementById("gameBoard");

let firstCard = null;
let secondCard = null;

let lockBoard = false;

let matchedPairs = 0;

emojis.forEach(emoji => {

    const card =
    document.createElement("div");

    card.classList.add("card");

    card.innerText = "?";

    card.dataset.emoji = emoji;

    card.addEventListener("click", flipCard);

    gameBoard.appendChild(card);

});

function flipCard() {

    if (lockBoard) return;

    if (this === firstCard) return;

    this.innerText = this.dataset.emoji;

    if (!firstCard) {

        firstCard = this;

        return;

    }

    secondCard = this;

    checkMatch();

}

function checkMatch() {

    if (
        firstCard.dataset.emoji ===
        secondCard.dataset.emoji
    ) {

        matchedPairs++;

        firstCard = null;
        secondCard = null;

        checkWin();

    }

    else {

        lockBoard = true;

        setTimeout(() => {

            firstCard.innerText = "?";
            secondCard.innerText = "?";

            firstCard = null;
            secondCard = null;

            lockBoard = false;

        }, 1000);

    }

}

function checkWin() {

    if (matchedPairs === 8) {

        alert("You Won the Memory Game!");

        saveScore();

    }

}

async function saveScore() {

    const token =
    localStorage.getItem("token");

    const username =
    localStorage.getItem("username");

    if (!token || !username) return;

    try {

        await fetch(
            "http://localhost:5500/api/score/add",
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify({

                    username,
                    game: "Memory Flip",
                    score: 100

                })

            }

        );

        console.log("Memory score saved");

    }

    catch (error) {

        console.log(error);

    }

}