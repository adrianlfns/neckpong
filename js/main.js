/**
 * @file This is the main entry point for the application.
 * It handles the overall application state, initializes the game and face tracking modules,
 * and manages the UI flow (modals, loaders, etc.).
 */

// --- DOM Element References ---
const loader = document.getElementById('loader');
const startModal = new bootstrap.Modal(document.getElementById('start-modal'));
const startGameBtn = document.getElementById('start-game-btn');

// --- Global Game Control ---
// This object is shared with other scripts to control game elements.
window.gameControl = {
    paddleVelocity: 0
};

/**
 * Initializes the entire application.
 * This function is responsible for loading all necessary assets,
 * setting up the face tracking, and showing the start modal.
 */
async function initializeApp() {
    // Show the main loader and disable the start button
    loader.classList.remove('d-none');
    startGameBtn.disabled = true;
    startGameBtn.textContent = 'Loading Assets...';

    try {
        console.log('Loading assets...');
        // Initialize the face tracking module. This must be done before setting up the camera.
        await window.faceTracking.initializeMediaPipe();
        console.log('All assets loaded successfully!');

        // Set up the camera and start face tracking.
        await window.faceTracking.setupCamera();

    } catch (error) {
        // If any part of the initialization fails, show an error message.
        console.error("Initialization failed:", error);
        const webcamError = window.faceTracking.webcamError;
        webcamError.textContent = 'Critical error during initialization. Please refresh the page.';
        webcamError.classList.remove('d-none');
    } finally {
        // Once everything is done (or has failed), hide the loader and enable the start button.
        loader.classList.add('d-none');
        startGameBtn.disabled = false;
        startGameBtn.textContent = 'Start Game';
        
        // Show the initial "Welcome" modal.
        startModal.show();
    }
}

// --- App Initialization ---
// Start the application as soon as the script is loaded.
initializeApp();
