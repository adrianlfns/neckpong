/**
 * @file Main entry point for the application.
 * Handles global state, module initialization, and UI flow.
 */

// --- Create the single global application object ---
window.app = {
    // A single, shared place for all DOM element references
    dom: {
        loader: document.getElementById('loader'),
        startModal: new bootstrap.Modal(document.getElementById('start-modal')),
        startGameBtn: document.getElementById('start-game-btn'),
        webcamError: document.getElementById('webcam-error'),
        statusBadge: document.getElementById('status-badge'),
        retryCameraBtn: document.getElementById('retry-camera-btn'),
        overlayCanvas: document.getElementById('overlay-canvas'),
        faceDetectedBadge: document.getElementById('face-detected-badge'),
        tiltAngleElement: document.getElementById('tilt-angle'),
        tiltArrowElement: document.getElementById('tilt-arrow'),
        sensitivitySlider: document.getElementById('sensitivity-slider')
    },
    // Global game state
    state: {
        gameState: 'loading', // loading | ready | running | paused | calibrating | gameover
    },
    // Shared values for game control
    gameControl: {
        paddleVelocity: 0
    }
};

// To maintain compatibility with older modules that use window.gameControl directly
window.gameControl = window.app.gameControl;
window.gameState = window.app.state.gameState;


/**
 * Initializes the entire application in the correct order.
 */
async function initializeApp() {
    app.dom.loader.classList.remove('d-none');
    app.dom.startGameBtn.disabled = true;
    app.dom.startGameBtn.textContent = 'Loading Assets...';

    try {
        // 1. Initialize the FaceMesh model first.
        console.log('Initializing MediaPipe...');
        const faceMesh = await window.faceTracking.initializeMediaPipe();
        console.log('MediaPipe initialized.');

        // 2. Set up the camera and pass the faceMesh instance to it.
        console.log('Setting up camera...');
        const videoElement = await window.setupCamera(faceMesh);
        console.log('Camera setup complete.');

        // 3. Pass the video element to the face tracking module.
        window.faceTracking.setVideoElement(videoElement);

        // 4. App is ready.
        app.state.gameState = 'ready';
        console.log('Application ready.');

    } catch (error) {
        console.error("Initialization failed:", error);
        app.dom.webcamError.textContent = `Critical error: ${error.message}. Please refresh the page.`;
        app.dom.webcamError.classList.remove('d-none');
        app.state.gameState = 'error';
    } finally {
        app.dom.loader.classList.add('d-none');
        app.dom.startGameBtn.disabled = false;
        app.dom.startGameBtn.textContent = 'Start Game';
        
        if (app.state.gameState === 'ready') {
            app.dom.startModal.show();
        }
    }
}

// --- Start the application ---
// Wait until the DOM is fully loaded and all deferred scripts have been executed.
document.addEventListener('DOMContentLoaded', initializeApp);
