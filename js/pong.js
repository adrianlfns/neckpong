const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');

// --- Modals & UI Elements ---
const gameOverModal = new bootstrap.Modal(document.getElementById('game-over-modal'));
const settingsModal = new bootstrap.Modal(document.getElementById('settings-modal'));
const calibrationModal = new bootstrap.Modal(document.getElementById('calibration-modal'));
const finalScoreText = document.getElementById('final-score-text');
const bestScoreElement = document.getElementById('best-score');

// --- Buttons ---
const restartGameBtn = document.getElementById('restart-game-btn');
const pauseResumeBtn = document.getElementById('pause-resume-btn');
const startCalibrationBtn = document.getElementById('start-calibration-btn');

// --- Settings ---
const difficultySelect = document.getElementById('difficulty-select');

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// --- Game Constants ---
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 100;
const BALL_RADIUS = 7;
const WINNING_SCORE = 5;
let PADDLE_SPEED = 15;

// --- Game Objects ---
let player = { x: canvas.width / 2 - PADDLE_WIDTH / 2, y: canvas.height - PADDLE_HEIGHT - 10, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0 };
let computer = { x: canvas.width / 2 - PADDLE_WIDTH / 2, y: 10, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0 };
let ball = { x: canvas.width / 2, y: canvas.height / 2, radius: BALL_RADIUS, speedX: 5, speedY: 5 };

// --- Game State & Settings ---
window.gameState = 'start'; // 'start', 'running', 'paused', 'gameOver', 'calibrating'
let bestScore = localStorage.getItem('pongBestScore') || 0;
bestScoreElement.textContent = bestScore;

const difficultySettings = {
    easy: { ballSpeed: 4 },
    medium: { ballSpeed: 5 },
    hard: { ballSpeed: 7 }
};

function applyDifficulty() {
    const difficulty = difficultySelect.value;
    const settings = difficultySettings[difficulty];
    ball.speedX = settings.ballSpeed;
    ball.speedY = settings.ballSpeed;
}

// --- Drawing Functions ---
function drawRect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function drawCircle(x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2, false); ctx.closePath(); ctx.fill(); }
function drawText(text, x, y, color, fontSize = "60px") { ctx.fillStyle = color; ctx.font = `${fontSize} 'Orbitron', sans-serif`; ctx.textAlign = "center"; ctx.fillText(text, x, y); }
function drawNet() { for (let i = 0; i < canvas.width; i += 15) drawRect(i, canvas.height / 2 - 1, 10, 2, "#FFF"); }

// --- Game Logic ---
function resetGame() {
    player.score = 0;
    computer.score = 0;
    player.x = canvas.width / 2 - PADDLE_WIDTH / 2;
    applyDifficulty();
    resetBall();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedY = -ball.speedY;
    applyDifficulty();
}

function collision(b, p) {
    p.top = p.y; p.bottom = p.y + p.height; p.left = p.x; p.right = p.x + p.width;
    b.top = b.y - b.radius; b.bottom = b.y + b.radius; b.left = b.x - b.radius; b.right = b.x + b.radius;
    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

function update() {
    if (window.gameState === 'calibrating') {
        player.x += window.gameControl.paddleVelocity * PADDLE_SPEED;
        if (player.x < 0) player.x = 0;
        if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
        return;
    }

    if (window.gameState !== 'running') return;

    player.x += window.gameControl.paddleVelocity * PADDLE_SPEED;
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.speedX = -ball.speedX;
    }

    let p = (ball.y < canvas.height / 2) ? computer : player;
    if (collision(ball, p)) {
        let collidePoint = (ball.x - (p.x + p.width / 2)) / (p.width / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = (ball.y < canvas.height / 2) ? 1 : -1;
        const currentSpeed = Math.sqrt(ball.speedX**2 + ball.speedY**2);
        ball.speedY = direction * currentSpeed * Math.cos(angleRad);
        ball.speedX = currentSpeed * Math.sin(angleRad);
    }

    if (ball.y - ball.radius < 0) { 
        player.score++; 
        resetBall(); 
    } else if (ball.y + ball.radius > canvas.height) { 
        computer.score++; 
        resetBall(); 
    }
    
    computer.x += (ball.x - (computer.x + computer.width / 2)) * 0.1;
}

function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#121212");
    drawNet();
    drawText(player.score, 3 * canvas.width / 4, canvas.height / 2 - 30, "#FFF");
    drawText(computer.score, canvas.width / 4, canvas.height / 2 + 80, "#FFF");
    drawRect(player.x, player.y, player.width, player.height, "#0ff");
    drawRect(computer.x, computer.y, computer.width, computer.height, "#f0f");
    drawCircle(ball.x, ball.y, ball.radius, "#FFF");
}

function gameLoop() {
    if (window.gameState === 'running' || window.gameState === 'calibrating') {
        update();
    }
    render();

    if (player.score >= WINNING_SCORE || computer.score >= WINNING_SCORE) {
        window.gameState = 'gameOver';
        const newScore = player.score;
        if (newScore > bestScore) {
            bestScore = newScore;
            localStorage.setItem('pongBestScore', bestScore);
            bestScoreElement.textContent = bestScore;
        }
        finalScoreText.textContent = `Player: ${player.score} - Computer: ${computer.score}`;
        gameOverModal.show();
    }

    requestAnimationFrame(gameLoop);
}

// --- Event Listeners ---
startGameBtn.addEventListener('click', () => { window.gameState = 'running'; startModal.hide(); });
restartGameBtn.addEventListener('click', () => { resetGame(); window.gameState = 'running'; gameOverModal.hide(); });
pauseResumeBtn.addEventListener('click', () => {
    if (window.gameState === 'running') { window.gameState = 'paused'; pauseResumeBtn.textContent = 'Resume'; }
    else if (window.gameState === 'paused') { window.gameState = 'running'; pauseResumeBtn.textContent = 'Pause'; }
});
startCalibrationBtn.addEventListener('click', () => {
    window.gameState = 'calibrating';
    settingsModal.hide();
    calibrationModal.show();
    
    const calProgress = document.getElementById('calibration-progress');
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        calProgress.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                calibrationModal.hide();
                window.gameState = 'paused';
                settingsModal.show();
                calProgress.style.width = `0%`;
            }, 500);
        }
    }, 200);
});

difficultySelect.addEventListener('change', applyDifficulty);

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && (window.gameState === 'running' || window.gameState === 'paused')) pauseResumeBtn.click();
});

// Initial setup
applyDifficulty();
gameLoop();
