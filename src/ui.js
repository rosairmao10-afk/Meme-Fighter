// ============================================
// SPRITE CACHE
// ============================================

const _spriteCache = {};

function _getSprite(src) {
    if (!_spriteCache[src]) {
        const img = new Image();
        img.src   = src;
        _spriteCache[src] = img;
    }
    return _spriteCache[src];
}

// ============================================
// HEX → RGBA
// ============================================

function _hexRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

// ============================================
// ESTRELAS ANIMADAS
// ============================================

let _stars = null;

function _initStars() {
    _stars = [];
    for (let i = 0; i < 160; i++) {
        _stars.push({
            x:          Math.random() * CANVAS_WIDTH,
            y:          Math.random() * CANVAS_HEIGHT,
            r:          Math.random() * 1.6 + 0.2,
            baseAlpha:  Math.random() * 0.5 + 0.3,
            phase:      Math.random() * Math.PI * 2,
            phaseSpeed: Math.random() * 0.018 + 0.004,
            vy:         -(Math.random() * 0.12 + 0.02)
        });
    }
}

function _drawStars(ctx) {
    if (!_stars) _initStars();
    _stars.forEach(s => {
        s.phase += s.phaseSpeed;
        s.y     += s.vy;
        if (s.y < -2) s.y = CANVAS_HEIGHT + 2;
        const alpha = s.baseAlpha * (0.45 + 0.55 * Math.sin(s.phase));
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    });
}

// ============================================
// STATS DE UM PERSONAGEM
// ============================================

function _drawCharStats(ctx, char, startX, startY) {
    if (!char.stats) return;

    const s      = char.stats;
    const LABEL  = 84;
    const BAR_W  = 130;
    const LINE_H = 22;
    const DOT_R  = 5;

    let y = startY;

    ctx.fillStyle = '#99aacc';
    ctx.font      = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(char.shortName || char.name, startX, y);
    y += LINE_H;

    ctx.strokeStyle = '#1e1e3a';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(startX, y - 6);
    ctx.lineTo(startX + LABEL + BAR_W + 30, y - 6);
    ctx.stroke();

    const statList = [
        { label: 'SPEED', val: s.velocidade, color: '#44aaff' },
        { label: 'POWER', val: s.poder,      color: '#ff9933' },
        { label: 'DEF',   val: s.defesa,     color: '#44ff88' }
    ];

    statList.forEach(({ label, val, color }) => {
        const barX  = startX + LABEL;
        const barY  = y - 9;
        const fillW = BAR_W * Math.max(0, Math.min(1, val / 100));

        ctx.fillStyle = '#445566';
        ctx.font      = '20px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(label, startX, y);

        ctx.fillStyle = '#0d0d1e';
        ctx.fillRect(barX, barY, BAR_W, 7);

        ctx.fillStyle = color;
        ctx.fillRect(barX, barY, fillW, 7);

        ctx.fillStyle = '#667788';
        ctx.font      = '18px monospace';
        ctx.fillText(val, barX + BAR_W + 6, y);

        y += LINE_H;
    });

    ctx.fillStyle = '#445566';
    ctx.font      = '20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('AURA', startX, y);

    for (let i = 0; i < 5; i++) {
        const dotX = startX + LABEL + i * (DOT_R * 2 + 5);
        const dotY = y - DOT_R - 1;
        ctx.beginPath();
        ctx.arc(dotX + DOT_R, dotY, DOT_R, 0, Math.PI * 2);
        ctx.fillStyle   = i < s.dificuldade ? '#ffcc00' : '#1a1a2a';
        ctx.strokeStyle = '#2a2a3a';
        ctx.lineWidth   = 1;
        ctx.fill();
        ctx.stroke();
    }
}

// ============================================
// HUD
// ============================================

function drawHUD(ctx, p1, p2) {

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 105);

    drawBar(ctx, 20, 30, 300, 25, p1.hp / MAX_HP, '#4af');
    drawBar(ctx, 20, 65, 220, 12, p1.energy / MAX_ENERGY, '#ffcc00');

    ctx.fillStyle = 'white';
    ctx.font      = '20px monospace';
    ctx.fillText(p1.name, 20, 24);

    if (!isMobile) {
        ctx.fillStyle = '#000000';
        ctx.font      = '11px monospace';
        ctx.fillText('A/D MOV | W PUL | F PES | R LEV | G ULT | E ESCUDO', 20, 95);
    }

    drawBar(ctx, CANVAS_WIDTH - 320, 30, 300, 25, p2.hp / MAX_HP, '#ff4444');
    drawBar(ctx, CANVAS_WIDTH - 240, 65, 220, 12, p2.energy / MAX_ENERGY, '#ffcc00');

    ctx.fillStyle = 'white';
    ctx.font      = '20px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(p2.isBot ? p2.name + ' [BOT]' : p2.name, CANVAS_WIDTH - 20, 24);

    if (!isMobile) {
        ctx.fillStyle = '#000000';
        ctx.font      = '11px monospace';
        ctx.fillText('←/→ MOV | ↑ PUL | L PES | P LEV | K ULT | O ESCUDO', CANVAS_WIDTH - 20, 95);
    }

    ctx.textAlign = 'left';
}

