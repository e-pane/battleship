import { createShip, createPlayer, createGameboard } from "./factories.js";

export function createEngine() {

    const engine = Object.create(null);

    // helper to creat the computer's fleet of ships
    function generateComputerFleet() {
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

          const result = engine.state.computer.gameboard.placeShip(createShip(shipType), x, y, orient);

          if (result.ok) {
            placed = true;
          }
        }
      }
    }

    engine.start = (playerName) => {
        const player = createPlayer(playerName);
        const computer = createPlayer("computer");

        engine.state = {
            player,
            computer,
            phase: 'shipPlacement',
            turn: 'player',
            gameOver: false,
            requiredShips: 5,
        };
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
        const ship = ships.find(ship => 
            ship.coords.some(coord => coord[0] === x && coord[1] === y)
        );

        if (!ship) return;

        const result = engine.state.player.gameboard.removeShip(ship);
        
        return result;
    };

    engine.enterAttackMode = () => {
        if (engine.state.player.gameboard.getShip().length !== engine.state.requiredShips) return;

        generateComputerFleet();

        engine.state.phase = "attack";
    }

  return engine;
}

