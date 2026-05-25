// Global Audio Synthesizer Controller Initialization
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

// Global Document Layout Tracking Subroutines
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

// Category Filter Execution Grid Controller Logic
let activeFilter = 'all';

function applyFilter(categoryString) {
    activeFilter = categoryString.toLowerCase();
    
    // Update Tab Layout Control Indicators
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
    
    // Execute Core Search Filtering Array Function
    executeCatalogSearchQuery();
}

function executeCatalogSearchQuery() {
    const searchField = document.getElementById('catalog-search');
    const query = searchField ? searchField.value.toLowerCase().trim() : '';
    const cards = document.querySelectorAll('#catalog-grid .game-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const categoryAttr = card.getAttribute('data-category') || '';
        const titleText = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
        const descText = card.querySelector('p') ? card.querySelector('p').textContent.toLowerCase() : '';
        
        const matchesQuery = titleText.includes(query) || descText.includes(query);
        const matchesFilter = (activeFilter === 'all' || categoryAttr.toLowerCase() === activeFilter);

        if (matchesQuery && matchesFilter) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    // Handle empty result
    const emptyMsg = document.getElementById('empty-search-msg');
    if (visibleCount === 0) {
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
    }
}

// Mobile Menu Script Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');

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