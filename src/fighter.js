const shieldImage = new Image();
shieldImage.src   = 'assets/backgrounds/escudo.gif';

class Fighter {

    constructor(x, y, character, controls) {

        this.x = x;
        this.y = y;

        this.width  = 120;
        this.height = 120;

        this.velX = 0;
        this.velY = 0;

        this.hp     = MAX_HP;
        this.energy = 0;

        this.name     = character.shortName || character.name;
        this.color    = character.color;
        this.controls = controls;

        this.image           = new Image();
        this.image.src       = character.sprite;

        this.attackImage     = new Image();
        this.attackImage.src = character.attackSprite;

        this.specialImage     = new Image();
        this.specialImage.src = character.specialSprite || character.attackSprite;

        this.image.onload = () => {
            this.aspectRatio = this.image.width / this.image.height;
            this.width       = character.displayWidth || 220;
            this.height      = this.width / this.aspectRatio;
        };

        this.image.onerror = () => {
            console.warn('ERRO AO CARREGAR:', this.image.src);
        };

        this.attackBox = { x: 0, y: 0, w: 170, h: 170, active: false };
        this.attack2Box = { x: 0, y: 0, w: 280, h: 155, active: false };

        this.hitTimer = 0;

        this.jumpKeyHeld    = false;
        this.attackKeyHeld  = false;
        this.attack2KeyHeld = false;

        this.attackCooldown  = 0;
        this.attack2Cooldown = 0;

        this.isShielding     = false;

        this.state           = 'idle';
        this.isUsingUltimate = false;
        this.ultimateAge     = 0;
        this.facing          = 1;
    }

    get isAttacking() {
        return this.attackBox.active || this.attack2Box.active || this.isUsingUltimate;
    }

    update() {

        this.velX = 0;

        if (keys[this.controls.left])  { this.velX = -PLAYER_SPEED; this.facing = -1; }
        if (keys[this.controls.right]) { this.velX =  PLAYER_SPEED; this.facing =  1; }

        this.x += this.velX;

        if (this.x < 0)                         this.x = 0;
        if (this.x + this.width > CANVAS_WIDTH)  this.x = CANVAS_WIDTH - this.width;

        this.velY += GRAVITY;
        this.y    += this.velY;

        if (this.y + this.height >= GROUND_Y) {
            this.y    = GROUND_Y - this.height;
            this.velY = 0;
        }

        const jumpKeyDown = keys[this.controls.jump];
        if (jumpKeyDown && !this.jumpKeyHeld && this.velY === 0) {
            this.velY        = JUMP_FORCE;
            this.jumpKeyHeld = true;
        }
        if (!jumpKeyDown) this.jumpKeyHeld = false;

        if (this.attackCooldown  > 0) this.attackCooldown--;
        if (this.attack2Cooldown > 0) this.attack2Cooldown--;

        // escudo ativo enquanto tecla segurada e não estiver atacando
        this.isShielding = !!(keys[this.controls.shield]) && !this.isAttacking;

        const attackKeyDown = keys[this.controls.attack];
        if (attackKeyDown && !this.attackKeyHeld && this.attackCooldown === 0 && !this.isAttacking && !this.isShielding) {
            this.attack();
            this.attackKeyHeld = true;
        }
        if (!attackKeyDown) this.attackKeyHeld = false;

        const attack2KeyDown = keys[this.controls.attack2];
        if (attack2KeyDown && !this.attack2KeyHeld && this.attack2Cooldown === 0 && !this.isAttacking && !this.isShielding) {
            this.attack2();
            this.attack2KeyHeld = true;
        }
        if (!attack2KeyDown) this.attack2KeyHeld = false;

        if (keys[this.controls.special] && this.energy >= MAX_ENERGY && !this.isShielding) {
            this.useUltimate();
        }

        this.attackBox.x = this.facing === 1
            ? this.x + this.width  - 20
            : this.x - this.attackBox.w + 20;
        this.attackBox.y = this.y + this.height - 120;

        this.attack2Box.x = this.facing === 1
            ? this.x + this.width  - 30
            : this.x - this.attack2Box.w + 30;
        this.attack2Box.y = this.y + this.height - 110;

        if (this.hitTimer > 0) this.hitTimer--;
        if (this.isUsingUltimate) this.ultimateAge++;
    }

