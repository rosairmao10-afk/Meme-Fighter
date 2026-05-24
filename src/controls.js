const keys = {};

window.addEventListener('keydown', e => {
    keys[e.code] = true;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', e => {
    keys[e.code] = false;
});

// PLAYER 1
const PLAYER1_KEYS = {
    left:    'KeyA',
    right:   'KeyD',
    jump:    'KeyW',
    attack:  'KeyF',
    attack2: 'KeyR',
    special: 'KeyG',
    dodge:   'KeyS',
    shield:  'KeyE'    // ← escudo P1
};

// PLAYER 2
const PLAYER2_KEYS = {
    left:    'ArrowLeft',
    right:   'ArrowRight',
    jump:    'ArrowUp',
    attack:  'KeyL',
    attack2: 'KeyP',
    special: 'KeyK',
    dodge:   'ArrowDown',
    shield:  'KeyO'    // ← escudo P2
};

// ======================
// MOBILE TOUCH
// ======================

if (IS_MOBILE) {

    window.addEventListener('touchstart', e => {

        for (const touch of e.touches) {

            const x = touch.clientX;
            const y = touch.clientY;

            // lado esquerdo = analógico
            if (x < window.innerWidth * 0.45) {

                MOBILE_UI.joystick.active = true;
                MOBILE_UI.joystick.startX = x;
                MOBILE_UI.joystick.startY = y;
            }

            // botões
            else {

                if (y > window.innerHeight * 0.65) {

                    if (x > window.innerWidth * 0.82) {
                        MOBILE_UI.buttons.attack = true;
                    }

                    else if (x > window.innerWidth * 0.70) {
                        MOBILE_UI.buttons.attack2 = true;
                    }

                    else if (x > window.innerWidth * 0.58) {
                        MOBILE_UI.buttons.jump = true;
                    }
                }

                if (y < window.innerHeight * 0.65) {

                    if (x > window.innerWidth * 0.82) {
                        MOBILE_UI.buttons.special = true;
                    }

                    else if (x > window.innerWidth * 0.70) {
                        MOBILE_UI.buttons.shield = true;
                    }
                }
            }
        }
    });

    window.addEventListener('touchmove', e => {

        const touch = e.touches[0];

        if (!touch) return;

        MOBILE_UI.joystick.dx =
            touch.clientX - MOBILE_UI.joystick.startX;

        MOBILE_UI.joystick.dy =
            touch.clientY - MOBILE_UI.joystick.startY;
    });

    window.addEventListener('touchend', () => {

        MOBILE_UI.joystick.active = false;

        MOBILE_UI.joystick.dx = 0;
        MOBILE_UI.joystick.dy = 0;

        MOBILE_UI.buttons.jump     = false;
        MOBILE_UI.buttons.attack   = false;
        MOBILE_UI.buttons.attack2  = false;
        MOBILE_UI.buttons.special  = false;
        MOBILE_UI.buttons.shield   = false;
    });
}
