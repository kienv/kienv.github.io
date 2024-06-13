const passwordContainer = document.getElementById('password-container');
const gameContainer = document.getElementById('gameContainer');
const axolotlElement = document.getElementById('axolotl');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreElement = document.getElementById('score');
const scoreDisplay = document.getElementById('scoreDisplay');
const timeDisplay = document.getElementById('timeDisplay');
const gameOverText = document.getElementById('gameOverText');

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
    axolotlElement.style.backgroundColor = ''; // Reset axolotl color
}

function updateTimer() {
    timeElapsed += 1;
    timeDisplay.textContent = `Time: ${timeElapsed}s`;
}
function spawnFish() {
    const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    const size = type === 'clownfish' ? 60 : 60;
    const fishElement = document.createElement('img');
    fishElement.src = type === 'clownfish' ? 'clownfish.gif' : 'puffer-fish.gif';
    fishElement.className = 'fish';
    fishElement.style.width = `${size}px`;
    fishElement.style.position = 'absolute';
    fishElement.style.left = `${gameContainer.clientWidth - size}px`; // Start from the right side
    fishElement.style.top = `${Math.random() * (gameContainer.clientHeight - size)}px`;
    gameContainer.appendChild(fishElement);

    const directionX = -1; // Move left
    const directionY = Math.random() < 0.5 ? -1 : 1; // Random initial vertical direction

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

function moveFishes() {
    for (let fish of fishes) {
        fish.x += fish.speed * fish.directionX;
        fish.y += fish.speed * fish.directionY;

        // Reverse vertical direction if the fish hits the top or bottom edge
        if (fish.y <= 0 || fish.y >= gameContainer.clientHeight - fish.size) {
            fish.directionY *= -1;
        }

        // Remove fish if it moves out of the left edge
        if (fish.x < -fish.size) {
            gameContainer.removeChild(fish.element);
            fishes.splice(fishes.indexOf(fish), 1);
            continue;
        }

        fish.element.style.left = `${fish.x}px`;
        fish.element.style.top = `${fish.y}px`;
    }
}




function gameLoop() {
    moveFishes();
    checkCollisions();
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

                // Check for color change
                checkColorChange();
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

function checkColorChange() {
    if (axolotl.points === 5) {
        axolotlElement.className = 'blue-axolotl';
        showCongratulation('Congratulations! You reached 5 points.');
    } else if (axolotl.points === 10) {
        axolotlElement.className = 'green-axolotl';
        showCongratulation('Congratulations! You reached 10 points.');
    } else if (axolotl.points === 15) {
        axolotlElement.className = 'yellow-axolotl';
        showCongratulation('Congratulations! You reached 15 points.');
    } else if (axolotl.points === 20) {
        axolotlElement.className = 'red-axolotl';
        showCongratulation('Congratulations! You reached 20 points.');
    } else if (axolotl.points === 25) {
        axolotlElement.className = 'purple-axolotl';
        showCongratulation('Congratulations! You reached 25 points.');
    } else if (axolotl.points === 30) {
        axolotlElement.className = 'orange-axolotl';
        showCongratulation('Congratulations! You reached 30 points.');
    } else if (axolotl.points === 35) {
        axolotlElement.className = 'pink-axolotl';
        showCongratulation('Congratulations! You reached 35 points.');
    }
}


function showCongratulation(message) {
    const congratsText = document.createElement('div');
    congratsText.textContent = message;
    congratsText.className = 'congrats-text';
    congratsText.style.left = `${axolotl.x}px`;
    congratsText.style.top = `${axolotl.y}px`;
    gameContainer.appendChild(congratsText);
    setTimeout(() => {
        gameContainer.removeChild(congratsText);
    }, 2000); // Remove after 2 seconds
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
