# Head-Controlled Pong Game

## Overview

This project is a single-player Pong game controlled by head tilts, detected via a webcam using the MediaPipe Face Landmark Detection library. The game is a modern take on the classic arcade game, with a neon aesthetic and responsive design.

## Features

*   **Head-Controlled Paddle:** The user controls their paddle by tilting their head left and right.
*   **Game State Management:** Includes start, pause, game over, and restart states.
*   **Settings Panel:** A modal with options for difficulty, paddle sensitivity, and calibration.
*   **Calibration Mode:** A pre-game mode to test and visualize head tracking.
*   **Best Score Tracker:** The player's highest score is saved locally.
*   **Responsive Layout:** The application features a split-screen layout on desktop and a stacked layout on smaller screens.
*   **Real-time Feedback:** The user can see their head tilt angle and connection status.
*   **Modern Aesthetics:** The game has a gaming-inspired design with neon colors, animations, and clear typography.
*   **Face Mesh Rendering:** The webcam feed is hidden, and only the 3D face mesh is rendered for a "holographic" effect.

## Current Plan: Final Polish

**Objective:** Add a final layer of polish to the user experience with sound effects, visual feedback, improved UI animations, loading states, and more detailed instructions.

**Steps:**

1.  **Update `index.html`:**
    *   Add `<audio>` elements for sound effects (ball bounce, score).
    *   Introduce a new modal for detailed game instructions.
    *   Add a loading spinner element to be displayed while the camera initializes.
    *   Overlay a new canvas (`effects-canvas`) on top of the game canvas for particle effects.
    *   Add a button to open the new instructions modal.

2.  **Update `style.css`:**
    *   Style the loading spinner and position it centrally.
    *   Add smooth, fading transitions for all modals.
    *   Implement responsive font sizes using `clamp()` or media queries to ensure readability on all screen sizes.
    *   Increase the size of buttons and interactive elements on smaller screens to be more touch-friendly.

3.  **Create `effects.js`:**
    *   Create a new file to manage sound and visual effects to keep the code organized.
    *   Implement a function to play sounds for ball bounces and scoring.
    *   Create a simple particle system. When a point is scored, generate a burst of particles from the ball's position for visual feedback.

4.  **Update `pong.js`:**
    *   Integrate the new `effects.js` module.
    *   Call the sound and particle effect functions at the appropriate times (e.g., during a collision or when a score is updated).

5.  **Update `main.js`:**
    *   Display the loading spinner when `setupCamera()` is called and hide it once the camera is successfully connected or fails.
    *   Add an event listener to the new "Instructions" button to open the instructions modal.
