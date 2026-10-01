var Collide = {};

Collide.squaresUnder = function (x, y, w, h) {
  var squares = [];
  var startCol = Math.floor(x / CONFIG.TILE);
  var endCol = Math.floor((x + w - 1) / CONFIG.TILE);
  var startRow = Math.floor(y / CONFIG.TILE);
  var endRow = Math.floor((y + h - 1) / CONFIG.TILE);

  for (var row = startRow; row <= endRow; row++) {
    for (var col = startCol; col <= endCol; col++) {
      if (Level.charAt(col, row) !== ".") {
        squares.push({ col: col, row: row });
      }
    }
  }

  return squares;
};

Collide.hitsSolid = function (x, y, w, h) {
  var squares = Collide.squaresUnder(x, y, w, h);
  for (var i = 0; i < squares.length; i++) {
    if (Level.isSolid(squares[i].col, squares[i].row)) {
      return true;
    }
  }
  return false;
};

Collide.hitsSpike = function (x, y, w, h) {
  var squares = Collide.squaresUnder(x, y, w, h);

  for (var i = 0; i < squares.length; i++) {
    var square = squares[i];
    if (!Level.isSpike(square.col, square.row)) {
      continue;
    }

    var tileX = square.col * CONFIG.TILE;
    var tileY = square.row * CONFIG.TILE;
    // Improved spike hitbox: tighter to the actual spike triangle
    // Spike draws from (x, y+s) to (x+s/2, y) to (x+s, y+s)
    // Hitbox is narrower at top and wider at bottom
    var spikeLeft = tileX + 8;
    var spikeRight = tileX + CONFIG.TILE - 8;
    var spikeTop = tileY + 8;
    var spikeBottom = tileY + CONFIG.TILE;

    if (x < spikeRight && x + w > spikeLeft && y < spikeBottom && y + h > spikeTop) {
      return true;
    }
  }

  return false;
};

Collide.hitsFinish = function (x, y, w, h) {
  var squares = Collide.squaresUnder(x, y, w, h);
  for (var i = 0; i < squares.length; i++) {
    if (Level.isFinish(squares[i].col, squares[i].row)) {
      return true;
    }
  }
  return false;
};
