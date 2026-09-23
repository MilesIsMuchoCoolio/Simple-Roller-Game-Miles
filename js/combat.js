var Combat = {
  enemies: [],
  bullets: [],
  enemyBullets: [],
  ammo: 0,
  reserve: 0,
  reloadTimer: 0,
  shootWasDown: false
};

Combat.reset = function () {
  Combat.enemies = [];
  Combat.bullets = [];
  Combat.enemyBullets = [];
  Combat.ammo = CONFIG.MAGAZINE_SIZE;
  Combat.reserve = CONFIG.START_RESERVE_AMMO;
  Combat.reloadTimer = 0;
  Combat.shootWasDown = false;

  for (var row = 0; row < CONFIG.ROWS; row++) {
    for (var col = 0; col < Level.cols; col++) {
      if (Level.charAt(col, row) === "E") {
        Combat.enemies.push({
          x: col * CONFIG.TILE + 5,
          y: row * CONFIG.TILE + 5,
          direction: -1,
          alive: true,
          shootTimer: 0,
          health: CONFIG.ENEMY_HEALTH,
          vy: 0
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

Combat.aimPoint = function () {
  return { x: Input.mouseX + Draw.cameraX, y: Input.mouseY };
};

Combat.playerHit = function (x, y, w, h) {
  if (Combat.overlaps(Player.x, Player.y, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE, x, y, w, h)) {
    Player.enemyHit = true;
  }
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
    var target = Combat.aimPoint();
    var startX = Player.x + CONFIG.PLAYER_SIZE / 2;
    var startY = Player.y + CONFIG.PLAYER_SIZE / 2;
    var dx = target.x - startX;
    var dy = target.y - startY;
    var length = Math.sqrt(dx * dx + dy * dy) || 1;
    Combat.bullets.push({
      x: startX,
      y: startY,
      vx: dx / length * CONFIG.BULLET_SPEED,
      vy: dy / length * CONFIG.BULLET_SPEED
    });
    Combat.ammo -= 1;
  }
  Combat.shootWasDown = Input.shoot;

  for (var i = Combat.bullets.length - 1; i >= 0; i--) {
    var bullet = Combat.bullets[i];
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;

    if (Collide.hitsSolid(bullet.x, bullet.y, 8, 4) ||
        bullet.x < 0 || bullet.x > Level.pixelWidth() ||
        bullet.y < 0 || bullet.y > CONFIG.CANVAS_H) {
      Combat.bullets.splice(i, 1);
      continue;
    }

    for (var j = Combat.enemies.length - 1; j >= 0; j--) {
      var enemy = Combat.enemies[j];
      if (enemy.alive && Combat.overlaps(bullet.x, bullet.y, 8, 4, enemy.x, enemy.y, CONFIG.ENEMY_SIZE, CONFIG.ENEMY_SIZE)) {
        enemy.health -= 1;
        Combat.bullets.splice(i, 1);
        if (enemy.health <= 0) {
          enemy.alive = false;
          Game.score += 5;
        }
        break;
      }
    }
  }

  for (var e = 0; e < Combat.enemies.length; e++) {
    var foe = Combat.enemies[e];
    if (!foe.alive) { continue; }

    foe.shootTimer = Math.max(0, foe.shootTimer - 1);

    if (Math.abs(Player.x - foe.x) < 420 && Math.abs(Player.y - foe.y) < 220 && foe.shootTimer === 0) {
      var aimX = Player.x + CONFIG.PLAYER_SIZE / 2 - (foe.x + CONFIG.ENEMY_SIZE / 2);
      var aimY = Player.y + CONFIG.PLAYER_SIZE / 2 - (foe.y + CONFIG.ENEMY_SIZE / 2);
      var enemyLength = Math.sqrt(aimX * aimX + aimY * aimY) || 1;

      var spreadX = (Math.random() - 0.5) * 40;
      var spreadY = (Math.random() - 0.5) * 40;

      Combat.enemyBullets.push({
        x: foe.x + CONFIG.ENEMY_SIZE / 2,
        y: foe.y + CONFIG.ENEMY_SIZE / 2,
        vx: ((aimX + spreadX) / enemyLength) * CONFIG.ENEMY_BULLET_SPEED,
        vy: ((aimY + spreadY) / enemyLength) * CONFIG.ENEMY_BULLET_SPEED
      });
      foe.shootTimer = CONFIG.ENEMY_SHOOT_COOLDOWN;
    }

    foe.vy = Math.min(CONFIG.MAX_FALL, foe.vy + CONFIG.GRAVITY);
    var stepY = foe.vy > 0 ? 1 : -1;
    for (var py = 0; py < Math.abs(foe.vy); py++) {
      if (Collide.hitsSolid(foe.x, foe.y + stepY, CONFIG.ENEMY_SIZE, CONFIG.ENEMY_SIZE)) {
        foe.vy = 0;
        break;
      }
      foe.y += stepY;
    }

    var moveDir = Player.x > foe.x ? 1 : -1;
    var nextX = foe.x + moveDir * CONFIG.ENEMY_SPEED;
    if (!Collide.hitsSolid(nextX, foe.y, CONFIG.ENEMY_SIZE, CONFIG.ENEMY_SIZE)) {
      foe.x = nextX;
    }

    if (Combat.overlaps(Player.x, Player.y, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE,
        foe.x, foe.y, CONFIG.ENEMY_SIZE, CONFIG.ENEMY_SIZE)) {
      Player.enemyHit = true;
    }
  }

  for (var k = Combat.enemyBullets.length - 1; k >= 0; k--) {
    var enemyBullet = Combat.enemyBullets[k];
    enemyBullet.x += enemyBullet.vx;
    enemyBullet.y += enemyBullet.vy;

    if (enemyBullet.x < 0 || enemyBullet.x > Level.pixelWidth() ||
        enemyBullet.y < 0 || enemyBullet.y > CONFIG.CANVAS_H ||
        Collide.hitsSolid(enemyBullet.x, enemyBullet.y, 6, 6)) {
      Combat.enemyBullets.splice(k, 1);
      continue;
    }

    if (Combat.overlaps(enemyBullet.x, enemyBullet.y, 6, 6,
        Player.x, Player.y, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE)) {
      Player.enemyHit = true;
      Combat.enemyBullets.splice(k, 1);
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
      Combat.reserve += CONFIG.MAGAZINE_SIZE;
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
    ctx.fill();
    ctx.stroke();
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

    ctx.fillStyle = "#222";
    ctx.fillRect(enemy.x, enemy.y - 8, 30, 4);
    ctx.fillStyle = "#e22";
    ctx.fillRect(enemy.x, enemy.y - 8, 30 * enemy.health / CONFIG.ENEMY_HEALTH, 4);
  }

  ctx.fillStyle = "#111111";
  for (var b = 0; b < Combat.bullets.length; b++) {
    ctx.fillRect(Combat.bullets[b].x, Combat.bullets[b].y, 8, 4);
  }

  ctx.fillStyle = "#0d3b66";
  for (var n = 0; n < Combat.enemyBullets.length; n++) {
    ctx.fillRect(Combat.enemyBullets[n].x, Combat.enemyBullets[n].y, 7, 5);
  }
};
