import Grid from "./Grid.js";
import Tile from "./Tile.js";
import { updateScore } from "./utils.js";

const gameBoard = document.querySelector("#game-board");
const allowedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

const actions = {
  ArrowUp: moveUp,
  ArrowDown: moveDown,
  ArrowLeft: moveLeft,
  ArrowRight: moveRight,
};

const grid = new Grid(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);

setupInput();

function setupInput() {
  window.addEventListener("keydown", handleInput, { once: true });
}

async function handleInput(event) {
  if (!allowedKeys.includes(event.key)) {
    setupInput();
    return;
  }

  // If you cant move in any direction - the game ands
  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    alert("You lose!");
    return;
  }

  const action = await actions[event.key]();
  if (!action) return;

  grid.cells.forEach((cell) => {
    return cell.mergeTiles();
  });

  const score = grid.getMaxCell();
  updateScore(score);

  // Create and insert new tile
  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;

  setupInput();
}

function moveUp() {
  if (!canMoveUp()) {
    setupInput();
    return false;
  }
  return slideTiles(grid.cellsByColimn);
}

function moveDown() {
  if (!canMoveDown()) {
    setupInput();
    return false;
  }
  return slideTiles(grid.cellsByColimn.map((column) => [...column].reverse()));
}

function moveLeft() {
  if (!canMoveLeft()) {
    setupInput();
    return false;
  }
  return slideTiles(grid.cellsByRow);
}

function moveRight() {
  if (!canMoveRight()) {
    setupInput();
    return false;
  }
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
