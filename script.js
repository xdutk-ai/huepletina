const alien = document.getElementById('alien');
const alienImg = document.getElementById('alien-img');
const menuBtn = document.getElementById('menu-btn');
const contextMenu = document.getElementById('context-menu');

let isDragging = false, isBusy = false, isFlying = false, isInAir = false, isPetting = false;
let velocityX = 0, velocityY = 0, lastX, lastY;
let alienX = window.innerWidth / 2 - 60, alienY = window.innerHeight / 2 - 60;
let gravity = 0.8;

let currentCharacter = 'justaguy.png'; 

// Палка
let stick = null;
let stickX = 0, stickY = 0;
let stickVelX = 0, stickVelY = 0;
let isDraggingStick = false;
let isChasingStick = false;
let isHoldingStick = false;
let stickLastX = 0, stickLastY = 0;

let inactivityTimer, petTimeout, pettingStartTimer;
let lastHeartTime = 0;

document.getElementById('gravitySlider').addEventListener('input', (e) => gravity = parseFloat(e.target.value));

function setAlienSrc(src) {
    alienImg.src = src;
    const largeSkins = ['flyr.png', 'flyl.png', 'neves.png', 'batmanguy.png'];
    alienImg.classList.toggle('large-img', largeSkins.includes(src));
}

function changeCharacter(name) {
    currentCharacter = name;
    isBusy = false;
    isPetting = false;
    isChasingStick = false;
    isHoldingStick = false;
    setAlienSrc(name);
    resetInactivityTimer();
    contextMenu.style.display = 'none';
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
    if (isDragging || isPetting || isFlying || isBusy || isChasingStick || isHoldingStick) return;
    setAlienSrc(isInAir ? 'neves.png' : currentCharacter);
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (!isDragging && !isBusy && !isPetting && !isFlying && !isInAir && !isChasingStick && !isHoldingStick) {
            playAnimation('disapointedguy.png', 2000);
        }
    }, 5000);
}

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
            for(let i = 0; i < 3; i++) spawnHeart(i);
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

// Меню
menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    contextMenu.style.display = contextMenu.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

// СПАВН ПАЛКИ
window.spawnStick = function() {
    contextMenu.style.display = 'none';

    if (stick) stick.remove();

    stick = document.createElement('div');
    stick.id = 'stick';
    document.body.appendChild(stick);

    stickX = alienX + 120;
    stickY = alienY + 45;
    stickVelX = 0;
    stickVelY = 0;

    stick.style.left = stickX + 'px';
    stick.style.top = stickY + 'px';

    addStickListeners();
    console.log("Палка заспавнена в позиции:", stickX, stickY);
};

// Физика палки
function updateStickPhysics() {
    if (!stick || isDraggingStick) return;

    stickVelY += gravity * 0.75;
    stickX += stickVelX;
    stickY += stickVelY;

    stickVelX *= 0.985;
    stickVelY *= 0.975;

    if (stickX > window.innerWidth) stickX = -60;
    if (stickX < -60) stickX = window.innerWidth;
    if (stickY > window.innerHeight) stickY = -30;
    if (stickY < -30) stickY = window.innerHeight;

    if (stickY + 10 > window.innerHeight - 10) {
        stickY = window.innerHeight - 20;
        stickVelY *= -0.62;
        stickVelX *= 0.78;
        if (Math.abs(stickVelY) < 1.2) stickVelY = 0;
    }

    const angle = Math.atan2(stickVelY, stickVelX) * 180 / Math.PI;
    stick.style.transform = `rotate(${angle}deg)`;

    stick.style.left = stickX + 'px';
    stick.style.top = stickY + 'px';
}

function chaseStick() {
    if (!isChasingStick || !stick || isDraggingStick) return;

    const dx = stickX - (alienX + 60);
    const dy = stickY - (alienY + 65);
    const distance = Math.sqrt(dx*dx + dy*dy);

    if (distance < 75) {
        stick.remove();
        stick = null;
        isChasingStick = false;

        isHoldingStick = true;
        setAlienSrc('stickguy.png');

        setTimeout(() => {
            isHoldingStick = false;
            updateAlienAppearance();
        }, 3000);

        return;
    }

    velocityX += dx * 0.004;
    velocityY += dy * 0.0038;

    const maxSpeed = 13;
    const speed = Math.sqrt(velocityX*velocityX + velocityY*velocityY);
    if (speed > maxSpeed) {
        velocityX = (velocityX / speed) * maxSpeed;
        velocityY = (velocityY / speed) * maxSpeed;
    }
}

