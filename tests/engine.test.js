import { jest } from "@jest/globals";
import { createEngine } from "../src/engine.js";
import { createGameboard, createShip } from "../src/factories.js";

test("engine.start creates players and default state", () => {
  const engine = createEngine();

  engine.start("Harry");

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

