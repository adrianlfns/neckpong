/**
 * @file Manages webcam access and video feed processing.
 */

const videoElement = document.getElementById('webcam');

/**
 * Sets up the webcam and starts sending frames to the FaceMesh instance.
 * @param {object} faceMesh - The initialized MediaPipe FaceMesh instance.
 * @returns {Promise<HTMLVideoElement>} A promise that resolves with the HTMLVideoElement when the stream is ready.
 */
function setupCamera(faceMesh) {
    // Use the DOM elements from the shared app object
    const { statusBadge, retryCameraBtn, webcamError } = window.app.dom;

    return new Promise(async (resolve, reject) => {
        if (!faceMesh) {
            return reject(new Error("setupCamera requires a valid faceMesh instance."));
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            videoElement.srcObject = stream;

            videoElement.onloadedmetadata = () => {
                videoElement.play();

                statusBadge.textContent = 'Connected';
                statusBadge.classList.add('bg-success');
                statusBadge.classList.remove('bg-danger');
                webcamError.classList.add('d-none');

                const camera = new window.Camera(videoElement, {
                    onFrame: async () => {
                        await faceMesh.send({ image: videoElement });
                    },
                    width: 640,
                    height: 480
                });
                camera.start();

                resolve(videoElement);
            };

        } catch (error) {
            console.error('Error accessing webcam:', error);
            videoElement.classList.add('d-none');
            statusBadge.textContent = 'Disconnected';
            statusBadge.classList.add('bg-danger');
            statusBadge.classList.remove('bg-success');
            webcamError.classList.remove('d-none');
            webcamError.textContent = 'Webcam not found or permission denied. Please check your settings.';
            reject(new Error('Webcam setup failed'));
        }

        retryCameraBtn.addEventListener('click', () => {
            window.location.reload();
        });
    });
}

// Expose the setup function to the global scope.
window.setupCamera = setupCamera;