function updatePhysics() {
    if (!isDragging) {
        chaseStick();
        updateStickPhysics();

        velocityY += gravity;
        alienX += velocityX;
        alienY += velocityY;

        velocityX *= 0.99;
        velocityY *= 0.99;

        const offGround = alienY + 120 < window.innerHeight;

        if (Math.abs(velocityX) > 10) {
            isFlying = true;
            if (!isBusy && !isPetting && !isChasingStick && !isHoldingStick) {
                setAlienSrc(velocityX > 0 ? 'flyr.png' : 'flyl.png');
            }
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

    alien.style.left = alienX + 'px';
    alien.style.top = alienY + 'px';

    requestAnimationFrame(updatePhysics);
}

function addStickListeners() {
    if (!stick) return;

    stick.addEventListener('mousedown', (e) => {
        isDraggingStick = true;
        isChasingStick = false;
        stickLastX = e.clientX;
        stickLastY = e.clientY;
        stick.style.transition = 'none';
    });

    stick.addEventListener('touchstart', (e) => {
        isDraggingStick = true;
        isChasingStick = false;
        stickLastX = e.touches[0].clientX;
        stickLastY = e.touches[0].clientY;
        stick.style.transition = 'none';
        e.preventDefault();
    }, {passive: false});
}

// События мыши и тача
document.addEventListener('mousemove', (e) => {
    resetInactivityTimer();
    if (isDragging) {
        setAlienSrc('cursorguy.png');
        velocityX = (e.clientX - lastX) * 1.5;
        velocityY = (e.clientY - lastY) * 1.5;
        alienX = e.clientX - 60;
        alienY = e.clientY - 60;
        lastX = e.clientX;
        lastY = e.clientY;
    } 
    else if (isDraggingStick && stick) {
        stickX = e.clientX - 29;
        stickY = e.clientY - 5;
        stick.style.left = stickX + 'px';
        stick.style.top = stickY + 'px';
    }
});

document.addEventListener('mouseup', (e) => {
    if (isDraggingStick && stick) {
        stickVelX = (e.clientX - stickLastX) * 0.25;
        stickVelY = (e.clientY - stickLastY) * 0.25;

        isDraggingStick = false;
        isChasingStick = true;
        stick.style.transition = 'transform 0.05s linear';
    }
    isDragging = false;
    updateAlienAppearance();
});

document.addEventListener('touchmove', (e) => {
    resetInactivityTimer();
    if (isDragging) {
        const tx = e.touches[0].clientX;
        const ty = e.touches[0].clientY;
        setAlienSrc('cursorguy.png');
        velocityX = (tx - lastX) * 1.5;
        velocityY = (ty - lastY) * 1.5;
        alienX = tx - 60;
        alienY = ty - 60;
        lastX = tx;
        lastY = ty;
        e.preventDefault();
    } 
    else if (isDraggingStick && stick) {
        stickX = e.touches[0].clientX - 29;
        stickY = e.touches[0].clientY - 5;
        stick.style.left = stickX + 'px';
        stick.style.top = stickY + 'px';
    }
}, {passive: false});

document.addEventListener('touchend', (e) => {
    if (isDraggingStick && stick) {
        const tx = e.changedTouches[0].clientX;
        const ty = e.changedTouches[0].clientY;

        stickVelX = (tx - stickLastX) * 0.15;
        stickVelY = (ty - stickLastY) * 0.15;

        isDraggingStick = false;
        isChasingStick = true;
        stick.style.transition = 'transform 0.05s linear';
    }
    isDragging = false;
    updateAlienAppearance();
});

// События пришельца
alien.addEventListener('mousedown', (e) => { 
    isDragging = true; 
    isPetting = false;
    playAnimation('angruguy.png', 3000); 
    lastX = e.clientX; 
    lastY = e.clientY; 
});

alien.addEventListener('mousemove', handlePetting);
alien.addEventListener('mouseleave', cancelPetting);

alien.addEventListener('touchstart', (e) => { 
    isDragging = true; 
    isPetting = false;
    playAnimation('angruguy.png', 3000); 
    lastX = e.touches[0].clientX; 
    lastY = e.touches[0].clientY; 
}, {passive: false});

updatePhysics();
resetInactivityTimer();