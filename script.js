const alien = document.getElementById('alien');
const alienImg = document.getElementById('alien-img');

let isDragging = false, isBusy = false, isFlying = false, isInAir = false;
let velocityX = 0, velocityY = 0, lastX, lastY;
let alienX = window.innerWidth / 2 - 60, alienY = window.innerHeight / 2 - 60;
let gravity = 0.8, currentCharacter = 'justaguy.png';

document.getElementById('gravitySlider').addEventListener('input', (e) => gravity = parseFloat(e.target.value));

function setAlienSrc(src) {
    alienImg.src = src;
    alienImg.classList.toggle('large-img', ['flyr.png', 'flyl.png', 'neves.png'].includes(src));
}

function playAnimation(src, duration) {
    isBusy = true;
    setAlienSrc(src);
    setTimeout(() => { isBusy = false; if (!isDragging) updateAlienAppearance(); }, duration);
}

function updateAlienAppearance() {
    if (isBusy || isFlying) return;
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
            isFlying = false; isInAir = offGround;
            updateAlienAppearance();
        }
        if (alienY + 120 > window.innerHeight) {
            alienY = window.innerHeight - 120;
            if (Math.abs(velocityY) > 5) playAnimation('cryingguy.png', 3000);
            velocityY *= -0.7;
        }
        if (alienX > window.innerWidth) alienX = -120;
        if (alienX < -120) alienX = window.innerWidth;
    }
    alien.style.left = alienX + 'px'; alien.style.top = alienY + 'px';
    requestAnimationFrame(updatePhysics);
}

// Управление мышью и касанием
function dragMove(x, y) {
    setAlienSrc('cursorguy.png');
    velocityX = (x - lastX) * 1.5;
    velocityY = (y - lastY) * 1.5;
    alienX = x - 60; alienY = y - 60;
    lastX = x; lastY = y;
}

alien.addEventListener('mousedown', (e) => { isDragging = true; playAnimation('angruguy.png', 3000); lastX = e.clientX; lastY = e.clientY; });
alien.addEventListener('touchstart', (e) => { isDragging = true; playAnimation('angruguy.png', 3000); lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; }, {passive: false});

window.addEventListener('mousemove', (e) => { if(isDragging) dragMove(e.clientX, e.clientY); });
window.addEventListener('touchmove', (e) => { if(isDragging) dragMove(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }, {passive: false});

window.addEventListener('mouseup', () => { isDragging = false; if (!isBusy) updateAlienAppearance(); });
window.addEventListener('touchend', () => { isDragging = false; if (!isBusy) updateAlienAppearance(); });

updatePhysics();