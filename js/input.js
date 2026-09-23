/* Keyboard and mouse controls. */
var Input = {
  left: false, right: false, jump: false, restart: false,
  shoot: false, reload: false, mouseX: 400, mouseY: 200
};

window.addEventListener("keydown", function (event) {
  setKey(event.key, true);
  if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].indexOf(event.key) >= 0) event.preventDefault();
});
window.addEventListener("keyup", function (event) { setKey(event.key, false); });

function setKey(key, isDown) {
  if (key === "ArrowLeft" || key === "a" || key === "A") Input.left = isDown;
  if (key === "ArrowRight" || key === "d" || key === "D") Input.right = isDown;
  if (key === "ArrowUp" || key === " " || key === "w" || key === "W") Input.jump = isDown;
  if (key === "r" || key === "R") Input.restart = isDown;
  if (key === "x" || key === "X" || key === "Control") Input.shoot = isDown;
  if (key === "t" || key === "T") Input.reload = isDown;
}

window.addEventListener("mousemove", function (event) {
  var canvas = document.getElementById("game");
  if (!canvas) return;
  var rect = canvas.getBoundingClientRect();
  Input.mouseX = (event.clientX - rect.left) * canvas.width / rect.width;
  Input.mouseY = (event.clientY - rect.top) * canvas.height / rect.height;
});
window.addEventListener("mousedown", function (event) {
  if (event.button === 0) Input.shoot = true;
});
window.addEventListener("mouseup", function (event) {
  if (event.button === 0) Input.shoot = false;
});
