const alien = document.getElementById('alien');
const alienImg = document.getElementById('alien-img');

let isDragging = false, isBusy = false, isFlying = false, isInAir = false, isPetting = false;
let velocityX = 0, velocityY = 0, lastX, lastY;
let alienX = window.innerWidth / 2 - 60, alienY = window.innerHeight / 2 - 60;
let gravity = 0.8;
// Тот, кто стоит по умолчанию
let currentCharacter = 'justaguy.png'; 

let inactivityTimer, petTimeout, pettingStartTimer;
let lastHeartTime = 0;

document.getElementById('gravitySlider').addEventListener('input', (e) => gravity = parseFloat(e.target.value));

function setAlienSrc(src) {
    alienImg.src = src;
    // Увеличение для определенных скинов
    const largeSkins = ['flyr.png', 'flyl.png', 'neves.png', 'batmanguy.png'];
    alienImg.classList.toggle('large-img', largeSkins.includes(src));
}

// ФУНКЦИЯ ДЛЯ КНОПОК
function changeCharacter(name) {
    console.log("Меняем на:", name);
    currentCharacter = name; // Запоминаем выбор
    isBusy = false;          // Прерываем плач/грусть
    isPetting = false;       // Прерываем глажение
    setAlienSrc(name);       // Сразу меняем вид
    resetInactivityTimer();  // Сбрасываем таймер 5 секунд
}

function playAnimation(src, duration) {
    isBusy = true;
    setAlienSrc(src);
    setTimeout(() => { 
        isBusy = false; 
        updateAlienAppearance(); 
    }, duration);
}

function updateAlienAppearance() {
    // Если мы его тащим, гладим или он летит — не возвращаем обычный скин
    if (isDragging || isPetting || isFlying || isBusy) return;
    setAlienSrc(isInAir ? 'neves.png' : currentCharacter);
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (!isDragging && !isBusy && !isPetting && !isFlying && !isInAir) {
            playAnimation('disapointedguy.png', 2000);
        }
    }, 5000);
}

// === СЕРДЕЧКИ ===
function spawnHeart(index) {
    const heart = document.createElement('div');
    heart.className = 'heart-particle';
    heart.innerHTML = '❤️';
    const randomX = (Math.random() - 0.5) * 15; 
    const angle = (index * 0.4) - 0.4; 
    const xOffset = Math.sin(angle) * 15 + randomX; 
    const yOffset = -20; 
    heart.style.left = (alienX + 60 - 12 + xOffset) + 'px'; 
    heart.style.top = (alienY + yOffset) + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
}

// === ГЛАЖЕНИЕ (2 СЕКУНДЫ) ===
function handlePetting() {
    if (isDragging || isBusy) return;
    if (!pettingStartTimer) {
        pettingStartTimer = setTimeout(() => {
            isPetting = true;
            setAlienSrc('chillguy.png');
        }, 2000);
    }
    if (isPetting) {
        let now = Date.now();
        if (now - lastHeartTime > 600) {
            for(let i = 0; i < 3; i++) { setTimeout(() => spawnHeart(i), i * 100); }
            lastHeartTime = now;
        }
    }
    clearTimeout(petTimeout);
    petTimeout = setTimeout(cancelPetting, 300);
}

function cancelPetting() {
    clearTimeout(pettingStartTimer);
    pettingStartTimer = null;
    if (isPetting) {
        isPetting = false;
        updateAlienAppearance();
    }
}

// === ФИЗИКА ===
function updatePhysics() {
    if (!isDragging) {
        velocityY += gravity; alienX += velocityX; alienY += velocityY;
        velocityX *= 0.99; velocityY *= 0.99;
        
        let offGround = (alienY + 120 < window.innerHeight);
        
        if (Math.abs(velocityX) > 10) {
            isFlying = true;
            if (!isBusy && !isPetting) setAlienSrc(velocityX > 0 ? 'flyr.png' : 'flyl.png');
        } else {
            isFlying = false; 
            isInAir = offGround;
            updateAlienAppearance();
        }

        if (alienY + 120 > window.innerHeight) {
            alienY = window.innerHeight - 120;
            if (Math.abs(velocityY) > 8) playAnimation('cryingguy.png', 3000);
            velocityY *= -0.7;
            velocityX *= 0.8;
        }
        
        if (alienX > window.innerWidth) alienX = -120;
        if (alienX < -120) alienX = window.innerWidth;
        if (alienY > window.innerHeight) alienY = -120;
        if (alienY < -120) alienY = window.innerHeight;
    }
    alien.style.left = alienX + 'px'; alien.style.top = alienY + 'px';
    requestAnimationFrame(updatePhysics);
}

function dragMove(x, y) {
    if (!isDragging) return;
    setAlienSrc('cursorguy.png');
    velocityX = (x - lastX) * 1.5;
    velocityY = (y - lastY) * 1.5;
    alienX = x - 60; alienY = y - 60;
    lastX = x; lastY = y;
}

// СОБЫТИЯ
window.addEventListener('mousemove', (e) => {
    resetInactivityTimer();
    if (isDragging) dragMove(e.clientX, e.clientY);
});

alien.addEventListener('mousemove', handlePetting);
alien.addEventListener('mouseleave', cancelPetting);

alien.addEventListener('mousedown', (e) => { 
    isDragging = true; isPetting = false;
    playAnimation('angruguy.png', 3000); 
    lastX = e.clientX; lastY = e.clientY; 
});

window.addEventListener('mouseup', () => { 
    isDragging = false; 
    updateAlienAppearance(); 
});

// Touch адаптация
alien.addEventListener('touchstart', (e) => { 
    isDragging = true; isPetting = false;
    playAnimation('angruguy.png', 3000); 
    lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; 
}, {passive: false});

window.addEventListener('touchmove', (e) => {
    resetInactivityTimer();
    if (isDragging) dragMove(e.touches[0].clientX, e.touches[0].clientY);
    else handlePetting();
    if (isDragging) e.preventDefault();
}, {passive: false});

window.addEventListener('touchend', () => { isDragging = false; updateAlienAppearance(); });

updatePhysics();
resetInactivityTimer();