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
let p2Sel = CHARACTERS.length - 1;

let p1Ready = false;
let p2Ready = false;

// =============================================
// POSIÇÃO DO BOTÃO JOGAR (ajustável)
// =============================================
const BTN_JOGAR = { x: 515, y: 430, w: 240, h: 80 };

// =============================================
// SELEÇÃO MOBILE — controle de toque duplo
// =============================================
let mobileP1Previewed = false;   // 1º toque: ver stats
let mobileLastTap     = -1;      // índice do último card tocado

// =============================================
// CLIQUE NO MENU (PC + Mobile)
// =============================================

canvas.addEventListener('click', e => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH  / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top)  * scaleY;

    // --- MENU: botão JOGAR ---
    if (gameState === 'menu') {
        const b = BTN_JOGAR;
        if (mouseX >= b.x && mouseX <= b.x + b.w &&
            mouseY >= b.y && mouseY <= b.y + b.h) {
            gameState = 'select';
        }
        return;
    }

    // --- CONTROLS: toque para pular (mobile) ---
    if (gameState === 'controls' && isMobile) {
        initGame();
        return;
    }

    // --- SELEÇÃO MOBILE ---
    if (gameState === 'select' && isMobile && !p1Ready) {
        handleMobileSelectTap(mouseX, mouseY);
    }

    // --- GAMEOVER: toque para recomeçar (mobile) ---
    if (gameState === 'gameover' && isMobile) {
        p1Ready = false;
        p2Ready = false;
        p1Sel   = 0;
        p2Sel   = CHARACTERS.length - 1;
        mobileP1Previewed = false;
        mobileLastTap     = -1;
        gameState = 'select';
    }
});

// =============================================
// LÓGICA DE TOQUE NA SELEÇÃO (mobile)
// 1º toque no card: preview / ver stats
// 2º toque no mesmo card: confirmar
// =============================================

function handleMobileSelectTap(mx, my) {
    // Replicar o layout de cards do ui.js
    const CARD_W  = 140;
    const CARD_H  = 145;
    const CARD_Y  = 82;
    const MARGIN_X   = 40;
    const totalCardW = CHARACTERS.length * CARD_W;
    const available  = CANVAS_WIDTH - MARGIN_X * 2 - totalCardW;
    const gap        = CHARACTERS.length > 1
        ? Math.max(8, available / (CHARACTERS.length - 1))
        : 0;
    const startX = (CANVAS_WIDTH - (totalCardW + gap * (CHARACTERS.length - 1))) / 2;

    for (let i = 0; i < CHARACTERS.length; i++) {
        const cx = startX + i * (CARD_W + gap);
        const cy = CARD_Y;

        if (mx >= cx && mx <= cx + CARD_W &&
            my >= cy && my <= cy + CARD_H + 40) {

            if (mobileLastTap === i) {
                // 2º toque no mesmo card → confirmar
                p1Sel   = i;
                p1Ready = true;
                p2Ready = true; // BOT está sempre pronto

                // Pequeno delay para mostrar "confirmado" e ir lutar
                setTimeout(() => {
                    gameState = 'controls';
                }, 300);
            } else {
                // 1º toque → só selecionar para ver stats
                p1Sel         = i;
                mobileLastTap = i;
            }
            return;
        }
    }
}

// =============================================
// INICIAR LUTA
// =============================================

function initGame() {

    // P1 humano
    const p1Controls = isMobile ? MOBILE_KEYS : PLAYER1_KEYS;
    p1 = new Fighter(60, -500, CHARACTERS[p1Sel], p1Controls);

    // P2 — sempre BOT no mobile, humano no PC
    const p2Controls = PLAYER2_KEYS;
    p2 = new Fighter(CANVAS_WIDTH - 280, -500, CHARACTERS[p2Sel], p2Controls);
    p2.facing = -1;

    if (isMobile) {
        p2.isBot     = true;
        p2._botTarget = p1;
        // P2 escolhe personagem aleatório no mobile
        p2Sel = Math.floor(Math.random() * CHARACTERS.length);
        p2 = new Fighter(CANVAS_WIDTH - 280, -500, CHARACTERS[p2Sel], p2Controls);
        p2.facing    = -1;
        p2.isBot     = true;
        p2._botTarget = p1;
    }

    showMobileControls(isMobile);
    gameState = 'fighting';
}

// =============================================
// UPDATE
// =============================================

function update() {

    // Sincronizar teclas mobile a cada frame
    if (isMobile) syncMobileKeys();

    if (gameState === 'menu') return;

    if (gameState === 'select') {

        if (!isMobile) {
            // Seleção PC normal
            if (!p1Ready) {
                if (keys['KeyA']) { p1Sel = (p1Sel - 1 + CHARACTERS.length) % CHARACTERS.length; keys['KeyA'] = false; }
                if (keys['KeyD']) { p1Sel = (p1Sel + 1) % CHARACTERS.length; keys['KeyD'] = false; }
                if (keys['KeyF']) p1Ready = true;
            }

            if (!p2Ready) {
                if (keys['ArrowLeft'])  { p2Sel = (p2Sel - 1 + CHARACTERS.length) % CHARACTERS.length; keys['ArrowLeft'] = false; }
                if (keys['ArrowRight']) { p2Sel = (p2Sel + 1) % CHARACTERS.length; keys['ArrowRight'] = false; }
                if (keys['KeyL']) p2Ready = true;
            }

            if (p1Ready && p2Ready && keys['Enter']) {
                keys['Enter'] = false;
                gameState = 'controls';
            }
        }
        // No mobile, tudo é tratado pelo handleMobileSelectTap
    }

    else if (gameState === 'controls') {
        if (!isMobile && keys['Enter']) {
            keys['Enter'] = false;
            initGame();
        }
        // No mobile, o clique na tela dispara initGame (no listener acima)
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
            showMobileControls(false);
        }
    }

    else if (gameState === 'gameover') {
        if (!isMobile && keys['Enter']) {
            p1Ready = false;
            p2Ready = false;
            p1Sel   = 0;
            p2Sel   = CHARACTERS.length - 1;
            gameState = 'select';
        }
    }
}

// =============================================
// DRAW
// =============================================

function draw() {

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (shakeTimer > 0) {
        ctx.save();
        ctx.translate(Math.random() * 10 - 5, Math.random() * 10 - 5);
    }

    if (gameState === 'menu') {

        ctx.drawImage(menuBackground, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Botão JOGAR mais para baixo
        const b = BTN_JOGAR;
        ctx.fillStyle = '#111';
        ctx.fillRect(b.x, b.y, b.w, b.h);

        ctx.strokeStyle = 'white';
        ctx.lineWidth   = 4;
        ctx.strokeRect(b.x, b.y, b.w, b.h);

        ctx.fillStyle = 'white';
        ctx.font      = '42px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('JOGAR', b.x + b.w / 2, b.y + b.h / 2 + 14);
        ctx.textAlign = 'left';
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

            const winner = p1.hp > 0 ? 'VOCÊ VENCEU!' : (isMobile ? 'BOT VENCEU!' : 'P2 VENCEU!');
            ctx.fillText(winner, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

            ctx.font = '22px monospace';
            const restartMsg = isMobile ? 'TOQUE PARA RECOMEÇAR' : 'ENTER PARA RECOMEÇAR';
            ctx.fillText(restartMsg, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);

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

// Inicializar controles mobile
initMobileControls();

loop();
