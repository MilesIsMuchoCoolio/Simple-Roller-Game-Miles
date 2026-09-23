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
    var spikeLeft = tileX + 5;
    var spikeRight = tileX + CONFIG.TILE - 5;
    var spikeTop = tileY + 12;
    var spikeBottom = tileY + CONFIG.TILE - 2;

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
