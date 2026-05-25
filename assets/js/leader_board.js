/**
 * Nexus Terminal Matrix Leaderboard Engine Layer
 * Operations: Responsive Interface Control, Real-Time String Parsing, Filter Channel Management
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements Registration Frame
    const searchField = document.getElementById('matrix-search');
    const filterButtons = document.querySelectorAll('#filter-tabs .filter-btn');
    const matrixCards = document.querySelectorAll('#matrix-grid .matrix-card');
    const fallbackBox = document.getElementById('null-search-fallback');
    
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = mobileMenuToggle ? mobileMenuToggle.querySelector('i') : null;

    let systemActiveFilter = 'all';

    // 1. Mobile Responsive Toggle Drawer Engine
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            const isMenuHidden = mobileMenu.classList.contains('hidden');
            if (isMenuHidden) {
                mobileMenu.classList.remove('hidden');
                if (menuIcon) {
                    menuIcon.classList.remove('fa-bars');
                    menuIcon.classList.add('fa-xmark');
                }
            } else {
                mobileMenu.classList.add('hidden');
                if (menuIcon) {
                    menuIcon.classList.remove('fa-xmark');
                    menuIcon.classList.add('fa-bars');
                }
            }
        });

        // Close mobile drawer dynamically when orientation change intercepts threshold viewport limits
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                if (menuIcon) {
                    menuIcon.classList.remove('fa-xmark');
                    menuIcon.classList.add('fa-bars');
                }
            }
        });
    }

    // 2. Real-Time Processing Search and Filter Matrix Controller Routine
    function dispatchRegistryPipeline() {
        const queryText = searchField ? searchField.value.toLowerCase().trim() : '';
        let totalActiveVisibleCards = 0;

        matrixCards.forEach(card => {
            const cardGameID = card.getAttribute('data-game') || '';
            const rowRecords = card.querySelectorAll('.target-records > div');
            let matchedPilotsInsideCardCount = 0;

            // Step A: Parse nested pilot records rows internally to flag substrings matches
            rowRecords.forEach(row => {
                const pilotIdentifier = row.querySelector('.pilot-name') ? row.querySelector('.pilot-name').textContent.toLowerCase() : '';
                
                if (queryText === '' || pilotIdentifier.includes(queryText)) {
                    row.classList.remove('hidden');
                    matchedPilotsInsideCardCount++;
                } else {
                    row.classList.add('hidden');
                }
            });

            // Step B: Calculate structural parameters matching targeted tab configurations 
            const targetChannelMatches = (systemActiveFilter === 'all' || cardGameID === systemActiveFilter);

            if (targetChannelMatches && matchedPilotsInsideCardCount > 0) {
                card.classList.remove('hidden');
                totalActiveVisibleCards++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Step C: Trigger viewport interface fallback exceptions if operational logs output empty arrays
        if (totalActiveVisibleCards === 0) {
            fallbackBox.classList.remove('hidden');
        } else {
            fallbackBox.classList.add('hidden');
        }
    }

    // 3. Tab Button Click Matrix Events Activation Loop 
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Drop prior execution classes context
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Assign active identifier state rules to triggering element target
            button.classList.add('active');
            systemActiveFilter = button.getAttribute('data-target') || 'all';

            // Run processing loop
            dispatchRegistryPipeline();
        });
    });

    // 4. Input Matrix Keyboard Input Listener Binding Configuration
    if (searchField) {
        searchField.addEventListener('input', dispatchRegistryPipeline);
    }

    // Initialize System Channel Sync Diagnostics Output 
    dispatchRegistryPipeline();
    console.log("Nexus Terminal Matrix Leaderboard Engine Layer Synchronized Successfully.");
});