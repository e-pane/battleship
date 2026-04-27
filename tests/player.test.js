import { createPlayer } from "../src/factories.js";

test('player has a working gameboard', () => {
    const player = createPlayer('Harry');
    expect(player.name).toBe('Harry');
    expect(player.gameboard).toBeDefined();
    expect(player.gameboard).toHaveProperty("placeShip");
    expect(player.gameboard).toHaveProperty("receiveAttack");
}) 