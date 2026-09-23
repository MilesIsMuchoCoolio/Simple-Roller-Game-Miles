var Game = { mode: "playing", levelNumber: 0, score: 0 };

Game.startLevel = function (number) {
  Game.levelNumber = number;
  Level.build(number);
  Crumble.reset();
  Combat.reset();
  Player.reset();
  Game.score = 0;
  Game.mode = "playing";
  Game.showMessage("");
  Game.updateHUD();
};

Game.showMessage = function (text) {
  var message = document.getElementById("message");
  if (message) message.textContent = text;
};

Game.updateHUD = function () {
  var score = document.getElementById("score");
  if (!score) return;
  var reloadText = Combat.reloadTimer > 0 ? " | RELOADING" : "";
  // Coins are an ongoing score; there is intentionally no maximum or /total.
  score.textContent = "Coins: " + Game.score +
    " | Ammo: " + Combat.ammo + "/" + Combat.reserve + reloadText;
};

Game.update = function () {
  if (Input.restart) {
    Game.startLevel(Game.levelNumber);
    return;
  }
  if (Game.mode !== "playing") return;

  Player.update();
  Player.collectCoins();
  Combat.update();
  Crumble.update();

  if (Player.isDead()) {
    Game.mode = "dead";
    Game.showMessage("You were hit! Press R to restart.");
  } else if (Player.hasWon()) {
    Game.mode = "won";
    Game.showMessage("You made it! Press R to play again.");
  }
};

Game.loop = function () {
  Game.update();
  Draw.updateCamera();
  Draw.everything();
  window.requestAnimationFrame(Game.loop);
};
