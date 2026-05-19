const CANVAS_WIDTH  = 1280;
const CANVAS_HEIGHT = 720;

const GROUND_Y = 585;

const GRAVITY    = 0.6;
const JUMP_FORCE = -15;

const PLAYER_SPEED = 5;

const MAX_HP     = 200;
const MAX_ENERGY = 100;

const ATTACK_DAMAGE       = 10;
const HEAVY_ATTACK_DAMAGE = 7;
const SPECIAL_DAMAGE      = 35;

const INVINCIBILITY_FRAMES = 40;

// ==============================================
// PERSONAGENS
//
// Para editar os stats de um personagem:
// - velocidade / poder / defesa: valor de 0 a 100
// - dificuldade: valor de 1 a 5 (estrelas)
// ==============================================

const CHARACTERS = [
    {
        name:          'DOGE',
        shortName:     'DOGE',
        color:         '#ffcc33',
        sprite:        'assets/sprites/doge.png',
        attackSprite:  'assets/effects/hit-doge.png',
        specialSprite: 'assets/effects/ult-doge.png',
        specialName:   'Much Wow Bonk',
        displayWidth:  220,
        stats: {
            velocidade:  50,   // ← mude aqui (0-100)
            poder:       85,   // ← mude aqui (0-100)
            defesa:      65,   // ← mude aqui (0-100)
            dificuldade: 2     // ← mude aqui (1-5)
        }
    },
    {
        name:          'NYAN CAT',
        shortName:     'NYAN CAT',
        color:         '#ff99ff',
        sprite:        'assets/sprites/nyan-cat.png',
        attackSprite:  'assets/effects/hit-nyan-cat.png',
        specialSprite: 'assets/effects/ult-nyan-cat.png',
        specialName:   'Rainbow Trail',
        displayWidth:  220,
        stats: {
            velocidade:  100,
            poder:       60,
            defesa:      40,
            dificuldade: 2
        }
    },
    {
        name:          'TROLL FACE',
        shortName:     'TROLL FACE',
        color:         '#aaaaaa',
        sprite:        'assets/sprites/troll-face.png',
        attackSprite:  'assets/effects/hit-troll-face.png',
        specialSprite: 'assets/effects/ult-troll-face.png',
        specialName:   'Problem?',
        displayWidth:  180,
        stats: {
            velocidade:  70,
            poder:       60,
            defesa:      70,
            dificuldade: 3
        }
    },
    {
        name:          'APENAS UM CARA TRANQUILO',
        shortName:     'CARA TRANQUILO',
        color:         '#44dd88',
        sprite:        'assets/sprites/apenas-um-cara-tranquilo.png',
        attackSprite:  'assets/effects/hit-apenas-um-cara-tranquilo.png',
        specialSprite: 'assets/effects/ult-apenas-um-cara-tranquilo.png',
        specialName:   'Cara Tranquila',
        displayWidth:  220,
        stats: {
            velocidade:  50,
            poder:       50,
            defesa:      100,
            dificuldade: 5
        }
    },
    {
        name:          'GEGAGEDIGEDAGEDAGO',
        shortName:     'GEGAGEDI',
        color:         '#ff4444',
        sprite:        'assets/sprites/gegagedigedagedago.png',
        attackSprite:  'assets/effects/hit-gegagedigedagedago.png',
        specialSprite: 'assets/effects/ult-gegagedigedagedago.png',
        specialName:   'Gedagedago!',
        displayWidth:  145,
        stats: {
            velocidade:  40,
            poder:       95,
            defesa:      65,
            dificuldade: 3
        }
    },
    {
        name:          'PERNALONGA COMUNISTA',
        shortName:     'PERNALONGA',
        color:         '#86827d',
        sprite:        'assets/sprites/pernalonga.png',
        attackSprite:  'assets/effects/hit-pernalonga.png',
        specialSprite: 'assets/effects/ult-pernalonga.png',
        specialName:   'NOSSO JOGO!?',
        displayWidth:  250,
        stats: {
            velocidade:  95,
            poder:       60,
            defesa:      500,
            dificuldade: 4
        }
    }
];