// ============================================
// BARRA
// ============================================

function drawBar(ctx, x, y, w, h, percent, color) {
    ctx.fillStyle = '#222';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w * Math.max(0, percent), h);
    ctx.strokeStyle = 'white';
    ctx.lineWidth   = 2;
    ctx.strokeRect(x, y, w, h);
}

// ============================================
// FONTE AUTO-AJUSTÁVEL
// ============================================

function fitText(ctx, text, maxWidth, maxSize, minSize, fontStyle) {
    let size = maxSize;
    ctx.font = fontStyle + size + 'px monospace';
    while (ctx.measureText(text).width > maxWidth && size > minSize) {
        size--;
        ctx.font = fontStyle + size + 'px monospace';
    }
    return size;
}

// ============================================
// TELA DE SELEÇÃO — PC + MOBILE
// ============================================

function drawSelection(ctx) {

    const CARD_W  = 140;
    const CARD_H  = 145;
    const CARD_Y  = 82;
    const SPLIT   = 338;
    const PREV_W  = 205;
    const PREV_H  = 258;
    const PREV_Y  = SPLIT + 20;
    const PREV_P1_X = 38;
    const PREV_P2_X = CANVAS_WIDTH - PREV_W - 38;

    const p1Char = CHARACTERS[p1Sel];
    const p2Char = CHARACTERS[p2Sel];

    ctx.fillStyle = '#080810';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    _drawStars(ctx);

    ctx.fillStyle = _hexRgba(p1Char.color, 0.07);
    ctx.fillRect(0, SPLIT, CANVAS_WIDTH / 2, CANVAS_HEIGHT - SPLIT);

    ctx.fillStyle = _hexRgba(p2Char.color, 0.07);
    ctx.fillRect(CANVAS_WIDTH / 2, SPLIT, CANVAS_WIDTH / 2, CANVAS_HEIGHT - SPLIT);

    // Título
    ctx.fillStyle = 'white';
    ctx.font      = 'bold 38px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECIONE SEU MEME', CANVAS_WIDTH / 2, 50);

    ctx.strokeStyle = '#44aaff';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2 - 250, 61);
    ctx.lineTo(CANVAS_WIDTH / 2 + 250, 61);
    ctx.stroke();

    // Cards
    const MARGIN_X   = 40;
    const totalCardW = CHARACTERS.length * CARD_W;
    const available  = CANVAS_WIDTH - MARGIN_X * 2 - totalCardW;
    const gap        = CHARACTERS.length > 1 ? Math.max(8, available / (CHARACTERS.length - 1)) : 0;
    const startX     = (CANVAS_WIDTH - (totalCardW + gap * (CHARACTERS.length - 1))) / 2;
    const nameMaxW   = CARD_W + gap * 0.85;

    CHARACTERS.forEach((char, i) => {
        const x      = startX + i * (CARD_W + gap);
        const y      = CARD_Y;
        const isP1   = p1Sel === i;
        const isP2   = p2Sel === i;
        const isBoth = isP1 && isP2;

        // Destaque especial para card pré-visualizado no mobile (1º toque)
        const isPreviewed = isMobile && mobileLastTap === i && !p1Ready;

        if (isP1 || isP2 || isPreviewed) {
            ctx.shadowBlur  = 20;
            ctx.shadowColor = isBoth ? '#ffffff' : isP1 ? '#44aaff' : isPreviewed ? '#ffcc00' : '#ff4444';
        }

        ctx.fillStyle = isP1 || isP2 || isPreviewed ? '#1a2438' : '#111122';
        ctx.fillRect(x, y, CARD_W, CARD_H);

        ctx.shadowBlur = 0;

        ctx.strokeStyle = isBoth ? '#fff' : isP1 ? '#44aaff' : isP2 ? '#ff4444' : isPreviewed ? '#ffcc00' : '#2a2a44';
        ctx.lineWidth   = isP1 || isP2 || isPreviewed ? 3 : 1.5;
        ctx.strokeRect(x, y, CARD_W, CARD_H);

        ctx.drawImage(_getSprite(char.sprite), x, y, CARD_W, CARD_H);

        fitText(ctx, char.name, nameMaxW, 12, 9, '');
        ctx.fillStyle = '#aaaacc';
        ctx.textAlign = 'center';
        ctx.fillText(char.name, x + CARD_W / 2, y + CARD_H + 18);

        if (isP1) {
            ctx.fillStyle = '#44aaff';
            ctx.font      = 'bold 14px monospace';
            ctx.fillText('P1', x + CARD_W / 2, y - 8);
        }

        if (isP2) {
            ctx.fillStyle = isMobile ? '#ff6666' : '#ff4444';
            ctx.font      = 'bold 14px monospace';
            ctx.fillText(isMobile ? 'BOT' : 'P2', x + CARD_W / 2, y + CARD_H + 34);
        }

        // Indicador de toque no mobile
        if (isMobile && isPreviewed && !isP1) {
            ctx.fillStyle = '#ffcc00';
            ctx.font      = 'bold 11px monospace';
            ctx.fillText('TOQUE 2X', x + CARD_W / 2, y + CARD_H + 34);
        }
    });

    // Guia de controles
    ctx.fillStyle = '#444466';
    ctx.font      = '13px monospace';
    ctx.textAlign = 'center';

    if (isMobile) {
        ctx.fillText('TOQUE 1x para ver stats  |  TOQUE 2x para escolher', CANVAS_WIDTH / 2, 283);
        ctx.fillStyle = '#ff6666';
        ctx.fillText('P2 será um BOT', CANVAS_WIDTH / 2, 302);
    } else {
        ctx.fillText('P1: A / D navegar  |  F confirmar', CANVAS_WIDTH / 2, 283);
        ctx.fillText('P2: ← / → navegar  |  L confirmar', CANVAS_WIDTH / 2, 302);
    }

    // Divisores
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(0, SPLIT);
    ctx.lineTo(CANVAS_WIDTH, SPLIT);
    ctx.stroke();

    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, SPLIT + 5);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 85);
    ctx.stroke();
    ctx.setLineDash([]);

    // Previews grandes
    ctx.drawImage(_getSprite(p1Char.sprite), PREV_P1_X, PREV_Y, PREV_W, PREV_H);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(PREV_P1_X + PREV_W / 2, PREV_Y + PREV_H + 5, 72, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(PREV_P2_X + PREV_W, PREV_Y);
    ctx.scale(-1, 1);
    ctx.drawImage(_getSprite(p2Char.sprite), 0, 0, PREV_W, PREV_H);
    ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(PREV_P2_X + PREV_W / 2, PREV_Y + PREV_H + 5, 72, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    _drawCharStats(ctx, p1Char, PREV_P1_X + PREV_W + 18, PREV_Y + 30);
    _drawCharStats(ctx, p2Char, CANVAS_WIDTH / 2 + 30, PREV_Y + 30);

    if (p1Ready) {
        ctx.fillStyle = '#44aaff';
        ctx.font      = 'bold 18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('✔ P1 PRONTO', PREV_P1_X + PREV_W + 18, 580);
    }

    if (p2Ready) {
        ctx.fillStyle = isMobile ? '#ff6666' : '#ff4444';
        ctx.font      = 'bold 18px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(isMobile ? '⚙ BOT PRONTO' : '✔ P2 PRONTO', PREV_P2_X - 18, 580);
    }

    // Prompt de iniciar
    if (p1Ready && p2Ready) {
        const pulse = Math.abs(Math.sin(Date.now() / 500));
        ctx.save();
        ctx.globalAlpha = 0.55 + pulse * 0.45;
        ctx.fillStyle   = '#f5d000';
        ctx.font        = 'bold 22px monospace';
        ctx.textAlign   = 'center';
        ctx.fillText(
            isMobile ? 'PREPARANDO BATALHA...' : 'PRESSIONE ENTER PARA LUTAR!',
            CANVAS_WIDTH / 2, 596
        );
        ctx.restore();
    }

    // Matchup
    const p1Short = p1Char.shortName || p1Char.name;
    const p2Short = p2Char.shortName || p2Char.name;
    const matchup = `${p1Short}  X  ${p2Short}`;

    let mSize = 56;
    ctx.font  = `bold ${mSize}px Arial`;
    while (ctx.measureText(matchup).width > CANVAS_WIDTH - 520 && mSize > 26) {
        mSize -= 2;
        ctx.font = `bold ${mSize}px Arial`;
    }

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(matchup, CANVAS_WIDTH / 2, 696);

    ctx.textAlign = 'left';
}

// ============================================
// TELA DE CONTROLES
// ============================================

function drawControls(ctx) {

    const MID  = CANVAS_WIDTH / 2;
    const BOLD = 'bold ';

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    _drawStars(ctx);

    if (isMobile) {
        // Versão mobile: só P1 + info sobre BOT
        ctx.fillStyle = '#ffffff';
        ctx.font      = BOLD + '58px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CONTROLES', MID, 90);

        ctx.strokeStyle = '#44aaff';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.moveTo(MID - 220, 105);
        ctx.lineTo(MID + 220, 105);
        ctx.stroke();

        const mobileControls = [
            { icon: '🕹️', desc: 'Joystick esq. — Andar' },
            { icon: '↑',  desc: 'Botão PULAR (abaixo do joystick)' },
            { icon: '⚡', desc: 'ATQ LEVE — Golpe rápido (verde)' },
            { icon: '💥', desc: 'ATQ PESADO — Golpe forte (laranja)' },
            { icon: '🛡',  desc: 'ESCUDO — Bloquear (azul)' },
            { icon: '★',  desc: 'ULTIMATE — Especial (dourado)' },
        ];

        let cy = 155;
        const lineH = 68;

        mobileControls.forEach(item => {
            ctx.fillStyle = '#ffffff';
            ctx.font      = BOLD + '30px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(item.icon + '  ' + item.desc, 80, cy);
            cy += lineH;
        });

        // Info BOT
        ctx.fillStyle = '#ff6666';
        ctx.font      = BOLD + '26px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚙ P2 é um BOT controlado pelo jogo', MID, cy + 20);

        // Prompt toque
        const pulse = Math.abs(Math.sin(Date.now() / 500));
        ctx.save();
        ctx.globalAlpha = 0.5 + pulse * 0.5;
        ctx.fillStyle   = '#f5d000';
        ctx.font        = BOLD + '40px Arial';
        ctx.textAlign   = 'center';
        ctx.fillText('TOQUE NA TELA PARA LUTAR!', MID, CANVAS_HEIGHT - 50);
        ctx.restore();

    } else {
        // Versão PC original
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 3;
        ctx.beginPath();
        ctx.moveTo(MID, 40);
        ctx.lineTo(MID, CANVAS_HEIGHT - 100);
        ctx.stroke();

        const p1Controls = [
            { key: 'A / D', desc: 'Andar'        },
            { key: 'W',     desc: 'Pular'         },
            { key: 'F',     desc: 'Ataque Leve' },
            { key: 'R',     desc: 'Ataque Pesado'   },
            { key: 'G',     desc: 'Ultimate'      },
            { key: 'E',     desc: 'Escudo'        }
        ];

        ctx.fillStyle = '#ffffff';
        ctx.font      = BOLD + '72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Player 01', MID / 2, 110);

        ctx.textAlign = 'left';
        const p1X   = 70;
        let   p1Y   = 185;
        const lineH = 74;

        p1Controls.forEach(item => {
            ctx.fillStyle = '#ffffff';
            ctx.font      = BOLD + '38px Arial';
            ctx.fillText(item.key + '  -  ' + item.desc, p1X, p1Y);
            p1Y += lineH;
        });

        const p2Controls = [
            { key: '← / →', desc: 'Andar'        },
            { key: '↑',      desc: 'Pular'         },
            { key: 'L',      desc: 'Ataque Leve' },
            { key: 'P',      desc: 'Ataque Pesado'   },
            { key: 'K',      desc: 'Ultimate'      },
            { key: 'O',      desc: 'Escudo'        }
        ];

        ctx.fillStyle = '#ffffff';
        ctx.font      = BOLD + '72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Player 02', MID + MID / 2, 110);

        ctx.textAlign = 'left';
        const p2X = MID + 70;
        let   p2Y = 185;

        p2Controls.forEach(item => {
            ctx.fillStyle = '#ffffff';
            ctx.font      = BOLD + '38px Arial';
            ctx.fillText(item.key + '  -  ' + item.desc, p2X, p2Y);
            p2Y += lineH;
        });

        const pulse = Math.abs(Math.sin(Date.now() / 500));
        ctx.save();
        ctx.globalAlpha = 0.5 + pulse * 0.5;
        ctx.fillStyle   = '#f5d000';
        ctx.font        = BOLD + '52px Arial';
        ctx.textAlign   = 'center';
        ctx.fillText('PRESSIONE ENTER', MID, CANVAS_HEIGHT - 42);
        ctx.restore();
    }

    ctx.textAlign = 'left';
}
