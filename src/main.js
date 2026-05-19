const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');

ctx.imageSmoothingEnabled = false;

let gameState = 'menu';

const background     = new Image();
background.src       = 'assets/backgrounds/stage1.png';

const menuBackground = new Image();
menuBackground.src   = 'assets/backgrounds/inicio.png';

let p1, p2;

let p1Sel = 0;
let p2Sel = CHARACTERS.length - 1;   // ← P2 começa no ÚLTIMO personagem

let p1Ready = false;
let p2Ready = false;

canvas.addEventListener('click', e => {

    if (gameState !== 'menu') return;

    const rect   = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH  / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top)  * scaleY;

    if (mouseX >= 330 && mouseX <= 570 && mouseY >= 300 && mouseY <= 380) {
        gameState = 'select';
    }
});

// =========================
// INICIAR LUTA
// Players spawniam nos cantos superiores e caem até o chão
// =========================

function initGame() {

    // P1: canto superior esquerdo
    p1 = new Fighter(60, -500, CHARACTERS[p1Sel], PLAYER1_KEYS);

    // P2: canto superior direito
    p2 = new Fighter(CANVAS_WIDTH - 280, -500, CHARACTERS[p2Sel], PLAYER2_KEYS);

    // P2 começa virado para a esquerda (encarando P1)
    p2.facing = -1;

    gameState = 'fighting';
}

function update() {

    if (gameState === 'menu') return;

    if (gameState === 'select') {

        if (!p1Ready) {

            if (keys['KeyA']) {
                p1Sel = (p1Sel - 1 + CHARACTERS.length) % CHARACTERS.length;
                keys['KeyA'] = false;
            }

            if (keys['KeyD']) {
                p1Sel = (p1Sel + 1) % CHARACTERS.length;
                keys['KeyD'] = false;
            }

            if (keys['KeyF']) p1Ready = true;
        }

        if (!p2Ready) {

            if (keys['ArrowLeft']) {
                p2Sel = (p2Sel - 1 + CHARACTERS.length) % CHARACTERS.length;
                keys['ArrowLeft'] = false;
            }

            if (keys['ArrowRight']) {
                p2Sel = (p2Sel + 1) % CHARACTERS.length;
                keys['ArrowRight'] = false;
            }

            if (keys['KeyL']) p2Ready = true;
        }

        if (p1Ready && p2Ready && keys['Enter']) {
            keys['Enter'] = false;
            gameState = 'controls';
        }
    }

    else if (gameState === 'controls') {

        if (keys['Enter']) {
            keys['Enter'] = false;
            initGame();
        }
    }

    else if (gameState === 'fighting') {

        p1.update();
        p2.update();

        checkAttack(p1, p2);
        checkAttack(p2, p1);

        updateParticles();

        if (shakeTimer > 0) shakeTimer--;

        if (p1.hp <= 0 || p2.hp <= 0) {
            gameState = 'gameover';
        }
    }

    else if (gameState === 'gameover') {

        if (keys['Enter']) {
            p1Ready = false;
            p2Ready = false;
            p1Sel   = 0;
            p2Sel   = CHARACTERS.length - 1;   // ← reset também volta ao último
            gameState = 'select';
        }
    }
}

function draw() {

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (shakeTimer > 0) {
        ctx.save();
        ctx.translate(Math.random() * 10 - 5, Math.random() * 10 - 5);
    }

    if (gameState === 'menu') {

        ctx.drawImage(menuBackground, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#111';
        ctx.fillRect(330, 300, 240, 80);

        ctx.strokeStyle = 'white';
        ctx.lineWidth   = 4;
        ctx.strokeRect(330, 300, 240, 80);

        ctx.fillStyle = 'white';
        ctx.font      = '40px monospace';
        ctx.fillText('JOGAR', 370, 352);
    }

    else if (gameState === 'select') {
        drawSelection(ctx);
    }

    else if (gameState === 'controls') {
        drawControls(ctx);
    }

    else {

        ctx.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.strokeStyle = '#555';
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
        ctx.stroke();

        p1.draw(ctx);
        p2.draw(ctx);

        drawUltimateRings(ctx);
        particles.forEach(p => p.draw(ctx));
        drawScreenFlash(ctx);
        drawHUD(ctx, p1, p2);

        if (gameState === 'gameover') {

            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            ctx.fillStyle = 'white';
            ctx.font      = '50px monospace';
            ctx.textAlign = 'center';

            const winner = p1.hp > 0 ? 'P1 VENCEU!' : 'P2 VENCEU!';
            ctx.fillText(winner, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

            ctx.font = '20px monospace';
            ctx.fillText('ENTER PARA RECOMEÇAR', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);

            ctx.textAlign = 'left';
        }
    }

    if (shakeTimer > 0) ctx.restore();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();