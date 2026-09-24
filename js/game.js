var Game = {
  mode: "playing",
  levelNumber: 0,
  score: 0
};

Game.startLevel = function (levelNumber) {
  if (!Level.levels || !Level.levels[levelNumber]) return;
  Game.levelNumber = levelNumber;
  Level.build(levelNumber);
  Crumble.reset();
  Combat.reset();
  Player.reset();
  Game.score = 0;
  Game.mode = "playing";
  Game.showMessage("");
  Game.updateLevelMenu();
  Game.updateHUD();
};

Game.setupLevelMenu = function () {
  var menu = document.getElementById("level-select");
  if (!menu || !Level.levels) return;
  menu.innerHTML = "";
  for (var i = 0; i < Level.levels.length; i++) {
    var option = document.createElement("option");
    option.value = i;
    option.textContent = (i + 1) + ". " + Level.levels[i].name;
    menu.appendChild(option);
  }
  menu.onchange = function () {
    Game.startLevel(Number(menu.value));
  };
  Game.updateLevelMenu();
};

Game.updateLevelMenu = function () {
  var menu = document.getElementById("level-select");
  if (menu) menu.value = String(Game.levelNumber);
};

Game.showMessage = function (text) {
  var message = document.getElementById("message");
  if (message) message.textContent = text;
};

Game.updateHUD = function () {
  var score = document.getElementById("score");
  if (!score) return;
  var reloadText = Combat.reloadTimer > 0 ? " | RELOADING" : "";
  score.textContent = "Level " + (Game.levelNumber + 1) + ": " + Level.name + " | Coins: " + Game.score + " | Ammo: " + Combat.ammo + "/" + Combat.reserve + reloadText;
};

Game.update = function () {
  if (Input.restart) {
    Game.startLevel(Game.levelNumber);
    return;
  }

  if (Game.mode !== "playing") return;

  Player.update();
  Combat.update();
  Crumble.update();

  if (Player.isDead()) {
    Game.mode = "dead";
    Game.showMessage("You were hit! Press R to restart.");
    return;
  }

  if (Player.hasWon()) {
    Game.mode = "won";
    if (Game.levelNumber < Level.levels.length - 1) {
      Game.showMessage("Level complete! Choose the next level above or press N.");
    } else {
      Game.showMessage("You beat every level! Press R to play again.");
    }
  }
};

Game.nextLevel = function () {
  if (Level.levels && Game.levelNumber < Level.levels.length - 1) {
    Game.startLevel(Game.levelNumber + 1);
  }
};

Game.previousLevel = function () {
  if (Game.levelNumber > 0) Game.startLevel(Game.levelNumber - 1);
};

Game.loop = function () {
  Game.update();
  Draw.updateCamera();
  Draw.everything();
  window.requestAnimationFrame(Game.loop);
};
