import { createGameboard, createShip } from "../src/factories.js";

test("ship is placed correctly", () => {
    const gameboard = createGameboard();
    const destroyer = createShip("destroyer");
    const aircraftCarrier = createShip("carrier");
    const battleship = createShip("battleship");
    const submarine = createShip("submarine");
    //successfully place a destroyer and carrier
    gameboard.placeShip(destroyer, 4, 5, 'horizontal');
    
    let result = gameboard.getShips();
    
    expect(result.length).toBe(1);
    expect(result[0].coords).toEqual([[4, 5], [5, 5]]);

    gameboard.placeShip(aircraftCarrier, 0, 0, 'vertical');
    result = gameboard.getShips();
    expect(result.length).toBe(2);
    expect(result[1].coords).toEqual([
      [0,0],
      [0,1],
      [0,2],
      [0,3],
      [0,4],
    ]);
    // battleship off the board
    gameboard.placeShip(battleship, 7, 0, 'horizontal');
    result = gameboard.getShips();
    expect(result.length).toBe(2);
    // submarine off the board
    gameboard.placeShip(submarine, 0, 8, 'vertical');
    result = gameboard.getShips();
    expect(result.length).toBe(2);

    gameboard.placeShip(submarine, -2, 4, 'horizontal');
    result = gameboard.getShips();
    expect(result.length).toBe(2);

    gameboard.placeShip(submarine, 2, -4, 'horizontal');
    result = gameboard.getShips();
    expect(result.length).toBe(2);

    gameboard.placeShip(submarine, 2, 3.5, 'horizontal');
    result = gameboard.getShips();
    expect(result.length).toBe(2);
    //battleship will land on top of carrier
    gameboard.placeShip(battleship, 0, 1, 'horizontal');
    result = gameboard.getShips();
    expect(result.length).toBe(2);

    expect(result).toEqual([
      expect.objectContaining({ ship: destroyer }),
      expect.objectContaining({ ship: aircraftCarrier }),
    ]);
});

test("all ships sunk", () => {
    const gameboard = createGameboard();

    const destroyer = createShip("destroyer");
    const carrier = createShip("carrier");

    gameboard.placeShip(destroyer, 0, 0, 'horizontal');
    gameboard.placeShip(carrier, 2, 0, 'horizontal');

    gameboard.receiveAttack(0, 0);
    gameboard.receiveAttack(1, 0);

    for (let i = 2; i <= 6; i++) {
        gameboard.receiveAttack(i, 0);
    }
    expect(gameboard.allShipsSunk()).toBe(true);
});
