/**
 * @file This file contains all the logic for tracking the user's face and converting head tilt into game control input.
 * It uses the MediaPipe FaceMesh library to detect face landmarks and calculate the head's rotation angle.
 */

// --- DOM Element References ---

const overlayCanvas = document.getElementById('overlay-canvas');
const overlayCtx = overlayCanvas.getContext('2d');
const faceDetectedBadge = document.getElementById('face-detected-badge');
const webcamError = document.getElementById('webcam-error');

const tiltAngleElement = document.getElementById('tilt-angle');
const tiltArrowElement = document.getElementById('tilt-arrow');
const sensitivitySlider = document.getElementById('sensitivity-slider');

// --- Control Parameters & State ---
let faceMesh; // MediaPipe FaceMesh instance
const smoothingBufferSize = 10; // Number of frames to average for smoothing
const angleBuffer = []; // Stores recent head angles for smoothing
const deadZone = 3; // Degrees of tilt to ignore to prevent jitter
const maxTilt = 30; // Maximum tilt angle to consider for full paddle speed
let sensitivity = 1.5; // Multiplier for paddle speed

/**
 * Initializes the MediaPipe FaceMesh instance.
 * @returns {Promise<void>} A promise that resolves when initialization is complete.
 */
function initializeMediaPipe() {
    return new Promise((resolve, reject) => {
        try {
            faceMesh = new window.FaceMesh({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
            });

            faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            faceMesh.onResults(onFaceMeshResults);
            resolve();
        } catch (error) {
            console.error("MediaPipe initialization failed:", error);
            reject(error);
        }
    });
}


/**
 * Callback function for when MediaPipe processes a frame and returns results.
 * @param {object} results - The results from the FaceMesh model.
 */
function onFaceMeshResults(results) {
    // Prepare the overlay canvas for drawing
    overlayCanvas.width = window.video.videoWidth;
    overlayCanvas.height = window.video.videoHeight;
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        // --- Face Detected --- 
        faceDetectedBadge.textContent = 'Face Detected';
        faceDetectedBadge.classList.add('bg-success');
        faceDetectedBadge.classList.remove('bg-secondary');

        // Draw the face mesh for visual feedback
        drawFaceMesh(results.multiFaceLandmarks);
        
        // --- Calculate Head Tilt ---
        const landmarks = results.multiFaceLandmarks[0];
        // Using two points on the face (e.g., temples) to calculate the angle
        const p1 = landmarks[454];
        const p2 = landmarks[234];
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;

        // --- Smooth the Angle ---
        angleBuffer.push(angle);
        if (angleBuffer.length > smoothingBufferSize) angleBuffer.shift();
        const smoothedAngle = angleBuffer.reduce((a, b) => a + b, 0) / angleBuffer.length;

        // Invert angle for intuitive control (tilt left -> paddle left)
        const tilt = -smoothedAngle;
        
        // --- Update UI ---
        tiltAngleElement.textContent = tilt.toFixed(2) + '°';
        tiltArrowElement.style.transform = `rotate(${tilt}deg)`;

        // --- Update Game Control --- 
        updatePaddleVelocity(tilt);

    } else {
        // --- No Face Detected ---
        faceDetectedBadge.textContent = 'No Face Detected';
        faceDetectedBadge.classList.remove('bg-success');
        faceDetectedBadge.classList.add('bg-secondary');
        window.gameControl.paddleVelocity = 0; // Stop the paddle
    }
}

/**
 * Draws the detected face mesh onto the overlay canvas.
 * @param {Array} multiFaceLandmarks - An array of landmark sets for each detected face.
 */
function drawFaceMesh(multiFaceLandmarks) {
    for (const landmarks of multiFaceLandmarks) {
        window.drawConnectors(overlayCtx, landmarks, window.FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
        window.drawConnectors(overlayCtx, landmarks, window.FACEMESH_RIGHT_EYE, {color: '#FF3030'});
        window.drawConnectors(overlayCtx, landmarks, window.FACEMESH_RIGHT_EYEBROW, {color: '#FF3030'});
        window.drawConnectors(overlayCtx, landmarks, window.FACEMESH_LEFT_EYE, {color: '#30FF30'});
        window.drawConnectors(overlayCtx, landmarks, window.FACEMESH_LEFT_EYEBROW, {color: '#30FF30'});
        window.drawConnectors(overlayCtx, landmarks, window.FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
        window.drawConnectors(overlayCtx, landmarks, window.FACEMESH_LIPS, {color: '#E0E0E0'});
    }
}

/**
 * Calculates and sets the paddle's velocity based on the head tilt angle.
 * @param {number} tilt - The calculated head tilt angle.
 */
function updatePaddleVelocity(tilt) {
    if (window.gameState === 'running' || window.gameState === 'calibrating') {
        if (Math.abs(tilt) < deadZone) {
            // If tilt is within the deadzone, paddle doesn't move
            window.gameControl.paddleVelocity = 0;
            tiltArrowElement.style.color = '#fff'; // Neutral color
        } else {
            // Calculate paddle speed based on how far the head is tilted
            const direction = tilt < 0 ? -1 : 1;
            const scale = Math.min(Math.abs(tilt - (deadZone * direction)) / (maxTilt - deadZone), 1); // Normalize to 0-1
            window.gameControl.paddleVelocity = direction * scale * sensitivity;
            tiltArrowElement.style.color = '#0ff'; // Active color
        }
    } else {
        // If game is not running, paddle doesn't move
        window.gameControl.paddleVelocity = 0;
        tiltArrowElement.style.color = '#fff';
    }
}

// --- Event Listeners ---
sensitivitySlider.addEventListener('input', (e) => {
    sensitivity = parseFloat(e.target.value);
});



// Expose functions to the global scope so main.js can call them
window.faceTracking = {
    initializeMediaPipe,
    setupCamera,
    webcamError
};