const alien = document.getElementById('alien');
const alienImg = document.getElementById('alien-img');

let isDragging = false, isCrying = false, isAngry = false, isStroking = false;
let afkTimeout, strokeCount = 0, heartInterval;
let velocityX = 0, velocityY = 0, lastX, lastY;
let alienX = window.innerWidth / 2 - 60, alienY = window.innerHeight / 2 - 60;

function updatePhysics() {
    if (!isDragging) {
        velocityY += 0.8; // Гравитация
        alienX += velocityX; 
        alienY += velocityY;
        velocityX *= 0.99; 
        velocityY *= 0.99;

        // ПОЛ (от него отскакивает)
        if (alienY + 120 > window.innerHeight) {
            alienY = window.innerHeight - 120;
            if (Math.abs(velocityY) > 5) triggerCry();
            velocityY *= -0.7;
        }

        // ПОРТАЛЫ (бока и верх)
        if (alienX > window.innerWidth) alienX = -120;
        if (alienX < -120) alienX = window.innerWidth;
        if (alienY < -120) alienY = window.innerHeight;
    }
    alien.style.left = alienX + 'px';
    alien.style.top = alienY + 'px';
    requestAnimationFrame(updatePhysics);
}

function triggerCry() {
    if (isCrying || isDragging || isAngry) return;
    isCrying = true;
    alienImg.src = 'cryingguy.png';
    setTimeout(() => { 
        isCrying = false; 
        if(!isDragging && !isAngry && !isStroking) alienImg.src = 'justaguy.png'; 
    }, 800);
}

function setAfk() { if (!isDragging && !isCrying && !isAngry && !isStroking) alienImg.src = 'disapointedguy.png'; }

function resetAfkTimer() {
    clearTimeout(afkTimeout);
    if (!isDragging && !isCrying && !isAngry && !isStroking) alienImg.src = 'justaguy.png';
    afkTimeout = setTimeout(setAfk, 5000);
}

function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '❤️';
    heart.style.left = (alienX + 45 + Math.random() * 30) + 'px';
    heart.style.top = (alienY - 10) + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
}

alien.addEventListener('mousedown', (e) => {
    isDragging = true; isAngry = true;
    alienImg.src = 'angruguy.png';
    lastX = e.clientX; lastY = e.clientY;
    setTimeout(() => { isAngry = false; if(!isDragging && !isCrying) alienImg.src = 'justaguy.png'; }, 2000);
});

alien.addEventListener('mousemove', (e) => {
    if (isDragging) {
        alienImg.src = 'cursorguy.png';
        velocityX = (e.clientX - lastX) * 1.5; 
        velocityY = (e.clientY - lastY) * 1.5;
        alienX = e.clientX - 60; alienY = e.clientY - 60;
        lastX = e.clientX; lastY = e.clientY;
    } else {
        strokeCount++;
        if (strokeCount > 40 && !isAngry && !isCrying && !isStroking) {
            isStroking = true;
            alienImg.src = 'chillguy.png';
            alien.style.transform = "scale(1.1)";
            heartInterval = setInterval(createHeart, 200);
        }
    }
    resetAfkTimer();
});

alien.addEventListener('mouseleave', () => {
    strokeCount = 0;
    if(isStroking) {
        isStroking = false;
        clearInterval(heartInterval);
        alien.style.transform = "scale(1)";
        alienImg.src = 'justaguy.png';
    }
});

window.addEventListener('mouseup', () => { 
    if(isDragging) { isDragging = false; alienImg.src = 'justaguy.png'; } 
});

updatePhysics();
resetAfkTimer();