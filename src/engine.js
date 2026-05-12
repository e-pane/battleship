import { createShip, createPlayer, createGameboard } from "./factories.js";

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
      gameOver: false,
      requiredShips: 5,
    };

    engine.start = (playerName) => {
      engine.state.player = createPlayer(playerName);
      engine.state.computer = createPlayer("computer");
    
      engine.state.phase = "shipPlacement";
      engine.state.turn = "player";
    };

    engine.placeShip = (shipType, x, y, orient) => {
        const ship = createShip(shipType);
        const result = engine.state.player.gameboard.placeShip(ship, x, y, orient);

        return result;
    };

    engine.removeShipAt = (x, y) => {
        x = Number(x);
        y = Number(y);

        const ships = engine.state.player.gameboard.getShips();
        const ship = ships.find(ship => 
            ship.coords.some(coord => coord[0] === x && coord[1] === y)
        );

        if (!ship) return;

        const result = engine.state.player.gameboard.removeShip(ship);
        
        return result;
    };

    engine.enterAttackMode = () => {
    if (engine.state.player.gameboard.getShips().length !== engine.state.requiredShips) return;

    generateFleet(engine.state.computer.gameboard);

    engine.state.phase = 'attack';
    };
  
    engine.playerAttack = (x, y) => {
      if (engine.state.turn !== 'player') return { ok: false, reason: "NOT_YOUR_TURN" };

      const result = engine.state.computer.gameboard.receiveAttack(x, y);

      if (!result.ok) return result;

      engine.state.turn = 'computer';
      return result;
    };
  
  engine.computerAttack = () => {
    // make an array of available cells to be attacked using gameboard.hasBeenAttacked
    const availableCells = [];

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        if (!engine.state.player.gameboard.hasBeenAttacked(x, y)) {
          availableCells.push([x, y]);
        }
      }
    }
    // generate x,y coords randomly, based on available options
    const [x, y] = availableCells[Math.floor(Math.random() * availableCells.length)];

    const result = engine.state.player.gameboard.receiveAttack(x, y);

    engine.state.turn = 'player';
    return { x, y, ...result };
    }

  return engine;
}

