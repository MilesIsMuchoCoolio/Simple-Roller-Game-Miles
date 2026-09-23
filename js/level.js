var Level = {
  pieces: null, levels: null, grid: [], cols: 0, name: "", startX: 0, startY: 0, totalCoins: 0
};

Level.setStatus = function (text) {
  var status = document.getElementById("status");
  if (status) status.textContent = text;
};

Level.loadData = function (done) {
  Level.setStatus("Loading pieces...");
  fetch("data/pieces.json", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("pieces.json returned HTTP " + response.status);
      return response.json();
    })
    .then(function (pieces) {
      Level.pieces = pieces;
      Level.setStatus("Loading levels...");
      return fetch("data/levels.json", { cache: "no-store" });
    })
    .then(function (response) {
      if (!response.ok) throw new Error("levels.json returned HTTP " + response.status);
      return response.json();
    })
    .then(function (file) {
      if (!file.levels || !file.levels.length) throw new Error("levels.json contains no levels");
      Level.levels = file.levels;
      Level.setStatus("Level data loaded.");
      done();
    })
    .catch(function (error) {
      Level.setStatus("Game failed: data could not load");
      var message = document.getElementById("message");
      if (message) message.textContent = "Loading error: " + error.message;
      console.error("Level loading failed:", error);
    });
};

Level.build = function (number) {
  var level = Level.levels[number];
  if (!level) throw new Error("Level " + number + " does not exist");
  Level.name = level.name;
  Level.grid = [];
  Level.cols = level.pieces.length * CONFIG.PIECE_COLS;
  for (var row = 0; row < CONFIG.ROWS; row++) Level.grid.push("");

  for (var p = 0; p < level.pieces.length; p++) {
    var pieceName = level.pieces[p];
    var piece = Level.pieces[pieceName] || Level.pieces.flat;
    if (!piece || piece.length !== CONFIG.ROWS) throw new Error("Invalid piece: " + pieceName);
    for (var r = 0; r < CONFIG.ROWS; r++) {
      if (typeof piece[r] !== "string" || piece[r].length !== CONFIG.PIECE_COLS) {
        throw new Error("Piece " + pieceName + " must have 8-character rows");
      }
      Level.grid[r] += piece[r];
    }
  }
  Level.findStart();
  Level.countCoins();
};

Level.findStart = function () {
  for (var row = 0; row < CONFIG.ROWS; row++) {
    for (var col = 0; col < Level.cols; col++) {
      if (Level.charAt(col, row) === "S") {
        Level.startX = col * CONFIG.TILE;
        Level.startY = row * CONFIG.TILE;
        return;
      }
    }
  }
  Level.startX = 0;
  Level.startY = 0;
};

Level.countCoins = function () {
  Level.totalCoins = 0;
  for (var row = 0; row < CONFIG.ROWS; row++) {
    for (var col = 0; col < Level.cols; col++) {
      if (Level.charAt(col, row) === "C") Level.totalCoins++;
    }
  }
};

Level.removeCoin = function (col, row) {
  var line = Level.grid[row];
  Level.grid[row] = line.slice(0, col) + "." + line.slice(col + 1);
};
Level.charAt = function (col, row) {
  if (row < 0 || row >= CONFIG.ROWS || col < 0 || col >= Level.cols) return ".";
  return Level.grid[row].charAt(col);
};
Level.isSolid = function (col, row) { return Level.charAt(col, row) === "#"; };
Level.isSpike = function (col, row) { return Level.charAt(col, row) === "^"; };
Level.isCoin = function (col, row) { return Level.charAt(col, row) === "C"; };
Level.isFinish = function (col, row) { return Level.charAt(col, row) === "F"; };
Level.pixelWidth = function () { return Level.cols * CONFIG.TILE; };
