const passwordContainer = document.getElementById('password-container');
const gameContainer = document.getElementById('gameContainer');
const axolotlElement = document.getElementById('axolotl');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreElement = document.getElementById('score');
const scoreDisplay = document.getElementById('scoreDisplay');
const timeDisplay = document.getElementById('timeDisplay');
let axolotl = { x: 50, y: 50, size: 40, points: 0 };
let fishes = [];
let gameInterval, spawnInterval, timerInterval;
let timeElapsed = 0;
const fishTypes = ['clownfish', 'pufferfish'];
const password = ["12345678", "123456"];

document.addEventListener('mousemove', function(event) {
    axolotl.x = event.clientX - axolotl.size / 2;
    axolotl.y = event.clientY - axolotl.size / 2;
    axolotlElement.style.left = `${axolotl.x}px`;
    axolotlElement.style.top = `${axolotl.y}px`;
});

axolotlElement.addEventListener('touchmove', function(event) {
    const touch = event.touches[0];
    axolotl.x = touch.clientX - axolotl.size / 2;
    axolotl.y = touch.clientY - axolotl.size / 2;
    axolotlElement.style.left = `${axolotl.x}px`;
    axolotlElement.style.top = `${axolotl.y}px`;
    event.preventDefault();
}, { passive: false });

function startGame() {
    const inputPassword = document.getElementById('password-input').value;
    if (!password.includes(inputPassword)) {
        alert('Incorrect password!');
        return;
    }

    passwordContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    gameOverScreen.style.display = 'none';
    resetGame();
    gameInterval = setInterval(gameLoop, 50);
    spawnInterval = setInterval(spawnFish, 1000);
    timerInterval = setInterval(updateTimer, 1000);
}

function resetGame() {
    axolotl = { x: 50, y: 50, size: 40, points: 0 };
    fishes.forEach(fish => gameContainer.removeChild(fish.element));
    fishes = [];
    timeElapsed = 0;
    scoreDisplay.textContent = `Score: ${axolotl.points}`;
    timeDisplay.textContent = `Time: ${timeElapsed}s`;
    axolotlElement.style.width = '40px';
    axolotlElement.style.left = '50px';
    axolotlElement.style.top = '50px';
}

function updateTimer() {
    timeElapsed += 1;
    timeDisplay.textContent = `Time: ${timeElapsed}s`;
}

function spawnFish() {
    const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    const size = type === 'clownfish' ? 30 : 40;
    const fishElement = document.createElement('img');
    fishElement.src = type === 'clownfish' ? 'clownfish.gif' : 'puffer-fish.gif';
    fishElement.className = 'fish';
    fishElement.style.position = 'absolute';
    fishElement.style.width = `${size}px`;
    fishElement.style.left = `${Math.random() * gameContainer.clientWidth}px`;
    fishElement.style.top = `${Math.random() * gameContainer.clientHeight}px`;
    gameContainer.appendChild(fishElement);

    const directionX = Math.random() < 0.5 ? -1 : 1;
    const directionY = Math.random() < 0.5 ? -1 : 1;

    fishes.push({
        element: fishElement,
        type: type,
        size: size,
        speed: Math.random() * 2 + 1,
        directionX: directionX,
        directionY: directionY,
        x: parseFloat(fishElement.style.left),
        y: parseFloat(fishElement.style.top)
    });
}

function gameLoop() {
    moveFishes();
    checkCollisions();
}

function moveFishes() {
    for (let fish of fishes) {
        fish.x += fish.speed * fish.directionX;
        fish.y += fish.speed * fish.directionY;

        if (fish.x <= 0 || fish.x >= gameContainer.clientWidth - fish.size) {
            fish.directionX *= -1;
        }
        if (fish.y <= 0 || fish.y >= gameContainer.clientHeight - fish.size) {
            fish.directionY *= -1;
        }

        fish.element.style.left = `${fish.x}px`;
        fish.element.style.top = `${fish.y}px`;
    }
}

function checkCollisions() {
    for (let i = 0; i < fishes.length; i++) {
        let fish = fishes[i];
        let dx = axolotl.x + axolotl.size / 2 - fish.x - fish.size / 2;
        let dy = axolotl.y + axolotl.size / 2 - fish.y - fish.size / 2;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < axolotl.size / 2 + fish.size / 2) {
            if (fish.type === 'clownfish') {
                axolotl.size += 2;
                axolotl.points += 1;
                axolotlElement.style.width = `${axolotl.size}px`;
                scoreDisplay.textContent = `Score: ${axolotl.points}`;
                gameContainer.removeChild(fish.element);
                fishes.splice(i, 1);
                i--;

                // Show +1 text at axolotl position
                const plusOneText = document.createElement('div');
                plusOneText.textContent = '+1';
                plusOneText.className = 'plus-one-text';
                plusOneText.style.left = `${axolotl.x}px`;
                plusOneText.style.top = `${axolotl.y}px`;
                gameContainer.appendChild(plusOneText);
                setTimeout(() => {
                    gameContainer.removeChild(plusOneText);
                }, 1000); // Remove after 1 second
            } else if (fish.type === 'pufferfish') {
                gameOver();

                // Show explode.gif at axolotl position
                const explodeImg = document.createElement('img');
                explodeImg.src = 'explode.gif';
                explodeImg.className = 'explode';
                explodeImg.style.left = `${axolotl.x}px`;
                explodeImg.style.top = `${axolotl.y}px`;
                gameContainer.appendChild(explodeImg);
                setTimeout(() => {
                    gameContainer.removeChild(explodeImg);
                }, 1000); // Remove after 1 second

                return;
            }
        }
    }
}





function gameOver() {
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    scoreElement.innerText = axolotl.points;
    gameOverScreen.style.display = 'block';
    gameOverText.style.opacity = 1; 

    // Hide axolotl element
    axolotlElement.style.display = 'none';
}


function restartGame() {
    gameOverScreen.style.display = 'none';
    axolotlElement.style.display = 'block';
    startGame();
}
