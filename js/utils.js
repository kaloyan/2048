const scoreElement = document.querySelector("#score");

export function updateScore(score) {
  scoreElement.textContent = score;
}
