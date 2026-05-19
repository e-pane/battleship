import { jest } from "@jest/globals";
import { createGameboard, createShip, getShipCoords, parseCoord } from "../src/factories.js";

test("getShipCoords does the right math", () => {
  const mockShip = {
    type: "carrier",
    length: 5,
  }

  const horCoords = getShipCoords(mockShip, 2, 4, 'horizontal');
  expect(horCoords.length).toBe(5);
  expect(horCoords[0]).toEqual([2,4]);
  expect(horCoords[2]).toEqual([4,4]);

  const vertCoords = getShipCoords(mockShip, 2, 4, 'vertical');
  expect(vertCoords.length).toBe(5);
  expect(vertCoords[0]).toEqual([2,4]);
  expect(vertCoords[2]).toEqual([2,6]); 
});

test("parseCoord parses correctly", () => {
  const parsedCoord1 = parseCoord("C","5");
  expect(parsedCoord1).toEqual([4, 2]);
})

test("placeShip enforces placement rules", () => {
  const gb = createGameboard();
  const ship1 = createShip("destroyer");
  const ship2 = createShip("carrier");
  const ship3 = createShip("battleship");

  gb.placeShip(ship1, "C", 5, "horizontal");
  gb.placeShip(ship2, "F", 1, "vertical");
  // place battleship out of bounds
  const result1 = gb.placeShip(ship3, "B", 9, "horizontal");
  expect(result1.ok).toBe(false);
  expect(result1.reason).toBe("OUT_OF_BOUNDS");
  // start battleship off the grid
  const result2 = gb.placeShip(ship3, "B", 11, "horizontal");
  expect(result2.ok).toBe(false);
  expect(result2.reason).toBe("INVALID_START");
  // overlap battleship with carrier
  const result3 = gb.placeShip(ship3, "F", 1, "horizontal");
  expect(result3.ok).toBe(false);
  expect(result3.reason).toBe("OVERLAP");
  // try to place destroyer a second time
  const result4 = gb.placeShip(ship1, "H", 3, "horizontal");
  expect(result4.ok).toBe(false);
  expect(result4.reason).toBe("SHIP_ALREADY_PLACED");

  const result = gb.getShips();
  expect(result.length).toBe(2);

  expect(result[0].coords).toEqual([
      [4, 2],
      [5, 2],
    ]);

  expect(gb.hasShipAt(4, 2)).toBe(true);
  expect(gb.hasShipAt(4, 3)).toBe(false);
  expect(gb.hasShipAt(5, 2)).toBe(true);
  expect(gb.hasShipAt(0, 5)).toBe(true);
  expect(gb.hasShipAt(1, 5)).toBe(false);
  expect(gb.hasShipAt(0, 6)).toBe(true);
});

test("removeShip removes ship from board state", () => {
  const gb = createGameboard();
  const ship1 = createShip("destroyer");
  const ship2 = createShip("carrier");

  gb.placeShip(ship1, "C", 5, "horizontal");
  gb.placeShip(ship2, "F", 1, "vertical");

  const result = gb.getShips();
  expect(result.length).toBe(2);

  gb.removeShip(result[0]);
  const result2 = gb.getShips();
  expect(result2.length).toBe(1);
})

test("allShipsSunk returns true after every ship is hit", () => {
  const gb = createGameboard();

  const destroyer = createShip("destroyer");
  const carrier = createShip("carrier");

  gb.placeShip(destroyer, "A", 1, "horizontal");
  gb.placeShip(carrier, "B", 1, "horizontal");

  gb.receiveAttack(0, 0);
  gb.receiveAttack(1, 0);

  for (let i = 0; i <= 4; i++) {
    gb.receiveAttack(i, 1);
  }
  expect(gb.allShipsSunk()).toBe(true);
});

test("allShipsSunk returns false when any ship remains afloat", () => {
  const gb = createGameboard();

  const destroyer = createShip("destroyer");
  const carrier = createShip("carrier");

  gb.placeShip(destroyer, "A", 1, "horizontal");
  gb.placeShip(carrier, "B", 1, "horizontal");
  //miss the destroyer partially
  gb.receiveAttack(0, 0);
  gb.receiveAttack(2, 0);
  // hit all of the carrier
  for (let i = 0; i <= 4; i++) {
    gb.receiveAttack(i, 1);
  }
  expect(gb.allShipsSunk()).toBe(false);
});
test("receiveAttack registers a hit, updates attacked and calls ship.hit()", () => {
  const gb = createGameboard();

  const destroyer = createShip("destroyer");

  destroyer.hit = jest.fn();

  gb.placeShip(destroyer, "A", 1, "horizontal");

  const hitResult = gb.receiveAttack(0, 0);

  expect(hitResult.ok).toBe(true);
  expect(hitResult.outcome).toBe('hit');
  
  const attacked = gb.hasBeenAttacked(0, 0);
  expect(attacked).toBe(true);
  expect(destroyer.hit).toHaveBeenCalledTimes(1);
});

test("receiveAttack registers a miss and updates attacked", () => {
  const gb = createGameboard();

  const destroyer = createShip("destroyer");

  gb.placeShip(destroyer, "A", 1, "horizontal");

  const missResult = gb.receiveAttack(9, 9);
  expect(missResult.ok).toBe(true);
  expect(missResult.outcome).toBe("miss");

  const attacked = gb.hasBeenAttacked(9,9);
  expect(attacked).toBe(true);
});
test("receiveAttack prevents attacking same cell twice", () => {
  const gb = createGameboard();

  const destroyer = createShip("destroyer");

  gb.placeShip(destroyer, "A", 1, "horizontal");

  const missResult1 = gb.receiveAttack(9, 9);
  const missResult2 = gb.receiveAttack(9, 9);
  expect(missResult2.ok).toBe(false);
  expect(missResult2.reason).toBe("ALREADY_ATTACKED");
});
test("hasBeenAttacked reflects attack state", () => {
  const gb = createGameboard();

  const destroyer = createShip("destroyer");

  gb.placeShip(destroyer, "A", 1, "horizontal");

  const notAttackedYet = gb.hasBeenAttacked(9, 9);
  expect(notAttackedYet).toBe(false);
  gb.receiveAttack(9, 9);
  
  const nowAttacked = gb.hasBeenAttacked(9, 9);
  expect(nowAttacked).toBe(true);
});
test("getAttacks returns all attacked coordinates", () => {
  const gb = createGameboard();

  const destroyer = createShip("destroyer");

  gb.placeShip(destroyer, "A", 1, "horizontal");

  const hitResult = gb.receiveAttack(0,0);
  const missResult = gb.receiveAttack(9, 9);
  
  const attackedArray = gb.getAttacks();
  expect(attackedArray).toBeInstanceOf(Array);
  expect(attackedArray.length).toEqual(2);
  expect(attackedArray[0]).toBe("0,0");
  expect(attackedArray[1]).toBe("9,9");
});