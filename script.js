const alien = document.getElementById('alien');
const alienImg = document.getElementById('alien-img');

let isDragging = false, isBusy = false, isFlying = false, isInAir = false;
let velocityX = 0, velocityY = 0, lastX, lastY;
let alienX = window.innerWidth / 2 - 60, alienY = window.innerHeight / 2 - 60;
let gravity = 0.8, currentCharacter = 'justaguy.png';

document.getElementById('gravitySlider').addEventListener('input', (e) => gravity = parseFloat(e.target.value));

function setAlienSrc(src) {
    alienImg.src = src;
    if (src === 'flyr.png' || src === 'flyl.png' || src === 'neves.png') alienImg.classList.add('large-img');
    else alienImg.classList.remove('large-img');
}

// Универсальная смена с приоритетом
function playAnimation(src, duration) {
    isBusy = true;
    setAlienSrc(src);
    setTimeout(() => {
        isBusy = false;
        if (!isDragging) updateAlienAppearance();
    }, duration);
}

// Логика текущего вида
function updateAlienAppearance() {
    if (isBusy) return;
    if (isFlying) return; // Полет управляется физикой
    setAlienSrc(isInAir ? 'neves.png' : currentCharacter);
}

function changeCharacter(name) {
    currentCharacter = name;
    if (!isBusy) updateAlienAppearance();
}

function updatePhysics() {
    if (!isDragging) {
        velocityY += gravity; alienX += velocityX; alienY += velocityY;
        velocityX *= 0.99; velocityY *= 0.99;

        let offGround = (alienY + 120 < window.innerHeight);
        if (Math.abs(velocityX) > 10) {
            isFlying = true;
            if (!isBusy) setAlienSrc(velocityX > 0 ? 'flyr.png' : 'flyl.png');
        } else {
            isFlying = false;
            isInAir = offGround;
            updateAlienAppearance();
        }

        if (alienY + 120 > window.innerHeight) {
            alienY = window.innerHeight - 120;
            if (Math.abs(velocityY) > 5) playAnimation('cryingguy.png', 3000); // Плач 3 сек
            velocityY *= -0.7;
        }
        if (alienX > window.innerWidth) alienX = -120;
        if (alienX < -120) alienX = window.innerWidth;
        if (alienY < -120) alienY = window.innerHeight;
    }
    alien.style.left = alienX + 'px'; alien.style.top = alienY + 'px';
    requestAnimationFrame(updatePhysics);
}

alien.addEventListener('mousedown', (e) => {
    isDragging = true;
    playAnimation('angruguy.png', 3000); // Злой 3 сек
    lastX = e.clientX; lastY = e.clientY;
    window.addEventListener('mousemove', dragHandler);
    window.addEventListener('mouseup', dropHandler);
});

function dragHandler(e) {
    setAlienSrc('cursorguy.png');
    velocityX = (e.clientX - lastX) * 1.5;
    velocityY = (e.clientY - lastY) * 1.5;
    alienX = e.clientX - 60; alienY = e.clientY - 60;
    lastX = e.clientX; lastY = e.clientY;
}

function dropHandler() {
    isDragging = false;
    window.removeEventListener('mousemove', dragHandler);
    window.removeEventListener('mouseup', dropHandler);
    if (!isBusy) updateAlienAppearance();
}

updatePhysics();