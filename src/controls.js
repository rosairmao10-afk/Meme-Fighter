// ============================================
// DETECÇÃO DE MOBILE
// ============================================

const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && window.innerWidth <= 1024);

// ============================================
// CONTROLES TECLADO (PC)
// ============================================

const keys = {};

window.addEventListener('keydown', e => { keys[e.code] = true;  });
window.addEventListener('keyup',   e => { keys[e.code] = false; });

const PLAYER1_KEYS = {
    left:    'KeyA',
    right:   'KeyD',
    jump:    'KeyW',
    attack:  'KeyR',    // golpe LEVE
    attack2: 'KeyF',    // golpe PESADO
    special: 'KeyG',
    shield:  'KeyE'
};

const PLAYER2_KEYS = {
    left:    'ArrowLeft',
    right:   'ArrowRight',
    jump:    'ArrowUp',
    attack:  'KeyP',    // golpe LEVE
    attack2: 'KeyL',    // golpe PESADO
    special: 'KeyK',
    shield:  'KeyO'
};

// ============================================
// ESTADO DO CONTROLE MOBILE
// ============================================

const mobileInput = {
    left:    false,
    right:   false,
    jump:    false,
    attack:  false,   // golpe LEVE
    attack2: false,   // golpe PESADO
    special: false,
    shield:  false
};

// Chaves virtuais que mapeiam para o Fighter via MOBILE_KEYS
const MOBILE_KEYS = {
    left:    'MobileLeft',
    right:   'MobileRight',
    jump:    'MobileJump',
    attack:  'MobileAttack',   // golpe LEVE
    attack2: 'MobileHeavy',    // golpe PESADO
    special: 'MobileUlt',
    shield:  'MobileShield'
};

// Injetar estado mobile no sistema de keys a cada frame
function syncMobileKeys() {
    if (!isMobile) return;
    keys['MobileLeft']   = mobileInput.left;
    keys['MobileRight']  = mobileInput.right;
    keys['MobileJump']   = mobileInput.jump;
    keys['MobileAttack'] = mobileInput.attack;
    keys['MobileHeavy']  = mobileInput.attack2;
    keys['MobileUlt']    = mobileInput.special;
    keys['MobileShield'] = mobileInput.shield;
}

// ============================================
// INICIALIZAR CONTROLES MOBILE
// ============================================

function initMobileControls() {
    if (!isMobile) return;

    const joystickZone = document.getElementById('joystick-zone');
    const knob         = document.getElementById('joystick-knob');
    const BASE_R       = 74;
    const DEAD_ZONE    = 13;

    let joystickActive = false;
    let joystickId     = null;
    let baseX = 0, baseY = 0;

    function getJoystickCenter() {
        const rect = joystickZone.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    joystickZone.addEventListener('touchstart', e => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        joystickId     = touch.identifier;
        joystickActive = true;
        const c = getJoystickCenter();
        baseX = c.x; baseY = c.y;
    }, { passive: false });

    joystickZone.addEventListener('touchmove', e => {
        e.preventDefault();
        if (!joystickActive) return;
        let touch = null;
        for (let t of e.changedTouches) {
            if (t.identifier === joystickId) { touch = t; break; }
        }
        if (!touch) return;

        const dx = touch.clientX - baseX;
        const dy = touch.clientY - baseY;
        const dist = Math.min(Math.sqrt(dx*dx + dy*dy), BASE_R);
        const angle = Math.atan2(dy, dx);
        const kx = Math.cos(angle) * dist;
        const ky = Math.sin(angle) * dist;
        knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;

        mobileInput.left  = dx < -DEAD_ZONE;
        mobileInput.right = dx >  DEAD_ZONE;
    }, { passive: false });

    function resetJoystick() {
        joystickActive = false;
        knob.style.transform = 'translate(-50%, -50%)';
        mobileInput.left  = false;
        mobileInput.right = false;
    }

    joystickZone.addEventListener('touchend',    e => { e.preventDefault(); resetJoystick(); }, { passive: false });
    joystickZone.addEventListener('touchcancel', e => { e.preventDefault(); resetJoystick(); }, { passive: false });

    // ============================================
    // BIND DE BOTÃO QUE PRECISA SER SEGURADO
    // (ataque, escudo, ultimate)
    // ============================================

    function bindHoldBtn(id, field) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('touchstart', e => {
            e.preventDefault();
            btn.classList.add('pressed');
            mobileInput[field] = true;
        }, { passive: false });
        btn.addEventListener('touchend', e => {
            e.preventDefault();
            btn.classList.remove('pressed');
            mobileInput[field] = false;
        }, { passive: false });
        btn.addEventListener('touchcancel', e => {
            e.preventDefault();
            btn.classList.remove('pressed');
            mobileInput[field] = false;
        }, { passive: false });
    }

    // ============================================
    // BIND DO BOTÃO PULAR (pulso curto)
    // ============================================

    function bindJumpBtn(id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        let active = false;
        btn.addEventListener('touchstart', e => {
            e.preventDefault();
            btn.classList.add('pressed');
            if (!active) {
                active = true;
                mobileInput.jump = true;
                setTimeout(() => {
                    mobileInput.jump = false;
                    active = false;
                    btn.classList.remove('pressed');
                }, 90);
            }
        }, { passive: false });
        btn.addEventListener('touchend',   e => { e.preventDefault(); }, { passive: false });
        btn.addEventListener('touchcancel',e => { e.preventDefault(); btn.classList.remove('pressed'); }, { passive: false });
    }

    // ============================================
    // MAPEAMENTO DEFINITIVO:
    //
    //  btn-heavy  → attack2 → fighter.attack2() → GOLPE PESADO (F no PC)
    //  btn-attack → attack  → fighter.attack()  → GOLPE LEVE   (R no PC)
    //  btn-shield → shield
    //  btn-ult    → special
    //  btn-jump   → jump (pulso)
    // ============================================

    bindHoldBtn('btn-heavy',  'attack2');   // ATQ PESADO
    bindHoldBtn('btn-attack', 'attack');    // ATQ LEVE
    bindHoldBtn('btn-shield', 'shield');
    bindHoldBtn('btn-ult',    'special');
    bindJumpBtn('btn-jump');
}

// ============================================
// MOSTRAR/ESCONDER PAINEL MOBILE
// ============================================

function showMobileControls(show) {
    if (!isMobile) return;
    const mc = document.getElementById('mobile-controls');
    if (mc) mc.classList.toggle('active', show);
}
