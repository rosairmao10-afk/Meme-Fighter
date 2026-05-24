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
    attack:  'KeyR',
    attack2: 'KeyF',
    special: 'KeyG',
    shield:  'KeyE'
};

const PLAYER2_KEYS = {
    left:    'ArrowLeft',
    right:   'ArrowRight',
    jump:    'ArrowUp',
    attack:  'KeyP',
    attack2: 'KeyL',
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
    attack:  false,
    attack2: false,
    special: false,
    shield:  false
};

// Chaves virtuais que mapeiam para PLAYER1_KEYS no mobile
const MOBILE_KEYS = {
    left:    'MobileLeft',
    right:   'MobileRight',
    jump:    'MobileJump',
    attack:  'MobileAttack',
    attack2: 'MobileHeavy',
    special: 'MobileUlt',
    shield:  'MobileShield'
};

// Injetar estado mobile no sistema de keys
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
// JOYSTICK VIRTUAL
// ============================================

function initMobileControls() {
    if (!isMobile) return;

    const joystickZone = document.getElementById('joystick-zone');
    const knob         = document.getElementById('joystick-knob');
    const BASE_R       = 70; // raio da base
    const DEAD_ZONE    = 12; // pixels mínimos para ativar direção

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

        // Posicionar knob
        const kx = Math.cos(angle) * dist;
        const ky = Math.sin(angle) * dist;
        knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;

        // Ativar direções
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
    // BOTÃO DE PULO
    // ============================================

    const btnJump = document.getElementById('btn-jump');
    let jumpActive = false;

    btnJump.addEventListener('touchstart', e => {
        e.preventDefault();
        if (!jumpActive) {
            jumpActive = true;
            mobileInput.jump = true;
            // Libera o jump no próximo frame para simular keydown
            setTimeout(() => {
                mobileInput.jump = false;
                jumpActive = false;
            }, 80);
        }
    }, { passive: false });

    // ============================================
    // BOTÕES DE AÇÃO
    // ============================================

    function bindActionBtn(id, field) {
        const btn = document.getElementById(id);
        if (!btn) return;

        btn.addEventListener('touchstart', e => {
            e.preventDefault();
            mobileInput[field] = true;
        }, { passive: false });

        btn.addEventListener('touchend', e => {
            e.preventDefault();
            mobileInput[field] = false;
        }, { passive: false });

        btn.addEventListener('touchcancel', e => {
            e.preventDefault();
            mobileInput[field] = false;
        }, { passive: false });
    }

    bindActionBtn('btn-attack', 'attack');
    bindActionBtn('btn-heavy',  'attack2');
    bindActionBtn('btn-shield', 'shield');
    bindActionBtn('btn-ult',    'special');
}

// ============================================
// MOSTRAR/ESCONDER CONTROLES MOBILE NA LUTA
// ============================================

function showMobileControls(show) {
    if (!isMobile) return;
    const mc = document.getElementById('mobile-controls');
    if (mc) mc.classList.toggle('active', show);
}
