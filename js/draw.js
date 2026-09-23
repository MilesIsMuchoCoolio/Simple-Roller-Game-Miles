/* =====================================================================
   draw.js  --  EVERYTHING YOU CAN SEE.

   Nothing in this file changes the game. It only puts pixels on screen.
   If you want to change how the game LOOKS, this is the only file you
   need. If you want to change how it BEHAVES, this is the wrong file.

   This is a PvZ-inspired lawn defense theme with Crazy Dave energy.
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
  if (furthest < 0) { furthest = 0; }   // level narrower than the screen
  if (Draw.cameraX > furthest) { Draw.cameraX = furthest; }
};

// Draw one whole frame.
Draw.everything = function () {
  var ctx = Draw.ctx;

  // 1. fill the background with a sunny garden lawn color
  ctx.fillStyle = "#d7ef9d";
  ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

  // little sun accent to make it feel more like a PvZ lawn
  ctx.fillStyle = "#ffd765";
  ctx.beginPath();
  ctx.arc(90, 70, 20, 0, Math.PI * 2);
  ctx.fill();

  // 2. shift everything left so the camera looks like it moved right
  ctx.save();
  ctx.translate(-Draw.cameraX, 0);
  Draw.world();
  Crumble.draw();
  Draw.player();
  ctx.restore();
};

// Draw every grid square that is currently on screen.
Draw.world = function () {
  var ctx = Draw.ctx;
  var size = CONFIG.TILE;

  // only look at the columns that are actually visible. much faster.
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

// A solid block: green garden soil tile with a dark outline.
Draw.block = function (x, y, size) {
  var ctx = Draw.ctx;
  ctx.fillStyle = "#b9d86b";
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "#2d5d2d";
  ctx.lineWidth = CONFIG.LINE_WIDTH;
  ctx.strokeRect(x + CONFIG.LINE_WIDTH / 2,
                 y + CONFIG.LINE_WIDTH / 2,
                 size - CONFIG.LINE_WIDTH,
                 size - CONFIG.LINE_WIDTH);
};

// A spike: a dark green zombie hazard triangle.
Draw.spike = function (x, y, size) {
  var ctx = Draw.ctx;
  ctx.fillStyle = "#2d6b3a";
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x + size / 2, y);
  ctx.lineTo(x + size, y + size);
  ctx.closePath();
  ctx.fill();
};

// The finish: a flag pole with a little garden-defense vibe.
Draw.finish = function (x, y, size) {
  var ctx = Draw.ctx;
  ctx.fillStyle = "#2c5d2b";
  ctx.fillRect(x + size / 2 - 2, y, 4, size);

  ctx.fillStyle = "#ffcf4a";
  ctx.beginPath();
  ctx.arc(x + size * 0.72, y + 10, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5dbf4a";
  ctx.beginPath();
  ctx.moveTo(x + size / 2 + 2, y + 4);
  ctx.lineTo(x + size - 4, y + 12);
  ctx.lineTo(x + size / 2 + 2, y + 20);
  ctx.closePath();
  ctx.fill();
};

// The player: a cartoon Crazy Dave-style hero with a blaster.
Draw.player = function () {
  var ctx = Draw.ctx;
  var r = CONFIG.PLAYER_RADIUS;
  var centerX = Player.x + CONFIG.PLAYER_SIZE / 2;
  var centerY = Player.y + CONFIG.PLAYER_SIZE / 2;

  // shadow
  ctx.fillStyle = "rgba(30, 56, 26, 0.18)";
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 18, 18, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // body / shirt
  ctx.fillStyle = "#7ecb58";
  ctx.strokeStyle = "#2f5f2c";
  ctx.lineWidth = CONFIG.LINE_WIDTH;
  ctx.beginPath();
  ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // face
  ctx.fillStyle = "#f5d6a8";
  ctx.beginPath();
  ctx.arc(centerX, centerY - 5, r * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // crazy hair
  ctx.fillStyle = "#f5b433";
  ctx.beginPath();
  ctx.moveTo(centerX - 12, centerY - 20);
  ctx.lineTo(centerX - 2, centerY - 30);
  ctx.lineTo(centerX + 8, centerY - 18);
  ctx.lineTo(centerX + 16, centerY - 29);
  ctx.lineTo(centerX + 20, centerY - 14);
  ctx.lineTo(centerX - 12, centerY - 14);
  ctx.closePath();
  ctx.fill();

  // glasses
  ctx.strokeStyle = "#1f1f1f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.rect(centerX - 15, centerY - 12, 10, 7);
  ctx.rect(centerX + 5, centerY - 12, 10, 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX - 5, centerY - 8);
  ctx.lineTo(centerX + 5, centerY - 8);
  ctx.stroke();

  // smile
  ctx.beginPath();
  ctx.arc(centerX, centerY + 2, 8, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // blaster in hand
  var aimX = centerX + Math.cos(Player.angle) * 22;
  var aimY = centerY + Math.sin(Player.angle) * 22;
  ctx.strokeStyle = "#2d2d2d";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(centerX + 8, centerY + 10);
  ctx.lineTo(aimX, aimY);
  ctx.stroke();

  ctx.fillStyle = "#4a4a4a";
  ctx.fillRect(aimX - 8, aimY - 3, 18, 6);
  ctx.fillStyle = "#d8d8d8";
  ctx.fillRect(aimX + 10, aimY - 1, 8, 2);

  // little goofy visor / face accent
  ctx.fillStyle = "#2b6a3a";
  ctx.fillRect(centerX - 8, centerY + 10, 16, 10);
};


