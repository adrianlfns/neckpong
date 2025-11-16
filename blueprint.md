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

## Current Plan: Improve Mobile Responsiveness

**Objective:** Adjust the layout and styling to ensure the game is more usable and visually appealing on mobile devices. Specifically, the camera/face mesh view should not be excessively large on smaller screens.

**Steps:**

1.  **Update `style.css`:**
    *   Add a media query to target mobile screen sizes (e.g., `max-width: 767px`).
    *   Within the media query, reduce the size of the head-tracking camera view. Instead of taking up the full width, it will be constrained to a smaller, more appropriate size.
    *   Center the camera view within the control panel on mobile screens.
    *   Adjust the overall layout of the control panel on mobile to ensure all elements are easily accessible and well-proportioned.
