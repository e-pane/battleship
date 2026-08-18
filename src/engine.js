import { createShip, createPlayer, createGameboard } from "./factories.js";
import { getLevel1Candidate, getLevel2Candidate, getLevel3Candidate } from "./ai.js";

// helper to creat the computer's fleet of ships
export function generateFleet(gameboard) {
  const shipTypes = [
    "carrier",
    "battleship",
    "cruiser",
    "submarine",
    "destroyer",
  ];

  for (const shipType of shipTypes) {
    let placed = false;

    while (!placed) {
      const letters = "ABCDEFGHIJ";
      const x = letters[Math.floor(Math.random() * 10)];
      const y = Math.floor(Math.random() * 10) + 1;
      const orient = Math.random() < 0.5 ? "horizontal" : "vertical";

      const result = gameboard.placeShip(createShip(shipType), x, y, orient);

      if (result.ok) {
        placed = true;
      }
    }
  }
}

export function createEngine() {
  const engine = Object.create(null);

  engine.state = {
    player: null,
    computer: null,
    phase: "idle",
    turn: null,
    level: 2,
    lastHitCoords: null,
    lastAttackHit: null,
    gameOver: false,
    winner: null,
    requiredShips: 5,
  };

  engine.start = (playerName) => {
    engine.state.player = createPlayer(playerName);
    engine.state.computer = createPlayer("computer");

    engine.state.phase = "shipPlacement";
    engine.state.turn = "player";
  };

  // helper to check if game is over
  engine.checkGameOver = () => {
    if (engine.state.player.gameboard.allShipsSunk()) {
      engine.state.winner = 'computer';
      engine.state.phase = "gameOver";
    } else if (engine.state.computer.gameboard.allShipsSunk()) {
      engine.state.winner = 'player';
      engine.state.phase = "gameOver";
    } 
  }

  engine.placeShip = (shipType, x, y, orient) => {
    const ship = createShip(shipType);
    const result = engine.state.player.gameboard.placeShip(ship, x, y, orient);

    return result;
  };

  engine.removeShipAt = (x, y) => {
    x = Number(x);
    y = Number(y);

    const ships = engine.state.player.gameboard.getShips();
    const ship = ships.find((ship) =>
      ship.coords.some((coord) => coord[0] === x && coord[1] === y),
    );

    if (!ship) return;

    const result = engine.state.player.gameboard.removeShip(ship);

    return result;
  };

  engine.enterAttackMode = () => {
    if (
      engine.state.player.gameboard.getShips().length !==
      engine.state.requiredShips
    )
      return;

    generateFleet(engine.state.computer.gameboard);

    engine.state.phase = "attack";
  };

  engine.playerAttack = (x, y) => {
    if (engine.state.turn !== "player")
      return { ok: false, reason: "NOT_YOUR_TURN" };

    const result = engine.state.computer.gameboard.receiveAttack(x, y);

    if (!result.ok) return result;

    engine.checkGameOver();

    engine.state.turn = "computer";
    return result;
  };

  engine.computerAttack = () => {
    let computerMove;

    if (engine.state.level === 1) {
      computerMove = getLevel1Candidate(engine.state.player.gameboard);
    }

    if (engine.state.level === 2) {
      computerMove = getLevel2Candidate(
        engine.state.player.gameboard,
        engine.state.lastAttackHit,
      );
      if (!computerMove) {
        engine.state.lastAttackHit = null;
        computerMove = getLevel1Candidate(engine.state.player.gameboard);
      }
    }

    if (engine.state.level === 3) {
      computerMove = getLevel3Candidate(
        engine.state.player.gameboard,
        engine.state.lastAttackHit,
      );
    }

    if (
      !Array.isArray(computerMove) ||
      computerMove.length !== 2 ||
      computerMove.some((coord) => coord === undefined)
    ) {
      console.error("BAD COMPUTER MOVE", computerMove);
      return;
    }

    const [x, y] = computerMove;

    const result = engine.state.player.gameboard.receiveAttack(x, y);

    engine.checkGameOver();

    if (result.outcome === "hit") {
      engine.state.lastAttackHit = result.lastHitCoords;
    } else {
      engine.state.lastAttackHit = null;
    }

    engine.state.turn = "player";

    return { ...result, x, y };
  };

  return engine;
}

