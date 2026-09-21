// =====================================================================  
// crumble.js -- blocks that fall away after you stand on them  
// =====================================================================  
  
var Crumble = {  
  blocks: []  
};  
  
// find every "c" in the level and track it as a real block  
Crumble.reset = function () {  
  Crumble.blocks = [];  
  for (var row = 0; row < CONFIG.ROWS; row++) {  
    for (var col = 0; col < Level.cols; col++) {  
      if (Level.charAt(col, row) === "c") {  
        Crumble.blocks.push({ col: col, row: row, state: "solid", timer: 0 });  
        Crumble.setTile(col, row, "#");  
      }  
    }  
  }  
};  
  
// strings can't be changed in place, so rebuild the whole row  
Crumble.setTile = function (col, row, character) {  
  var line = Level.grid[row];  
  Level.grid[row] = line.substring(0, col) + character + line.substring(col + 1);  
};  
  
Crumble.update = function () {  
  var feet = Collide.squaresUnder(Player.x,  
    Player.y + CONFIG.PLAYER_SIZE,  
    CONFIG.PLAYER_SIZE, 2);  
  
  for (var i = 0; i < Crumble.blocks.length; i++) {  
    var block = Crumble.blocks[i];  
  
    if (block.state === "solid") {  
      // trigger: the player landed on us  
      if (Crumble.touching(feet, block)) {  
        block.state = "shaking";  
        block.timer = CONFIG.CRUMBLE_SHAKE_FRAMES;  
      }  
    } else if (block.state === "shaking") {  
      block.timer = block.timer - 1;  
      if (block.timer <= 0) {  
        block.state = "gone";  
        block.timer = CONFIG.CRUMBLE_RESPAWN_FRAMES;  
        Crumble.setTile(block.col, block.row, ".");  
      }  
    } else if (block.state === "gone") {  
      block.timer = block.timer - 1;  
      // never come back inside the player  
      if (block.timer <= 0 && !Crumble.playerIsInside(block)) {  
        block.state = "solid";  
        Crumble.setTile(block.col, block.row, "#");  
      }  
    }  
  }  
};  
  
Crumble.touching = function (squares, block) {  
  for (var i = 0; i < squares.length; i++) {  
    if (squares[i].col === block.col && squares[i].row === block.row) {  
      return true;  
    }  
  }  
  return false;  
};  
  
Crumble.playerIsInside = function (block) {  
  var size = CONFIG.PLAYER_SIZE;  
  var squares = Collide.squaresUnder(Player.x, Player.y, size, size);  
  return Crumble.touching(squares, block);  
};  
  
// a shaking block gets a black dot so the player knows it's about to go  
Crumble.draw = function () {  
  var ctx = Draw.ctx;  
  ctx.fillStyle = "#000000";  
  for (var i = 0; i < Crumble.blocks.length; i++) {  
    var block = Crumble.blocks[i];  
    if (block.state === "shaking") {  
      ctx.beginPath();  
      ctx.arc(block.col * CONFIG.TILE + CONFIG.TILE / 2,  
        block.row * CONFIG.TILE + CONFIG.TILE / 2,  
        5, 0, Math.PI * 2);  
      ctx.fill();  
    }  
  }  
};  
