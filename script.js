const alien = document.getElementById('alien');
const alienImg = document.getElementById('alien-img');

let isDragging = false, isBusy = false, isFlying = false, isInAir = false, isPetting = false;
let velocityX = 0, velocityY = 0, lastX, lastY;
let alienX = window.innerWidth / 2 - 60, alienY = window.innerHeight / 2 - 60;
let gravity = 0.8, currentCharacter = 'justaguy.png';

let inactivityTimer, petTimeout, pettingStartTimer;
let lastHeartTime = 0;

document.getElementById('gravitySlider').addEventListener('input', (e) => gravity = parseFloat(e.target.value));

function setAlienSrc(src) {
    alienImg.src = src;
    alienImg.classList.toggle('large-img', ['flyr.png', 'flyl.png', 'neves.png'].includes(src));
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
    if (isBusy || isFlying || isPetting) return; 
    setAlienSrc(isInAir ? 'neves.png' : currentCharacter);
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (!isDragging && !isBusy && !isPetting) {
            playAnimation('disapointedguy.png', 2000);
        }
    }, 5000);
}

// === ОБНОВЛЕННЫЕ СЕРДЕЧКИ (ТЕСНЕЕ НАД ГОЛОВОЙ) ===
function spawnHeart(index) {
    const heart = document.createElement('div');
    heart.className = 'heart-particle'; // Используем класс для CSS
    heart.innerHTML = '❤️';

    // Уменьшаем разброс, чтобы они были кучнее прямо над центром головы
    // Рандом совсем узкий (+-7.5px)
    const randomX = (Math.random() - 0.5) * 15; 
    // Сужаем дугу: multiplier 15 вместо 50
    const angle = (index * 0.4) - 0.4; 
    const xOffset = Math.sin(angle) * 15 + randomX; 
    
    // Стартуем чуть выше макушки (yOffset ~ -20 относительно alienY)
    const yOffset = -20; 

    // Центрируем относительно 120px спрайта (центр ~ alienX + 60)
    // Учитываем размер шрифта (вычитаем ~12px), чтобы само сердце было по центру
    heart.style.left = (alienX + 60 - 12 + xOffset) + 'px'; 
    heart.style.top = (alienY + yOffset) + 'px';
    
    document.body.appendChild(heart);
    // Удаляем через 1.5с (время анимации в CSS)
    setTimeout(() => heart.remove(), 1500);
}

// === ЛОГИКА ГЛАЖЕНИЯ (С ЗАДЕРЖКОЙ 2 СЕК) ===
function handlePetting() {
    if (isDragging || isBusy) {
        cancelPetting();
        return;
    }

    // Если мы еще не начали "замерять" 2 секунды
    if (!pettingStartTimer) {
        pettingStartTimer = setTimeout(() => {
            isPetting = true;
            setAlienSrc('chillguy.png');
        }, 2000); // 2 секунды ожидания
    }

    // Если 2 секунды уже прошли и режим активен - спавним сердечки
    if (isPetting) {
        let now = Date.now();
        // Сердечки чуть чаще (раз в 600мс)
        if (now - lastHeartTime > 600) {
            for(let i = 0; i < 3; i++) { 
                // Создаем с небольшой задержкой между ними
                setTimeout(() => spawnHeart(i), i * 100); 
            }
            lastHeartTime = now;
        }
    }

    // Сброс режима, если мышка замерла (перестал гладить)
    clearTimeout(petTimeout);
    petTimeout = setTimeout(cancelPetting, 300);
}

function cancelPetting() {
    clearTimeout(pettingStartTimer);
    pettingStartTimer = null;
    isPetting = false;
    updateAlienAppearance();
}

alien.addEventListener('mousemove', handlePetting);
alien.addEventListener('touchmove', (e) => {
    // На мобильных touchmove - это и есть движение пальцем по пришельцу
    handlePetting();
    resetInactivityTimer();
});
// Сброс, если убрали курсор с пришельца
alien.addEventListener('mouseleave', cancelPetting);

// === ФИЗИКА И ГРАНИЦЫ ===
function updatePhysics() {
    if (!isDragging) {
        velocityY += gravity; alienX += velocityX; alienY += velocityY;
        velocityX *= 0.99; velocityY *= 0.99;
        
        let offGround = (alienY + 120 < window.innerHeight);
        
        if (Math.abs(velocityX) > 10) {
            isFlying = true;
            if (!isBusy && !isPetting) setAlienSrc(velocityX > 0 ? 'flyr.png' : 'flyl.png');
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

// ЛЮБОЕ движение мышью по экрану сбрасывает 5-секундный таймер
window.addEventListener('mousemove', (e) => {
    resetInactivityTimer();
    dragMove(e.clientX, e.clientY);
});

alien.addEventListener('mousedown', (e) => { 
    isDragging = true; cancelPetting(); playAnimation('angruguy.png', 3000); 
    lastX = e.clientX; lastY = e.clientY; resetInactivityTimer(); 
});
window.addEventListener('mouseup', () => { isDragging = false; updateAlienAppearance(); });

// Адаптация под тач
alien.addEventListener('touchstart', (e) => { 
    isDragging = true; cancelPetting(); playAnimation('angruguy.png', 3000); 
    lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; resetInactivityTimer(); 
}, {passive: false});
window.addEventListener('touchend', () => { isDragging = false; updateAlienAppearance(); });

updatePhysics();
resetInactivityTimer();