// ======================
// CHECAGEM DE ATAQUE (golpe rápido + golpe pesado)
// ======================

function checkAttack(attacker, target) {
  // --- golpe rápido / ultimate ---
  if (attacker.attackBox.active && target.hitTimer <= 0) {
    if (rectsOverlapBoxes(attacker.attackBox, target)) {
      const dmg = attacker.isUsingUltimate ? SPECIAL_DAMAGE : ATTACK_DAMAGE;

      target.takeDamage(dmg);
      attacker.gainEnergy(15);

      spawnHitEffect(
        target.x + target.width / 2,
        target.y + target.height / 2,
        target.color,
      );
    }
  }

  // --- golpe pesado ---
  if (attacker.attack2Box.active && target.hitTimer <= 0) {
    if (rectsOverlapBoxes(attacker.attack2Box, target)) {
      target.takeDamage(HEAVY_ATTACK_DAMAGE);
      attacker.gainEnergy(10);

      spawnHitEffect(
        target.x + target.width / 2,
        target.y + target.height / 2,
        "#aaddff", // cor azulada para diferenciar o golpe pesado
      );
    }
  }
}

// ======================
// OVERLAP — attackBox vs fighter (target)
// ======================

function rectsOverlapBoxes(box, target) {
  return (
    box.x < target.x + target.width &&
    box.x + box.w > target.x &&
    box.y < target.y + target.height &&
    box.y + box.h > target.y
  );
}

// ======================
// OVERLAP GENÉRICO (utilitário)
// ======================

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
