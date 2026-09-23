var Game = { mode: "playing", levelNumber: 0, score: 0 };

Game.startLevel = function (levelNumber) {
  Game.levelNumber = levelNumber;
  Level.build(levelNumber);
  Crumble.reset();
  Combat.reset();
  Player.reset();
  Game.score = 0;
  Game.mode = "playing";
  Game.showMessage("");
  Game.updateHUD();
};
Game.showMessage = function (text) { document.getElementById("message").textContent = text; };
Game.updateHUD = function () {
  var label = document.getElementById("score");
  if (!label) { return; }
  var reload = Combat.reloadTimer > 0 ? " | RELOADING" : "";
  label.textContent = "Coins: " + Game.score + " | Ammo: " + Combat.ammo + "/" + Combat.reserve + reload;
};
Game.update = function () {
  if (Input.restart) { Game.startLevel(Game.levelNumber); return; }
  if (Game.mode !== "playing") { return; }
  Player.update();
  Player.collectCoins();
  Combat.update();
  Crumble.update();
  if (Player.isDead()) {
    Game.mode = "dead";
    Game.showMessage("An enemy got you. Press R to try again.");
  } else if (Player.hasWon()) {
    Game.mode = "won";
    Game.showMessage("You made it. Press R to play again.");
  }
};
Game.loop = function () {
  Game.update(); Draw.updateCamera(); Draw.everything(); window.requestAnimationFrame(Game.loop);
};
