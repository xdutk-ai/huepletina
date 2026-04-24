const alien = document.getElementById('alien');
const alienImg = document.getElementById('alien-img');

// Переменные состояния
let isDragging = false;
let isCrying = false;
let isAngry = false;
let afkTimeout; // Таймер для АФК

// Физические переменные
let velocityX = 0, velocityY = 0;
let lastX, lastY;
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
let alienWidth = 120;
let alienHeight = 120;
let alienX = windowWidth / 2 - alienWidth / 2; // Центрируем по горизонтали
let alienY = windowHeight / 2 - alienHeight / 2; // Центрируем по вертикали

// Гравитация и затухание
const gravity = 0.8;
const friction = 0.99;
const bounce = -0.7; // Отрицательный для отскока

// Функция обновления физики
function updatePhysics() {
    if (!isDragging) {
        velocityY += gravity; // Гравитация
        alienX += velocityX;
        alienY += velocityY;

        // Затухание движения
        velocityX *= friction;
        velocityY *= friction;

        // Отскок от пола
        if (alienY + alienHeight > windowHeight) {
            alienY = windowHeight - alienHeight;
            // Плачет, только если удар был сильным
            if (Math.abs(velocityY) > 5) triggerCry();
            velocityY *= bounce;
        }

        // Отскок от потолка
        if (alienY < 0) {
            alienY = 0;
            if (Math.abs(velocityY) > 5) triggerCry();
            velocityY *= bounce;
        }

        // Отскок от стен
        if (alienX < 0 || alienX + alienWidth > windowWidth) {
            if (Math.abs(velocityX) > 5) triggerCry();
            velocityX *= bounce;
            alienX = alienX < 0 ? 0 : windowWidth - alienWidth;
        }
    }

    // Обновляем позицию пришельца
    alien.style.left = alienX + 'px';
    alien.style.top = alienY + 'px';
    requestAnimationFrame(updatePhysics);
}

// Функция плача
function triggerCry() {
    if (isCrying || isDragging || isAngry) return; // Защита
    isCrying = true;
    alienImg.src = 'cryingguy.png';
    setTimeout(() => {
        isCrying = false;
        // Возвращаем normal, только если не тащим и не злимся
        if (!isDragging && !isAngry) alienImg.src = 'justaguy.png';
    }, 800);
}

// Функция АФК
function setAfk() {
    if (isDragging || isCrying || isAngry) return; // Защита
    alienImg.src = 'disapointedguy.png';
}

// Функция сброса АФК таймера
function resetAfkTimer() {
    clearTimeout(afkTimeout); // Сбрасываем старый
    // Возвращаем normal, только если не злимся
    if (!isDragging && !isCrying && !isAngry) {
         if(alienImg.src.includes('disapointedguy.png')) alienImg.src = 'justaguy.png';
    }
    // Устанавливаем новый таймер на 5 секунд
    afkTimeout = setTimeout(setAfk, 5000); 
}

// События мыши
alien.addEventListener('mousedown', (e) => {
    isDragging = true;
    isAngry = true; // Сразу злится
    alienImg.src = 'angruguy.png';
    lastX = e.clientX;
    lastY = e.clientY;
    velocityX = 0; // Сбрасываем скорость при захвате
    velocityY = 0;
    
    resetAfkTimer(); // Сбрасываем АФК при клике

    // Таймер на 2 секунды, чтобы он оставался злым
    setTimeout(() => {
        isAngry = false;
        // Если не тащим и не плачем, возвращаем normal
        if (!isDragging && !isCrying) {
             if(alienImg.src.includes('angruguy.png')) alienImg.src = 'justaguy.png';
        }
    }, 2000);
});

window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        alienImg.src = 'cursorguy.png'; // Перетаскивание
        // Рассчитываем силу броска
        velocityX = (e.clientX - lastX) * 0.8; 
        velocityY = (e.clientY - lastY) * 0.8;
        alienX = e.clientX - alienWidth / 2;
        alienY = e.clientY - alienHeight / 2;
        lastX = e.clientX;
        lastY = e.clientY;
    }
    
    resetAfkTimer(); // Сбрасываем АФК при движении мыши
});

window.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        // Если он еще "злится" (2 сек не прошло), возвращаем злой вид
        if (isAngry) {
            alienImg.src = 'angruguy.png';
        } else {
            alienImg.src = 'justaguy.png';
        }
    }
});

// Начинаем обновление физики и таймер АФК
updatePhysics();
resetAfkTimer();