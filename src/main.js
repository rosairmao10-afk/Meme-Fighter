const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');

ctx.imageSmoothingEnabled = false;

let gameState = 'menu';

const background     = new Image();
background.src       = 'assets/backgrounds/stage1.png';

const menuBackground = new Image();
menuBackground.src   = 'assets/backgrounds/inicio.png';

let p1, p2;

let mobileBotTimer = 0;

let p1Sel = 0;
let p2Sel = CHARACTERS.length - 1;

let p1Ready = false;
let p2Ready = false;

// =========================
// CLICK
// =========================

canvas.addEventListener('click', e => {

    const rect   = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH  / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top)  * scaleY;

    // ======================
    // MENU
    // ======================

    if (gameState === 'menu') {

        if (
            mouseX >= 330 &&
            mouseX <= 570 &&
            mouseY >= 430 &&
            mouseY <= 510
        ) {
            gameState = 'select';
        }
    }

    // ======================
    // MOBILE SELECT
    // ======================

    if (gameState === 'select' && IS_MOBILE) {

        const CARD_W = 140;
        const CARD_H = 145;

        const MARGIN_X   = 40;
        const totalCardW = CHARACTERS.length * CARD_W;
        const available  = CANVAS_WIDTH - MARGIN_X * 2 - totalCardW;

        const gap = CHARACTERS.length > 1
            ? Math.max(8, available / (CHARACTERS.length - 1))
            : 0;

        const startX =
            (CANVAS_WIDTH - (totalCardW + gap * (CHARACTERS.length - 1))) / 2;

        CHARACTERS.forEach((char, i) => {

            const x = startX + i * (CARD_W + gap);
            const y = 82;

            if (
                mouseX >= x &&
                mouseX <= x + CARD_W &&
                mouseY >= y &&
                mouseY <= y + CARD_H
            ) {

                // primeiro toque = selecionar
                if (p1Sel !== i) {

                    p1Sel = i;
                }

                // segundo toque = confirmar
                else {

                    p1Ready = true;

                    p2Sel = Math.floor(Math.random() * CHARACTERS.length);

                    p2Ready = true;

                    gameState = 'controls';
                }
            }
        });
    }

    // ======================
    // MOBILE CONTROLS
    // ======================

    if (gameState === 'controls' && IS_MOBILE) {
        initGame();
    }

    // ======================
    // GAME OVER MOBILE
    // ======================

    if (gameState === 'gameover' && IS_MOBILE) {

        p1Ready = false;
        p2Ready = false;

        p1Sel = 0;
        p2Sel = CHARACTERS.length - 1;

        gameState = 'select';
    }
});

// =========================
// INICIAR LUTA
// =========================

function initGame() {

    p1 = new Fighter(
        60,
        -500,
        CHARACTERS[p1Sel],
        PLAYER1_KEYS
    );

    p2 = new Fighter(
        CANVAS_WIDTH - 280,
        -500,
        CHARACTERS[p2Sel],
        PLAYER2_KEYS
    );

    p2.facing = -1;

    gameState = 'fighting';
}

// =========================
// UPDATE
// =========================