    draw(ctx) {

        ctx.save();
        if (this.hitTimer > 0 && Math.floor(this.hitTimer / 4) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        if (this.image.complete && this.image.naturalWidth > 0) {
            if (this.facing === -1) {
                ctx.scale(-1, 1);
                ctx.drawImage(this.image, -this.x - this.width, this.y, this.width, this.height);
            } else {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        ctx.restore();

        // golpe rápido
        if (this.attackBox.active && !this.isUsingUltimate) {
            ctx.save();
            if (this.facing === -1) {
                ctx.scale(-1, 1);
                ctx.drawImage(this.attackImage, -this.attackBox.x - this.attackBox.w, this.attackBox.y, this.attackBox.w, this.attackBox.h);
            } else {
                ctx.drawImage(this.attackImage, this.attackBox.x, this.attackBox.y, this.attackBox.w, this.attackBox.h);
            }
            ctx.restore();
        }

        // golpe pesado
        if (this.attack2Box.active) {
            ctx.save();
            ctx.globalAlpha = 0.85;
            ctx.filter      = 'hue-rotate(180deg) brightness(1.3)';
            if (this.facing === -1) {
                ctx.scale(-1, 1);
                ctx.drawImage(this.attackImage, -this.attack2Box.x - this.attack2Box.w, this.attack2Box.y, this.attack2Box.w, this.attack2Box.h);
            } else {
                ctx.drawImage(this.attackImage, this.attack2Box.x, this.attack2Box.y, this.attack2Box.w, this.attack2Box.h);
            }
            ctx.restore();
        }

        // ultimate
        if (this.attackBox.active && this.isUsingUltimate) {
            const progress = Math.min(1, this.ultimateAge / 15);
            const pulse    = 1 + Math.sin(this.ultimateAge * 0.4) * 0.08;
            const scale    = progress * pulse;
            const bw = this.attackBox.w * scale;
            const bh = this.attackBox.h * scale;
            const ox = (bw - this.attackBox.w) / 2;
            const oy = (bh - this.attackBox.h) / 2;

            ctx.save();
            ctx.globalAlpha = Math.min(1, progress * 1.5);
            ctx.shadowBlur  = 30;
            ctx.shadowColor = '#ffcc00';
            if (this.facing === -1) {
                ctx.scale(-1, 1);
                ctx.drawImage(this.specialImage, -(this.attackBox.x + ox) - bw, this.attackBox.y - oy, bw, bh);
            } else {
                ctx.drawImage(this.specialImage, this.attackBox.x - ox, this.attackBox.y - oy, bw, bh);
            }
            ctx.restore();
        }

        // escudo (bolha)
        if (this.isShielding && shieldImage.complete && shieldImage.naturalWidth > 0) {
            const shieldSize = Math.max(this.width, this.height) * 1.3;
            const sx = this.x + this.width  / 2 - shieldSize / 2;
            const sy = this.y + this.height / 2 - shieldSize / 2;

            ctx.save();
            ctx.globalAlpha = 0.55;
            ctx.drawImage(shieldImage, sx, sy, shieldSize, shieldSize);
            ctx.restore();
        }
    }

    attack() {
        if (this.isAttacking) return;
        this.attackBox.active = true;
        this.attackCooldown   = 30;
        setTimeout(() => { this.attackBox.active = false; }, 200);
    }

    attack2() {
        if (this.isAttacking) return;
        this.attack2Box.active = true;
        this.attack2Cooldown   = 50;
        setTimeout(() => { this.attack2Box.active = false; }, 400);
    }

    useUltimate() {
        if (this.isAttacking) return;

        this.isUsingUltimate  = true;
        this.ultimateAge      = 0;
        this.state            = 'special';
        this.energy           = 0;

        this.attackBox.active = true;
        this.attackBox.w      = 320;
        this.attackBox.h      = 220;

        this.attackBox.x = this.facing === 1
            ? this.x + this.width  - 30
            : this.x - this.attackBox.w + 30;
        this.attackBox.y = this.y + this.height - 180;

        shakeTimer = 30;
        spawnUltimateEffect(this.x + this.width / 2, this.y + this.height / 2, this.color);

        setTimeout(() => {
            this.attackBox.active = false;
            this.attackBox.w      = 170;
            this.attackBox.h      = 170;
            this.state            = 'idle';
            this.isUsingUltimate  = false;
        }, 500);
    }

    // ======================
    // DANO — com dreno de energia ao bloquear
    // ======================

    takeDamage(dmg) {

        let danoFinal = dmg;

        if (this.isShielding) {
            // escudo absorve 70% — só 30% passa
            danoFinal = Math.max(1, Math.ceil(dmg * 0.30));

            // ← NOVO: bloquear custa 5% da energia máxima por golpe
            this.energy = Math.max(0, this.energy - MAX_ENERGY * 0.05);
        }

        this.hp       = Math.max(0, this.hp - danoFinal);
        this.hitTimer = INVINCIBILITY_FRAMES;
    }

    gainEnergy(amount) {
        this.energy = Math.min(MAX_ENERGY, this.energy + amount);
    }
}

