const video = document.getElementById('webcam');
const statusBadge = document.getElementById('status-badge');
const retryCameraBtn = document.getElementById('retry-camera-btn');

/**
 * Sets up and starts the webcam stream.
 * @returns {Promise<void>} A promise that resolves when the camera is ready.
 */
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        statusBadge.textContent = 'Connected';
        statusBadge.classList.add('bg-success');
        statusBadge.classList.remove('bg-danger');
        webcamError.classList.add('d-none');

        const camera = new window.Camera(video, {
            onFrame: async () => {
                if (video.readyState >= 3) { // Check if video is ready for processing
                    await faceMesh.send({ image: video });
                }
            },
            width: 640,
            height: 480
        });
        await camera.start();

    } catch (error) {
        console.error('Error accessing webcam:', error);
        video.classList.add('d-none');
        statusBadge.textContent = 'Disconnected';
        statusBadge.classList.add('bg-danger');
        statusBadge.classList.remove('bg-success');
        webcamError.classList.remove('d-none');
        webcamError.textContent = 'Webcam not found or permission denied. Please check your settings.';
        throw new Error('Webcam setup failed'); // Propagate for main app to handle
    }
}

// Expose functions to the global scope so main.js can call them
window.video = {
    video
};

retryCameraBtn.addEventListener('click', setupCamera);