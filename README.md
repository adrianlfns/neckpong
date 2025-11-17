# Head-Controlled Pong

![Head-Controlled Pong Gameplay](/images/logo.svg)

This project is a modern, single-player Pong game that you control with your head! Using your webcam and the power of machine learning, the game tracks your head movements to control the paddle. It's a fun, interactive, and challenging take on the classic arcade game.

## Features

*   **Head-Controlled Paddle:** Tilt your head left and right to move your paddle.
*   **AI Opponent:** Play against a computer-controlled opponent.
*   **Adjustable Difficulty:** Choose from three difficulty levels: Easy, Medium, and Hard.
*   **Sensitivity Control:** Adjust the paddle's sensitivity to your head movements.
*   **Calibration Mode:** Calibrate the head tracking for optimal performance.
*   **Real-time Feedback:** A visualizer shows your head's tilt angle in real-time.
*   **Best Score:** Your highest score is saved locally.
*   **Modern Aesthetics:** A sleek, neon-drenched design with a retro-futuristic feel.
*   **Face Mesh Rendering:** The game uses a 3D face mesh for a cool, holographic effect.

## How to Play

1.  **Allow Webcam Access:** The game will request access to your webcam. This is necessary for the head-tracking to work.
2.  **Start the Game:** Click the "Start Game" button to begin.
3.  **Control the Paddle:** Tilt your head left and right to move your paddle up and down the screen.
4.  **Score Points:** The first player to score 5 points wins the game.

## Technologies Used

This project is built with modern, framework-less web technologies, leveraging the power of machine learning in the browser.

*   **HTML5:** The core structure of the game is built with semantic HTML5.
*   **CSS3:** The game's styling is done with modern CSS3, including responsive design techniques to ensure a great experience on all screen sizes.
*   **JavaScript (ES6+):** The game's logic is written in modern JavaScript. The code is organized into modules to keep it clean and maintainable.
*   **Bootstrap:** This popular CSS framework is used for the game's responsive layout and UI components, such as modals and buttons.
*   **MediaPipe Face Landmark Detection:** This powerful machine learning library from Google is the heart of the head-tracking feature. It runs in real-time in the browser to detect and track the landmarks of your face.

    The following code snippet from `js/face-tracking.js` shows how the FaceMesh model is initialized and configured:

     ```javascript
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
     ```

    Once the model is running, the `onFaceMeshResults` function is called for each frame. Inside this function, we calculate the head tilt angle using the coordinates of specific face landmarks:

     ```javascript
    function calculateAndApplyTilt(landmarks) {
        const p1 = landmarks[454]; // A point on the right side of the face
        const p2 = landmarks[234]; // A point on the left side of the face
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        angleBuffer.push(angle);
        if (angleBuffer.length > smoothingBufferSize) angleBuffer.shift();
        const smoothedAngle = angleBuffer.reduce((a, b) => a + b, 0) / angleBuffer.length;
        const tilt = -smoothedAngle;
        // ... apply tilt to paddle ...
    }
     ```

## Project Structure

The project is organized into the following files and directories:

*   `index.html`: The main HTML file that contains the structure of the game.
*   `css/style.css`: The main stylesheet for the game.
*   `js/main.js`: The main JavaScript file that initializes the game and manages the overall game state.
*   `js/pong.js`: This file contains the logic for the Pong game itself, including the game loop, ball and paddle movement, and scoring.
*   `js/face-tracking.js`: This file contains the logic for the head-tracking feature, using the MediaPipe library.
*   `js/camera.js`: This file contains the logic for accessing and managing the webcam.
*   `blueprint.md`: A markdown file that contains the project's blueprint and development plan.
*   `README.md`: This file!

## Getting Started

To run the game locally, simply open the `index.html` file in your web browser. Make sure you have a stable internet connection, as the game relies on CDN-hosted libraries.

## Demo URL
https://adrianlfns.github.io/neckpong/
