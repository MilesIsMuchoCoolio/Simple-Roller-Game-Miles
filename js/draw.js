/* =====================================================================
   draw.js  --  EVERYTHING YOU CAN SEE.

   Nothing in this file changes the game. It only puts pixels on screen.
   If you want to change how the game LOOKS, this is the only file you
   need. If you want to change how it BEHAVES, this is the wrong file.

   This is a bright, PvZ-inspired lawn-defense theme with Crazy Dave vibes.
   ===================================================================== */

var Draw = {
  canvas: null,
  ctx: null,
  cameraX: 0     // how far the view has scrolled to the right
};

Draw.setup = function () {
  Draw.canvas = document.getElementById("game");
  Draw.ctx = Draw.canvas.getContext("2d");
};

// Follow the player, but never scroll past the ends of the level.
Draw.updateCamera = function () {
  Draw.cameraX = Player.x - CONFIG.CANVAS_W / 2;
  if (Draw.cameraX < 0) { Draw.cameraX = 0; }

  var furthest = Level.pixelWidth() - CONFIG.CANVAS_W;
  if (furthest < 0) { furthest = 0; }
  if (Draw.cameraX > furthest) { Draw.cameraX = furthest; }
};

Draw.everything = function () {
  var ctx = Draw.ctx;

  ctx.fillStyle = "#dff7a6";
  ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

  // sunny lawn background accents
  ctx.fillStyle = "#ffd861";
  ctx.beginPath();
  ctx.arc(90, 70, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(0, 0, CONFIG.CANVAS_W, 12);

  ctx.save();
  ctx.translate(-Draw.cameraX, 0);
  Draw.world();
  Crumble.draw();
  Draw.player();
  ctx.restore();
};

Draw.world = function () {
  var ctx = Draw.ctx;
  var size = CONFIG.TILE;

  var firstCol = Math.floor(Draw.cameraX / size) - 1;
  var lastCol  = firstCol + Math.ceil(CONFIG.CANVAS_W / size) + 2;

  for (var row = 0; row < CONFIG.ROWS; row++) {
    for (var col = firstCol; col <= lastCol; col++) {
      var here = Level.charAt(col, row);
      var x = col * size;
      var y = row * size;

      if (here === "#") { Draw.block(x, y, size); }
      if (here === "^") { Draw.spike(x, y, size); }
      if (here === "F") { Draw.finish(x, y, size); }
    }
  }
};

// Brighter green garden blocks to fit the PvZ palette.
Draw.block = function (x, y, size) {
  var ctx = Draw.ctx;
  ctx.fillStyle = "#8fe15a";
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "#2d6a3b";
  ctx.lineWidth = CONFIG.LINE_WIDTH;
  ctx.strokeRect(x + CONFIG.LINE_WIDTH / 2,
                 y + CONFIG.LINE_WIDTH / 2,
                 size - CONFIG.LINE_WIDTH,
                 size - CONFIG.LINE_WIDTH);
};

// Zombie-like hazard tiles: more obvious and menacing.
Draw.spike = function (x, y, size) {
  var ctx = Draw.ctx;
  ctx.fillStyle = "#5a9c3e";
  ctx.fillRect(x, y + size * 0.35, size, size * 0.65);

  ctx.fillStyle = "#2f6e39";
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x + size / 2, y + 2);
  ctx.lineTo(x + size, y + size);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#d0f3a3";
  ctx.fillRect(x + 2, y + size * 0.55, size - 4, 4);
};

Draw.finish = function (x, y, size) {
  var ctx = Draw.ctx;
  ctx.fillStyle = "#234d2d";
  ctx.fillRect(x + size / 2 - 3, y, 6, size);

  ctx.fillStyle = "#ffce44";
  ctx.beginPath();
  ctx.moveTo(x + size / 2 + 3, y + 4);
  ctx.lineTo(x + size - 5, y + 14);
  ctx.lineTo(x + size / 2 + 3, y + 24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#69d158";
  ctx.beginPath();
  ctx.moveTo(x + size / 2 + 3, y + 4);
  ctx.lineTo(x + size - 7, y + 14);
  ctx.lineTo(x + size / 2 + 3, y + 24);
  ctx.closePath();
  ctx.fill();
};

Draw.player = function () {
  var ctx = Draw.ctx;
  var r = CONFIG.PLAYER_RADIUS;
  var centerX = Player.x + CONFIG.PLAYER_SIZE / 2;
  var centerY = Player.y + CONFIG.PLAYER_SIZE / 2;

  // shadow
  ctx.fillStyle = "rgba(30, 56, 26, 0.18)";
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 20, 18, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.fillStyle = "#f8d7a0";
  ctx.beginPath();
  ctx.arc(centerX, centerY - 6, r * 0.78, 0, Math.PI * 2);
  ctx.fill();

  // body / shirt
  ctx.fillStyle = "#8edb5a";
  ctx.strokeStyle = "#234d2d";
  ctx.lineWidth = CONFIG.LINE_WIDTH + 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY + 6, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Crazy Dave hair
  ctx.fillStyle = "#f5b538";
  ctx.beginPath();
  ctx.moveTo(centerX - 18, centerY - 18);
  ctx.lineTo(centerX - 6, centerY - 34);
  ctx.lineTo(centerX + 4, centerY - 16);
  ctx.lineTo(centerX + 16, centerY - 32);
  ctx.lineTo(centerX + 22, centerY - 17);
  ctx.lineTo(centerX - 18, centerY - 17);
  ctx.closePath();
  ctx.fill();

  // glasses
  ctx.strokeStyle = "#1b1b1b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.rect(centerX - 18, centerY - 12, 12, 8);
  ctx.rect(centerX + 6, centerY - 12, 12, 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX - 6, centerY - 8);
  ctx.lineTo(centerX + 6, centerY - 8);
  ctx.stroke();

  // smile
  ctx.beginPath();
  ctx.arc(centerX, centerY + 2, 8, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // weapon / blaster silhouette
  var aimX = centerX + Math.cos(Player.angle) * 26;
  var aimY = centerY + Math.sin(Player.angle) * 26;
  ctx.strokeStyle = "#2d2d2d";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(centerX + 8, centerY + 10);
  ctx.lineTo(aimX, aimY);
  ctx.stroke();

  ctx.fillStyle = "#474747";
  ctx.fillRect(aimX - 12, aimY - 4, 20, 8);
  ctx.fillStyle = "#d8d8d8";
  ctx.fillRect(aimX + 8, aimY - 2, 10, 4);

  // chest stripe / plant badge
  ctx.fillStyle = "#2a6f3b";
  ctx.fillRect(centerX - 14, centerY + 1, 28, 7);
};
