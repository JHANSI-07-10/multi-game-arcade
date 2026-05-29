// ==========================================
// 1. GLOBAL AUDIO SYNTHESIZER CONTROLLER
// ==========================================
let synthAudioContext;

function playSynthSound(frequency, oscillatorType, duration) {
    try {
        if (!synthAudioContext) {
            synthAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (synthAudioContext.state === 'suspended') {
            synthAudioContext.resume();
        }
        const osc = synthAudioContext.createOscillator();
        const gainNode = synthAudioContext.createGain();
        
        osc.type = oscillatorType;
        osc.frequency.setValueAtTime(frequency, synthAudioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.05, synthAudioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, synthAudioContext.currentTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(synthAudioContext.destination);
        
        osc.start();
        osc.stop(synthAudioContext.currentTime + duration);
    } catch (e) {
        console.warn('Audio synthesis engine initialization failed:', e);
    }
}

// ==========================================
// 2. LAYOUT & IDENTITY TRACKING
// ==========================================
window.addEventListener('load', () => {
    // Identity Synchronization Loop
    const localPilot = localStorage.getItem('nexus_pilot');
    if (localPilot) {
        const nameBadge = document.getElementById('pilot-badge-name');
        const badgeWrapper = document.getElementById('pilot-badge');
        if (nameBadge && badgeWrapper) {
            nameBadge.textContent = localPilot.toUpperCase();
            badgeWrapper.classList.remove('hidden');
            badgeWrapper.classList.add('flex');
        }
    }
    
    // Core Search Interface Registration
    const inputSearch = document.getElementById('catalog-search');
    if (inputSearch) {
        inputSearch.addEventListener('input', executeCatalogSearchQuery);
    }
});

// ==========================================
// 3. MOBILE MENU TOGGLE
// ==========================================
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');

if (mobileMenuBtn && mobileMenu && menuIcon) {
    mobileMenuBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
            mobileMenu.classList.remove('hidden');
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-xmark');
            playSynthSound(400, 'square', 0.1);
        } else {
            mobileMenu.classList.add('hidden');
            menuIcon.classList.remove('fa-xmark');
            menuIcon.classList.add('fa-bars');
            playSynthSound(300, 'square', 0.1);
        }
    });
}

// ==========================================
// 4. CORE SEARCH & CATEGORY FILTER ENGINE
// ==========================================
let activeFilter = 'all';

function applyFilter(categoryString) {
    activeFilter = categoryString.toLowerCase();
    
    // Update Tab Layout Control Buttons Active State
    const targetButtons = document.querySelectorAll('#filter-tab-container button');
    targetButtons.forEach(btn => {
        if (btn.getAttribute('data-filter') === activeFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Play Notification Audio Matrix Element
    playSynthSound(480, 'sine', 0.08);
    
    // Execute Core Filter Combination Array
    executeCatalogSearchQuery();
}

function executeCatalogSearchQuery() {
    const searchField = document.getElementById('catalog-search');
    const query = searchField ? searchField.value.toLowerCase().trim() : '';
    const cards = document.querySelectorAll('#catalog-grid .game-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const categoryAttr = (card.getAttribute('data-category') || '').toLowerCase();
        const titleText = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
        const descText = card.querySelector('p') ? card.querySelector('p').textContent.toLowerCase() : '';
        
        // Match settings
        const matchesQuery = titleText.includes(query) || descText.includes(query);
        
        // Flexible string includes evaluation (e.g. 'retro' matches 'RETRO CLASSIC')
        const matchesFilter = (activeFilter === 'all' || categoryAttr.includes(activeFilter));

        if (matchesQuery && matchesFilter) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    // Handle empty result panel fallback
    const emptyMsg = document.getElementById('empty-search-msg');
    if (emptyMsg) {
        if (visibleCount === 0) {
            emptyMsg.classList.remove('hidden');
        } else {
            emptyMsg.classList.add('hidden');
        }
    }
}



// const gamesContainer =
// document.getElementById("gamesContainer");


const dynamicGamesContainer =
document.getElementById("dynamic-games");

const adminGames =
JSON.parse(localStorage.getItem("adminGames")) || [];

function renderAdminGames() {

    if (!dynamicGamesContainer) return;

    adminGames.forEach(game => {

        dynamicGamesContainer.innerHTML += `

            <div class="game-card group relative bg-cyber-card border border-cyber-green/30 rounded-2xl p-6 transition-all duration-300 hover:border-cyber-green flex flex-col justify-between">

                <div class="absolute top-4 right-4 bg-cyber-green/10 border border-cyber-green/30 text-cyber-green font-orbitron text-[10px] font-bold px-2.5 py-1 rounded-full">
                    ADMIN
                </div>

                <div>

                     <img src="${game.image}" class="w-full h-48 object-cover rounded-xl mb-6">

                    <h3 class="font-orbitron font-bold text-xl text-white mb-2">
                        ${game.title}
                    </h3>

                    <p class="text-gray-400 text-sm leading-relaxed mb-6">
                        Dynamically added from admin panel.
                    </p>

                </div>

                <a
                    href="${game.link}"
                    class="w-full text-center py-3 rounded-xl font-orbitron text-xs font-semibold tracking-wider bg-white/5 hover:bg-cyber-green hover:text-black border border-white/10 hover:border-transparent transition-all duration-300"
                >
                    PLAY NOW
                </a>

            </div>

        `;

    });

}

renderAdminGames();
