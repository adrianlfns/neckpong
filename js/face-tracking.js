/**
 * @file Contains the logic for face tracking using MediaPipe FaceMesh.
 */

// --- Module-level State ---
let _videoElement = null;
const smoothingBufferSize = 10;
const angleBuffer = [];
const deadZone = 3;
const maxTilt = 30;
let sensitivity = 1.5;

/**
 * Sets the video element that the module will use for canvas sizing.
 * @param {HTMLVideoElement} video The video element from the camera.
 */
function setVideoElement(video) {
    _videoElement = video;
}

/**
 * Initializes the MediaPipe FaceMesh instance.
 * @returns {Promise<object>} A promise that resolves with the initialized FaceMesh instance.
 */
function initializeMediaPipe() {
    return new Promise((resolve, reject) => {
        try {
            const faceMesh = new window.FaceMesh({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
            });
            faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            faceMesh.onResults(onFaceMeshResults);
            resolve(faceMesh);
        } catch (error) {
            console.error("MediaPipe initialization failed:", error);
            reject(error);
        }
    });
}

/**
 * The primary callback for when FaceMesh has processed a frame.
 * @param {object} results The results from the FaceMesh model.
 */
function onFaceMeshResults(results) {
    const { overlayCanvas, faceDetectedBadge } = window.app.dom;
    const overlayCtx = overlayCanvas.getContext('2d');

    if (!_videoElement) { return; }

    overlayCanvas.width = _videoElement.videoWidth;
    overlayCanvas.height = _videoElement.videoHeight;
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        faceDetectedBadge.textContent = 'Face Detected';
        faceDetectedBadge.classList.add('bg-success');
        faceDetectedBadge.classList.remove('bg-secondary');
        drawFaceMesh(overlayCtx, results.multiFaceLandmarks);
        calculateAndApplyTilt(results.multiFaceLandmarks[0]);
    } else {
        faceDetectedBadge.textContent = 'No Face Detected';
        faceDetectedBadge.classList.remove('bg-success');
        faceDetectedBadge.classList.add('bg-secondary');
        window.app.gameControl.paddleVelocity = 0;
    }
}

function calculateAndApplyTilt(landmarks) {
    const { tiltAngleElement, tiltArrowElement } = window.app.dom;
    const p1 = landmarks[454];
    const p2 = landmarks[234];
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    angleBuffer.push(angle);
    if (angleBuffer.length > smoothingBufferSize) angleBuffer.shift();
    const smoothedAngle = angleBuffer.reduce((a, b) => a + b, 0) / angleBuffer.length;
    const tilt = -smoothedAngle;
    tiltAngleElement.textContent = tilt.toFixed(2) + '°';
    tiltArrowElement.style.transform = `rotate(${tilt}deg)`;
    updatePaddleVelocity(tilt);
}

function drawFaceMesh(overlayCtx, multiFaceLandmarks) {
    for (const landmarks of multiFaceLandmarks) {
        window.drawConnectors(overlayCtx, landmarks, window.FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
    }
}

function updatePaddleVelocity(tilt) {
    const { tiltArrowElement } = window.app.dom;
    const state = window.app.state.gameState;
    if (state === 'running' || state === 'calibrating') {
        if (Math.abs(tilt) < deadZone) {
            window.app.gameControl.paddleVelocity = 0;
            tiltArrowElement.style.color = '#fff';
        } else {
            const direction = tilt < 0 ? -1 : 1;
            const effectiveTilt = tilt - (deadZone * direction);
            const scale = Math.min(Math.abs(effectiveTilt) / (maxTilt - deadZone), 1);
            window.app.gameControl.paddleVelocity = direction * scale * sensitivity;
            tiltArrowElement.style.color = '#0ff';
        }
    } else {
        window.app.gameControl.paddleVelocity = 0;
        tiltArrowElement.style.color = '#fff';
    }
}

window.app.dom.sensitivitySlider.addEventListener('input', (e) => {
    sensitivity = parseFloat(e.target.value);
});

window.faceTracking = {
    initializeMediaPipe,
    setVideoElement
};