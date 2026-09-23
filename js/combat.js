/* Enemies, bullets, ammo pickups, and reloading. E and A are level tiles. */
var Combat = {
  enemies: [],
  bullets: [],
  ammo: 0,
  reserve: 0,
  reloadTimer: 0,
  shootWasDown: false
};

Combat.reset = function () {
  Combat.enemies = [];
  Combat.bullets = [];
  Combat.ammo = CONFIG.MAGAZINE_SIZE;
  Combat.reserve = CONFIG.START_RESERVE_AMMO;
  Combat.reloadTimer = 0;
  Combat.shootWasDown = false;

  for (var row = 0; row < CONFIG.ROWS; row++) {
    for (var col = 0; col < Level.cols; col++) {
      var tile = Level.charAt(col, row);
      if (tile === "E") {
        Combat.enemies.push({
          x: col * CONFIG.TILE + 5,
          y: row * CONFIG.TILE + 5,
          direction: -1,
          alive: true
        });
        Combat.setTile(col, row, ".");
      }
    }
  }
};

Combat.setTile = function (col, row, character) {
  var line = Level.grid[row];
  Level.grid[row] = line.substring(0, col) + character + line.substring(col + 1);
};

Combat.update = function () {
  if (Combat.reloadTimer > 0) {
    Combat.reloadTimer -= 1;
    if (Combat.reloadTimer === 0) {
      var needed = CONFIG.MAGAZINE_SIZE - Combat.ammo;
      var loaded = Math.min(needed, Combat.reserve);
      Combat.ammo += loaded;
      Combat.reserve -= loaded;
    }
  } else if (Input.reload && Combat.ammo < CONFIG.MAGAZINE_SIZE && Combat.reserve > 0) {
    Combat.reloadTimer = CONFIG.RELOAD_FRAMES;
  }

  var pressed = Input.shoot && !Combat.shootWasDown;
  if (pressed && Combat.reloadTimer === 0 && Combat.ammo > 0) {
    Combat.ammo -= 1;
    Combat.bullets.push({
      x: Player.x + CONFIG.PLAYER_SIZE,
      y: Player.y + CONFIG.PLAYER_SIZE * 0.45,
      vx: CONFIG.BULLET_SPEED
    });
  }
  Combat.shootWasDown = Input.shoot;

  for (var i = Combat.bullets.length - 1; i >= 0; i--) {
    var bullet = Combat.bullets[i];
    bullet.x += bullet.vx;
    if (Collide.hitsSolid(bullet.x, bullet.y, 8, 4) || bullet.x > Level.pixelWidth()) {
      Combat.bullets.splice(i, 1);
      continue;
    }
    for (var j = Combat.enemies.length - 1; j >= 0; j--) {
      var enemy = Combat.enemies[j];
      if (enemy.alive && Combat.overlaps(bullet.x, bullet.y, 8, 4, enemy.x, enemy.y, CONFIG.ENEMY_SIZE, CONFIG.ENEMY_SIZE)) {
        enemy.alive = false;
        Combat.bullets.splice(i, 1);
        Game.score += 5;
        Game.updateHUD();
        break;
      }
    }
  }

  for (var e = 0; e < Combat.enemies.length; e++) {
    var foe = Combat.enemies[e];
    if (!foe.alive) { continue; }
    var nextX = foe.x + foe.direction * CONFIG.ENEMY_SPEED;
    if (Collide.hitsSolid(nextX, foe.y, CONFIG.ENEMY_SIZE, CONFIG.ENEMY_SIZE) ||
        !Collide.hitsSolid(nextX, foe.y + CONFIG.ENEMY_SIZE + 2, 2, 2)) {
      foe.direction *= -1;
    } else {
      foe.x = nextX;
    }
    if (Combat.overlaps(Player.x, Player.y, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE,
      foe.x, foe.y, CONFIG.ENEMY_SIZE, CONFIG.ENEMY_SIZE)) {
      Player.enemyHit = true;
    }
  }

  Combat.collectAmmo();
  Game.updateHUD();
};

Combat.collectAmmo = function () {
  var squares = Collide.squaresUnder(Player.x, Player.y, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE);
  for (var i = 0; i < squares.length; i++) {
    var square = squares[i];
    if (Level.charAt(square.col, square.row) === "A") {
      Level.removeCoin(square.col, square.row);
      Combat.reserve += 6;
      return;
    }
  }
};

Combat.overlaps = function (ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
};

Combat.draw = function () {
  var ctx = Draw.ctx;
  for (var i = 0; i < Combat.enemies.length; i++) {
    var enemy = Combat.enemies[i];
    if (!enemy.alive) { continue; }
    ctx.strokeStyle = "#b00020";
    ctx.fillStyle = "#ff526f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(enemy.x + 15, enemy.y + 7, 7, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(enemy.x + 15, enemy.y + 14);
    ctx.lineTo(enemy.x + 15, enemy.y + 25);
    ctx.moveTo(enemy.x + 15, enemy.y + 17);
    ctx.lineTo(enemy.x + 5, enemy.y + 22);
    ctx.moveTo(enemy.x + 15, enemy.y + 17);
    ctx.lineTo(enemy.x + 25, enemy.y + 22);
    ctx.moveTo(enemy.x + 15, enemy.y + 25);
    ctx.lineTo(enemy.x + 7, enemy.y + 30);
    ctx.moveTo(enemy.x + 15, enemy.y + 25);
    ctx.lineTo(enemy.x + 23, enemy.y + 30);
    ctx.stroke();
  }
  ctx.fillStyle = "#111111";
  for (var b = 0; b < Combat.bullets.length; b++) {
    ctx.fillRect(Combat.bullets[b].x, Combat.bullets[b].y, 8, 4);
  }
};
