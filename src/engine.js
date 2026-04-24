const { createShip, createPlayer } = require("./factories");

function createEngine() {

    const engine = Object.create(null);

    engine.start = (playerName) => {
        engine.state = {
            player: createPlayer(playerName),
            computer: createPlayer('computer'),
            phase: 'shipPlacement',
            turn: 'player',
            gameOver: false,
        }
    }

    engine.placeShip = (type, x, y, orient) => {
        const ship = createShip(type);
        engine.state.player.gameboard.placeShip(ship, x, y, orient);
    };

  return engine;
}

module.exports = { createEngine };