function update() {

    if (gameState === 'menu') return;

    // ======================
    // SELECT
    // ======================

    if (gameState === 'select') {

        // PC ONLY
        if (!IS_MOBILE) {

            // P1
            if (!p1Ready) {

                if (keys['KeyA']) {
                    p1Sel = (p1Sel - 1 + CHARACTERS.length) % CHARACTERS.length;
                    keys['KeyA'] = false;
                }

                if (keys['KeyD']) {
                    p1Sel = (p1Sel + 1) % CHARACTERS.length;
                    keys['KeyD'] = false;
                }

                if (keys['KeyF']) {
                    p1Ready = true;
                }
            }

            // P2
            if (!p2Ready) {

                if (keys['ArrowLeft']) {
                    p2Sel = (p2Sel - 1 + CHARACTERS.length) % CHARACTERS.length;
                    keys['ArrowLeft'] = false;
                }

                if (keys['ArrowRight']) {
                    p2Sel = (p2Sel + 1) % CHARACTERS.length;
                    keys['ArrowRight'] = false;
                }

                if (keys['KeyL']) {
                    p2Ready = true;
                }
            }

            if (p1Ready && p2Ready && keys['Enter']) {

                keys['Enter'] = false;

                gameState = 'controls';
            }
        }
    }

    // ======================
    // CONTROLS
    // ======================

    else if (gameState === 'controls') {

        if (!IS_MOBILE) {

            if (keys['Enter']) {

                keys['Enter'] = false;

                initGame();
            }
        }
    }

    // ======================
    // FIGHTING
    // ======================

    else if (gameState === 'fighting') {

        // ======================
        // BOT MOBILE
        // ======================

        if (IS_MOBILE) {

            mobileBotTimer++;

            const dist = p1.x - p2.x;

            keys[PLAYER2_KEYS.left]  = false;
            keys[PLAYER2_KEYS.right] = false;

            // aproxima
            if (Math.abs(dist) > 180) {

                if (dist < 0) {
                    keys[PLAYER2_KEYS.left] = true;
                }
                else {
                    keys[PLAYER2_KEYS.right] = true;
                }
            }

            // ataque leve
            if (mobileBotTimer % 45 === 0) {

                keys[PLAYER2_KEYS.attack] = true;

                setTimeout(() => {
                    keys[PLAYER2_KEYS.attack] = false;
                }, 120);
            }

            // ataque pesado
            if (mobileBotTimer % 160 === 0) {

                keys[PLAYER2_KEYS.attack2] = true;

                setTimeout(() => {
                    keys[PLAYER2_KEYS.attack2] = false;
                }, 180);
            }

            // ultimate
            if (
                mobileBotTimer % 300 === 0 &&
                p2.energy >= MAX_ENERGY
            ) {

                keys[PLAYER2_KEYS.special] = true;

                setTimeout(() => {
                    keys[PLAYER2_KEYS.special] = false;
                }, 150);
            }
        }

        p1.update();
        p2.update();

        checkAttack(p1, p2);
        checkAttack(p2, p1);

        updateParticles();

        if (shakeTimer > 0) {
            shakeTimer--;
        }

        if (p1.hp <= 0 || p2.hp <= 0) {
            gameState = 'gameover';
        }
    }

    // ======================
    // GAME OVER
    // ======================

    else if (gameState === 'gameover') {

        if (!IS_MOBILE) {

            if (keys['Enter']) {

                p1Ready = false;
                p2Ready = false;

                p1Sel = 0;
                p2Sel = CHARACTERS.length - 1;

                gameState = 'select';
            }
        }
    }
}

// =========================
// DRAW
// =========================

function draw() {

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (shakeTimer > 0) {

        ctx.save();

        ctx.translate(
            Math.random() * 10 - 5,
            Math.random() * 10 - 5
        );
    }

    // ======================
    // MENU
    // ======================

    if (gameState === 'menu') {

        ctx.drawImage(
            menuBackground,
            0,
            0,
            CANVAS_WIDTH,
            CANVAS_HEIGHT
        );

        ctx.fillStyle = '#111';

        ctx.fillRect(
            330,
            430,
            240,
            80
        );

        ctx.strokeStyle = 'white';
        ctx.lineWidth   = 4;

        ctx.strokeRect(
            330,
            430,
            240,
            80
        );

        ctx.fillStyle = 'white';
        ctx.font      = '40px monospace';

        ctx.fillText(
            'JOGAR',
            370,
            482
        );
    }

    // ======================
    // SELECT
    // ======================

    else if (gameState === 'select') {

        drawSelection(ctx);
    }

    // ======================
    // CONTROLS
    // ======================

    else if (gameState === 'controls') {

        drawControls(ctx);
    }

    // ======================
    // FIGHT / GAMEOVER
    // ======================

    else {

        ctx.drawImage(
            background,
            0,
            0,
            CANVAS_WIDTH,
            CANVAS_HEIGHT
        );

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

        drawMobileControls(ctx);

        // ======================
        // GAME OVER
        // ======================

        if (gameState === 'gameover') {

            ctx.fillStyle = 'rgba(0,0,0,0.7)';

            ctx.fillRect(
                0,
                0,
                CANVAS_WIDTH,
                CANVAS_HEIGHT
            );

            ctx.fillStyle = 'white';

            ctx.font = '50px monospace';

            ctx.textAlign = 'center';

            const winner =
                p1.hp > 0
                ? 'P1 VENCEU!'
                : 'P2 VENCEU!';

            ctx.fillText(
                winner,
                CANVAS_WIDTH / 2,
                CANVAS_HEIGHT / 2
            );

            ctx.font = '20px monospace';

            ctx.fillText(
                IS_MOBILE
                    ? 'TOQUE PARA RECOMEÇAR'
                    : 'ENTER PARA RECOMEÇAR',

                CANVAS_WIDTH / 2,
                CANVAS_HEIGHT / 2 + 50
            );

            ctx.textAlign = 'left';
        }
    }

    if (shakeTimer > 0) {
        ctx.restore();
    }
}

// =========================
// LOOP
// =========================

function loop() {

    update();
    draw();

    requestAnimationFrame(loop);
}

loop();
