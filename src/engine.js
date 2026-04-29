import { createShip, createPlayer, createGameboard } from "./factories.js";

export function createEngine() {

    const engine = Object.create(null);

    engine.start = (playerName) => {
        const player = createPlayer(playerName);
        const computer = createPlayer("computer");

        engine.state = {
            player,
            computer,
            phase: 'shipPlacement',
            turn: 'player',
            gameOver: false,
        };
        console.log(engine.state);
    }

    engine.placeShip = (shipType, x, y, orient) => {
        const ship = createShip(shipType);
        const result = engine.state.player.gameboard.placeShip(ship, x, y, orient);
        console.log(engine.state.player.gameboard.getShips());

        return result;
    };

  return engine;
}

