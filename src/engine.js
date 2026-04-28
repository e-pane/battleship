import { createShip, createPlayer } from "./factories.js";

export function createEngine() {

    const engine = Object.create(null);

    engine.start = (playerName) => {
        engine.state = {
            player: createPlayer(playerName),
            computer: createPlayer('computer'),
            phase: 'shipPlacement',
            turn: 'player',
            gameOver: false,
        };
        console.log(engine.state);
    }

    engine.placeShip = (type, x, y, orient) => {
        const ship = createShip(type);
        const success = engine.state.player.gameboard.placeShip(ship, x, y, orient);
        console.log(engine.state.player.gameboard.getShips());

        return success;
    };

  return engine;
}

