const matrixGrid = document.getElementById("matrix-grid");

async function fetchLeaderboard() {

    try {

        const response = await fetch(
            "https://multi-game-arcade.onrender.com/api/score/leaderboard"
        );

        const data = await response.json();

        matrixGrid.innerHTML = "";

        // GROUP SCORES BY GAME
        const grouped = {};

        data.forEach(item => {

            if (!grouped[item.game]) {

                grouped[item.game] = [];

            }

            grouped[item.game].push(item);

        });

        // CREATE GAME SECTIONS
        Object.keys(grouped).forEach(game => {

            let playersHTML = "";

            grouped[game].forEach((player, index) => {

                playersHTML += `

                    <div
                        class="flex items-center justify-between p-3.5 bg-white/[0.02] rounded-xl"
                    >

                        <div class="flex items-center gap-3">

                            <span class="text-neon-blue font-bold">
                                #${index + 1}
                            </span>

                            <span class="font-gaming text-gray-200">
                                ${player.username}
                            </span>

                        </div>

                        <span class="font-gaming text-neon-purple">
                            ${player.score}
                        </span>

                    </div>

                `;

            });

            matrixGrid.innerHTML += `

                <section
                    class="matrix-card glass-panel neon-border-glow rounded-2xl p-6"
                >

                    <div
                        class="flex items-center justify-between border-b border-white/5 pb-4 mb-4"
                    >

                        <h2
                            class="font-gaming font-black text-xl tracking-wider text-white uppercase"
                        >
                            ${game}
                        </h2>

                        <span class="text-neon-blue font-bold">
                            TOP PLAYERS
                        </span>

                    </div>

                    <div class="space-y-3">

                        ${playersHTML}

                    </div>

                </section>

            `;

        });

    } catch (error) {

        console.log(error);

    }

}

fetchLeaderboard();

setInterval(fetchLeaderboard, 5000);