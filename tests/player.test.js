const { createPlayer } = require("../src/factories");

test('player has a working gameboard', () => {
    const player = createPlayer('Harry');
    expect(player.name).toBe('Harry');
    expect(player.gameboard).toBeDefined();
    expect(player.gameboard).toHaveProperty("placeShip");
    expect(player.gameboard).toHaveProperty("receiveAttack");
}) 