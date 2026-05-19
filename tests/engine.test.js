import { jest } from "@jest/globals";
import { createEngine, generateFleet } from "../src/engine.js";
import { createGameboard, createShip } from "../src/factories.js";

test("engine.start creates players and default state", () => {
  const engine = createEngine();

  engine.start("Harry");

  console.log("AFTER START:", engine.state.turn);

  expect(engine.state.player).toBeDefined();
  expect(engine.state.computer).toBeDefined();
  expect(engine).toHaveProperty("placeShip");
  expect(engine).toHaveProperty("start");
  expect(engine.state.player.name).toBe("Harry");
  expect(engine.state.computer.name).toBe("computer");
  expect(engine.state.phase).toBe("shipPlacement");
  expect(engine.state.turn).toBe("player");
  expect(engine.state.gameOver).toBe(false);
});
  
test("engine.placeShip is a correct pass through", () => {
  const engine = createEngine();

  engine.start("Harry");
  engine.state.player.gameboard.placeShip = jest.fn().mockReturnValue({ ok: true });
  const result = engine.placeShip("cruiser", "D", 5, "vertical");
  expect(engine.state.player.gameboard.placeShip).toHaveBeenCalledTimes(1);
  expect(engine.state.player.gameboard.placeShip).toHaveBeenCalledWith(
    expect.any(Object), // ship from createShip
    "D",
    5,
    "vertical",
  )
  expect(result.ok).toBe(true);
});

test("engine.removeShipAt takes coords and calls gameboard.removeShip with correct ship", () => {
  const engine = createEngine();

  engine.start("Harry");
  engine.state.player.gameboard.removeShip = jest.fn().mockReturnValue({ ok: true });

  const destroyer = createShip("destroyer");
  engine.state.player.gameboard.placeShip(destroyer, "A", 1, "horizontal");

  const result = engine.removeShipAt(0, 0);

  expect(engine.state.player.gameboard.removeShip).toHaveBeenCalledTimes(1);
  expect(engine.state.player.gameboard.removeShip).toHaveBeenCalledWith(
    expect.objectContaining({
      ship: expect.objectContaining( { type: "destroyer"})
    }), 
  );
  expect(result.ok).toBe(true);
});

test("generateComputerFleet generates a valid fleet", () => {
  const engine = createEngine();
  engine.start("Harry");

  generateFleet(engine.state.computer.gameboard);

  const computerShips = engine.state.computer.gameboard.getShips();
  // assert that 5 ships were made
  expect(computerShips).toHaveLength(5);
  // assert no overlappping ships
  const computerShipCoords = [];
  computerShips.forEach((s) => {
    computerShipCoords.push(...s.coords.map(coord => `${coord[0]},${coord[1]}`));
  })

  const uniqueCoords = new Set(computerShipCoords);
  expect(uniqueCoords.size).toBe(computerShipCoords.length);
});

test("enterAttackMode doesn't respond to incomplete player fleet", () => {
  const engine = createEngine();
  engine.start("Harry");

  engine.enterAttackMode();

  expect(engine.state.phase).toBe('shipPlacement');
  expect(engine.state.computer.gameboard.getShips()).toHaveLength(0);
});

test("enterAttackMode switches to attack mode and generates computer fleet", () => {
  const engine = createEngine();
  engine.start("Harry");

  engine.placeShip("carrier", "A", 1, "horizontal");
  engine.placeShip("battleship", "B", 2, "horizontal");
  engine.placeShip("cruiser", "C", 3, "horizontal");
  engine.placeShip("submarine", "D", 4, "horizontal");
  engine.placeShip("destroyer", "E", 5, "horizontal");

  engine.enterAttackMode();

  expect(engine.state.phase).toBe('attack');
  expect(engine.state.computer.gameboard.getShips()).toHaveLength(5);
});

test("playerAttack is not called if it's not player's turn", () => {
  const engine = createEngine();
  engine.start("Harry");

  engine.state.turn = 'computer';

  const result = engine.playerAttack(3, 4);

  expect(result).toEqual({
    ok: false,
    reason: "NOT_YOUR_TURN",
  });
});

test("playerAttack receives and handles failure from gameboard.receiveAttack call", () => {
  const engine = createEngine();
  engine.start("Harry");
  engine.state.computer.gameboard.receiveAttack =
    jest.fn().mockReturnValue({ ok: false, reason: "ALREADY_ATTACKED" });
    
  const result = engine.playerAttack(3, 4);

  expect(result.ok).toBe(false);
  expect(result.reason).toBe('ALREADY_ATTACKED');
  expect(engine.state.turn).toBe('player');
});

test("playerAttack toggles turn to 'computer' after successful receiveAttack call", () => {
  const engine = createEngine();
  engine.start("Harry");
  engine.state.computer.gameboard.receiveAttack = jest
    .fn()
    .mockReturnValue({ ok: true, outcome: "miss" });
  
  const result = engine.playerAttack(3, 4);

  expect(engine.state.turn).toBe('computer');
});

test("computerAttack tracks available cells correctly", () => {
  const engine = createEngine();
  engine.start("Harry");
  // computerAttack should first generate a random x,y coord, check if it's in attacked Set and return 
  // false if it isn't and add it to an availableCells array.  
  engine.state.player.gameboard.hasBeenAttacked =
    jest.fn((x, y) => { return (x === 0 && y === 0) || (x === 1 && y === 1) });

  engine.state.player.gameboard.receiveAttack = jest
    .fn().mockReturnValue({ ok: true, outcome: "miss" });
  
  jest.spyOn(Math, "random").mockReturnValue(0);

  const result = engine.computerAttack();

  expect(engine.state.player.gameboard.receiveAttack).not.toHaveBeenCalledWith(0, 0);
  expect(engine.state.player.gameboard.receiveAttack).not.toHaveBeenCalledWith(1, 1);
  const [x, y] = engine.state.player.gameboard.receiveAttack.mock.calls[0];
  expect(x >= 0 && x < 10).toBe(true);
  expect(y >= 0 && y < 10).toBe(true);
  expect((x === 0 && y === 0) || (x === 1 && y === 1)).toBe(false);
});

test("computerAttack calls receiveAttack with x,y coords and handles return data properly", () => {
  const engine = createEngine();
  engine.start("Harry");
  engine.state.player.gameboard.receiveAttack = jest
    .fn()
    .mockReturnValue({ ok: true, outcome: "miss" });

  engine.computerAttack();

  expect(engine.state.player.gameboard.receiveAttack).toHaveBeenCalledTimes(1);
});

test("computerAttack toggles turn to 'player' after successful receiveAttack call", () => {
  const engine = createEngine();
  engine.start("Harry");
  engine.state.player.gameboard.receiveAttack = jest
    .fn()
    .mockReturnValue({ ok: true, outcome: "miss" });

  engine.computerAttack();

  expect(engine.state.turn).toBe("player");
});