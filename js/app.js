import Grid from "./Grid.js";
import Tile from "./Tile.js";

const gameBoard = document.querySelector("#game-board");

const grid = new Grid(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);

setupInput();

function setupInput() {
  window.addEventListener("keydown", handleInput, { once: true });
}

async function handleInput(event) {
  switch (event.key) {
    case "ArrowUp":
      if (!canMoveUp()) {
        setupInput();
        return;
      }
      await moveUp();
      break;
    case "ArrowDown":
      if (!canMoveDown()) {
        setupInput();
        return;
      }
      await moveDown();
      break;
    case "ArrowLeft":
      if (!canMoveLeft()) {
        setupInput();
        return;
      }
      await moveLeft();
      break;
    case "ArrowRight":
      if (!canMoveRight()) {
        setupInput();
        return;
      }
      await moveRight();
      break;
    default:
      setupInput();
      break;
  }

  grid.cells.forEach((cell) => {
    return cell.mergeTiles();
  });

  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;

  if (!canMoveUp && !canMoveDown && !canMoveLeft && !canMoveRight) {
    newTile.waitForTransition(true).then(() => {
      alert("You lose!");
    });
  } else {
    setupInput();
  }
}

function moveUp() {
  return slideTiles(grid.cellsByColimn);
}

function moveDown() {
  return slideTiles(grid.cellsByColimn.map((column) => [...column].reverse()));
}

function moveLeft() {
  return slideTiles(grid.cellsByRow);
}

function moveRight() {
  return slideTiles(grid.cellsByRow.map((row) => [...row].reverse()));
}

function slideTiles(cells) {
  const fMap = cells.flatMap((group) => {
    const promises = [];

    for (let i = 1; i < group.length; i++) {
      const cell = group[i];
      if (cell.tile == null) continue;
      let lastValidCell;

      for (let j = i - 1; j >= 0; j--) {
        const moveToCell = group[j];

        if (!moveToCell.canAccept(cell.tile)) break;
        lastValidCell = moveToCell;
      }

      if (lastValidCell != null) {
        const prom = cell.tile.waitForTransition();
        promises.push(prom);

        if (lastValidCell.tile != null) {
          lastValidCell.mergeTile = cell.tile;
        } else {
          lastValidCell.tile = cell.tile;
        }

        cell.tile = null;
      }
    }

    return promises;
  });

  return Promise.all(fMap);
}

function canMoveUp() {
  return canMove(grid.cellsByColimn);
}

function canMoveDown() {
  return canMove(grid.cellsByColimn.map((column) => [...column].reverse()));
}

function canMoveLeft() {
  return canMove(grid.cellsByRow);
}

function canMoveRight() {
  return canMove(grid.cellsByRow.map((row) => [...row].reverse()));
}

function canMove(cells) {
  return cells.some((group) => {
    return group.some((cell, index) => {
      if (index == 0) return false;
      if (cell.tile == null) return false;

      const moveToCell = group[index - 1];
      return moveToCell.canAccept(cell.tile);
    });
  });
}
