import { createShip } from "../src/factories.js";

test('ship takes hits and sinks at the right time', () => {
    const ship = createShip("battleship");

    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(false);

    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
});