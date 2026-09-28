var Input = {
  left: false,
  right: false,
  jump: false,
  restart: false,
  shoot: false,
  reload: false,
  mouseX: 400,
  mouseY: 200
};

window.addEventListener("keydown", function (event) {
  setKey(event.key, true);
  if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].indexOf(event.key) >= 0) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", function (event) {
  setKey(event.key, false);
});

function setKey(key, down) {
  if (key === "ArrowLeft" || key === "a" || key === "A") {
    Input.left = down;
  }
  if (key === "ArrowRight" || key === "d" || key === "D") {
    Input.right = down;
  }
  if (key === "ArrowUp" || key === " " || key === "w" || key === "W") {
    Input.jump = down;
  }
  if (key === "t" || key === "T") {
    Input.restart = down;
  }
  if (key === "r" || key === "R") {
    Input.reload = down;
  }
}

var canvas = document.getElementById("game");

window.addEventListener("mousemove", function (event) {
  var canvasRect = canvas.getBoundingClientRect();
  Input.mouseX = (event.clientX - canvasRect.left) * canvas.width / canvasRect.width;
  Input.mouseY = (event.clientY - canvasRect.top) * canvas.height / canvasRect.height;
});

canvas.addEventListener("mousedown", function (event) {
  Input.shoot = true;
});

canvas.addEventListener("mouseup", function (event) {
  Input.shoot = false;
});
