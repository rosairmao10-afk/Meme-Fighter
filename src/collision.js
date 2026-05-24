function checkAttack(attacker, target) {
  if (attacker.attackBox.active && target.hitTimer <= 0) {
    if (rectsOverlapBoxes(attacker.attackBox, target)) {
      const dmg = attacker.isUsingUltimate ? SPECIAL_DAMAGE : ATTACK_DAMAGE;
      target.takeDamage(dmg);
      attacker.gainEnergy(15);
      spawnHitEffect(target.x + target.width / 2, target.y + target.height / 2, target.color);
    }
  }
  if (attacker.attack2Box.active && target.hitTimer <= 0) {
    if (rectsOverlapBoxes(attacker.attack2Box, target)) {
      target.takeDamage(HEAVY_ATTACK_DAMAGE);
      attacker.gainEnergy(10);
      spawnHitEffect(target.x + target.width / 2, target.y + target.height / 2, "#aaddff");
    }
  }
}

function rectsOverlapBoxes(box, target) {
  return (
    box.x < target.x + target.width &&
    box.x + box.w > target.x &&
    box.y < target.y + target.height &&
    box.y + box.h > target.y
  );
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
