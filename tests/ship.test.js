const { createShip } = require( "../src/factories");

test('ship takes hits and sinks at the right time', () => {
    const ship = createShip(4);

    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(false);

    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
});