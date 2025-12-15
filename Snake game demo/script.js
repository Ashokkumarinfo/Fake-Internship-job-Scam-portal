const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Game Config
const GRID_SIZE = 20;
const TILE_COUNT = 20; // 400px / 20px = 20 tiles
let GAME_SPEED = 100; // ms
let gameLoopId;
let score = 0;

// Colors matching CSS
const COLORS = {
    snakeHead: '#4ade80',
    snakeBody: '#22d3ee',
    food: '#f472b6',
    grid: '#1e293b'
};

// Game State
let snake = [];
let food = { x: 0, y: 0 };
let dx = 0;
let dy = 0;
let nextDx = 0;
let nextDy = 0; // For buffering input
let isGameRunning = false;

// Initialize
function initGame() {
    // Canvas sizing responsive support
    // For this simple version, we stick to fixed internal resolution 
    // and let CSS handle the visual scaling.
    
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    score = 0;
    scoreElement.innerText = score;
    dx = 1; // Start moving right
    dy = 0;
    nextDx = 1;
    nextDy = 0;
    spawnFood();
}

function spawnFood() {
    food.x = Math.floor(Math.random() * TILE_COUNT);
    food.y = Math.floor(Math.random() * TILE_COUNT);

    // Don't spawn on snake
    for (let part of snake) {
        if (part.x === food.x && part.y === food.y) {
            spawnFood();
            break;
        }
    }
}

function update() {
    // Update direction from buffer
    // Prevent 180 degree turns
    if (nextDx !== -dx || snake.length === 0) {
        dx = nextDx;
    }
    if (nextDy !== -dy || snake.length === 0) {
        dy = nextDy;
    }

    // Move Head
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall Collision Check
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Self Collision Check
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Food Check
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.innerText = score;
        spawnFood();
        // Increase speed slightly?
        // GAME_SPEED = Math.max(50, GAME_SPEED - 1); 
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear
    ctx.fillStyle = COLORS.grid;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    ctx.fillStyle = COLORS.food;
    // Make food circular slightly smaller than grid
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2, 
        food.y * GRID_SIZE + GRID_SIZE / 2, 
        GRID_SIZE / 2 - 2, 
        0, 
        Math.PI * 2
    );
    ctx.fill();
    // Glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.food;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snakeBody;
        
        // Rounded rectangles for snake parts
        const x = part.x * GRID_SIZE;
        const y = part.y * GRID_SIZE;
        const size = GRID_SIZE - 2; // Gap
        
        // Draw rect
        ctx.fillRect(x + 1, y + 1, size, size);
        
        // Head glow
        if (index === 0) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = COLORS.snakeHead;
            ctx.fillRect(x + 1, y + 1, size, size);
            ctx.shadowBlur = 0;
            
            // Eyes
            ctx.fillStyle = '#1e293b';
            const eyeSize = 3;
            // Simple logic to place eyes based on direction
            // (omitted complex rotation for simplicity, just center eyes)
            ctx.fillRect(x + 5, y + 5, eyeSize, eyeSize);
            ctx.fillRect(x + 12, y + 5, eyeSize, eyeSize);
        }
    });
}

function gameLoop() {
    if (!isGameRunning) return;
    
    update();
    draw();
    
    if (isGameRunning) {
        setTimeout(() => {
            requestAnimationFrame(gameLoop);
        }, GAME_SPEED);
    }
}

function startGame() {
    if (isGameRunning) return;
    initGame();
    isGameRunning = true;
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    gameLoop();
}

function gameOver() {
    isGameRunning = false;
    finalScoreElement.innerText = score;
    gameOverScreen.classList.add('active');
}

// Input Handlers
document.addEventListener('keydown', (e) => {
    // Prevent default scrolling for arrow keys
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    
    handleInput(e.key);
});

function handleInput(key) {
    if (!isGameRunning) {
        // Start game on any arrow key if looking at start screen
        if (startScreen.classList.contains('active') && 
           ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            startGame();
            return;
        }
    }

    switch(key) {
        case 'ArrowUp':
            if (dy === 0) { nextDx = 0; nextDy = -1; }
            break;
        case 'ArrowDown':
            if (dy === 0) { nextDx = 0; nextDy = 1; }
            break;
        case 'ArrowLeft':
            if (dx === 0) { nextDx = -1; nextDy = 0; }
            break;
        case 'ArrowRight':
            if (dx === 0) { nextDx = 1; nextDy = 0; }
            break;
    }
}

// Mobile Controls
document.getElementById('btnUp').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('ArrowUp'); });
document.getElementById('btnDown').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('ArrowDown'); });
document.getElementById('btnLeft').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('ArrowLeft'); });
document.getElementById('btnRight').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('ArrowRight'); });

// Click fallback for testing on desktop with mouse
document.getElementById('btnUp').addEventListener('click', () => handleInput('ArrowUp'));
document.getElementById('btnDown').addEventListener('click', () => handleInput('ArrowDown'));
document.getElementById('btnLeft').addEventListener('click', () => handleInput('ArrowLeft'));
document.getElementById('btnRight').addEventListener('click', () => handleInput('ArrowRight'));

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Initial Draw
initGame();
draw();
