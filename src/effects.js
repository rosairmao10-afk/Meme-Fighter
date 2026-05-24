let particles    = [];
let ultimateRings = [];
let screenFlash  = 0;
let shakeTimer   = 0;

class Particle {
    constructor(x, y, color) {
        this.x=x; this.y=y;
        this.velX=(Math.random()-0.5)*12; this.velY=(Math.random()-0.5)*12;
        this.life=1; this.size=Math.random()*8+4; this.color=color;
    }
    update() { this.x+=this.velX; this.y+=this.velY; this.velY+=0.2; this.life-=0.03; }
    draw(ctx) {
        ctx.save(); ctx.globalAlpha=Math.max(0,this.life); ctx.fillStyle=this.color;
        ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
}

class UltimateRing {
    constructor(x,y,color,delay) {
        this.x=x; this.y=y; this.color=color; this.radius=10; this.maxRadius=320;
        this.speed=14; this.life=1; this.lineWidth=10; this.delay=delay||0;
    }
    update() {
        if(this.delay>0){this.delay--;return;}
        this.radius+=this.speed;
        this.life=Math.max(0,1-this.radius/this.maxRadius);
        this.lineWidth=10*this.life;
    }
    draw(ctx) {
        if(this.delay>0||this.radius<=0)return;
        ctx.save(); ctx.globalAlpha=this.life; ctx.strokeStyle=this.color;
        ctx.lineWidth=this.lineWidth; ctx.shadowBlur=20; ctx.shadowColor=this.color;
        ctx.beginPath(); ctx.arc(this.x,this.y,this.radius,0,Math.PI*2); ctx.stroke(); ctx.restore();
    }
}

function spawnHitEffect(x,y,color){
    for(let i=0;i<20;i++) particles.push(new Particle(x,y,color));
}

function spawnUltimateEffect(x,y,color){
    const baseColor=color||'#ffcc00';
    ultimateRings.push(new UltimateRing(x,y,'#ffffff',0));
    ultimateRings.push(new UltimateRing(x,y,'#ffcc00',5));
    ultimateRings.push(new UltimateRing(x,y,baseColor,10));
    screenFlash=1.0;
    const colors=['#ffffff','#ffcc00','#ff6600',baseColor];
    for(let i=0;i<80;i++){
        const c=colors[Math.floor(Math.random()*colors.length)];
        const p=new Particle(x,y,c);
        p.velX*=1.6; p.velY*=1.6; p.size=Math.random()*12+4; p.life=1.2;
        particles.push(p);
    }
}

function updateParticles(){
    particles=particles.filter(p=>p.life>0);
    ultimateRings=ultimateRings.filter(r=>r.life>0||r.delay>0);
    particles.forEach(p=>p.update());
    ultimateRings.forEach(r=>r.update());
    if(screenFlash>0) screenFlash-=0.06;
}

function drawScreenFlash(ctx){
    if(screenFlash<=0)return;
    ctx.save(); ctx.globalAlpha=Math.max(0,screenFlash);
    ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT); ctx.restore();
}

function drawUltimateRings(ctx){ ultimateRings.forEach(r=>r.draw(ctx)); }
