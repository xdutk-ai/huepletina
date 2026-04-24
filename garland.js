/**
 * effects.js
 * Содержит логику для постоянных светлячков и сезонной гирлянды.
 */

const canvas = document.getElementById('effects-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

/**
 * Функция изменения размера холста под окно браузера
 */
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Класс Particle для создания светлячков и элементов гирлянды
 */
class Particle {
    constructor(type) {
        this.type = type; // 'firefly' или 'garland'
        this.init();
    }

    init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.alpha = Math.random();
        this.fade = Math.random() * 0.02 + 0.005;
        this.color = this.type === 'firefly' ? '#66c0f4' : '#ffeb3b';
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha += this.fade;

        // Эффект мерцания
        if (this.alpha > 0.8 || this.alpha < 0.1) {
            this.fade *= -1;
        }
        
        // Отскок от границ экрана
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * Инициализация всех эффектов
 */
function initEffects() {
    resize();
    particles = [];
    
    // Светлячки — работают ВСЕГДА (60 штук)
    for (let i = 0; i < 60; i++) {
        particles.push(new Particle('firefly'));
    }

    // Проверка текущей даты для гирлянды
    const now = new Date();
    const currentMonth = now.getMonth(); // Январь - 0, Июнь - 5
    const currentDate = now.getDate();
    
    // ПРОВЕРКА: 10 июня (Month 5, Date 10)
    const isJune10 = (currentMonth === 5 && currentDate === 10);
    
    if (isJune10) {
        // Добавляем гирлянду только 10 июня
        for (let i = 0; i < 40; i++) {
            particles.push(new Particle('garland'));
        }
    }
}

/**
 * Главный цикл анимации
 */
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

// Слушатели событий
window.addEventListener('resize', resize);

// Старт
initEffects();
animate();