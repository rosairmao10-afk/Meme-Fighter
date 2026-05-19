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