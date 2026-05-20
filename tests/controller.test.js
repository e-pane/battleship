import { jest } from "@jest/globals";
import { createController } from "../src/controller.js";
import { createEngine } from "../src/engine.js";

test('dispatch routes "startGame" intent to correct handler', () => {
  const handlers = {
    startGame: jest.fn(),
  };

  const mockEngine = createEngine();

  const controller = createController(mockEngine, handlers);
  controller.dispatch("startGame", { playerName: "Harry" });

  expect(handlers.startGame).toHaveBeenCalledTimes(1);
  expect(handlers.startGame).toHaveBeenCalledWith({ playerName: "Harry" });
  expect(() =>
    controller.dispatch("notRealIntent", { playerName: "Harry" }),
  ).toThrow("unknown action");
  expect(() => controller.dispatch(123, {})).toThrow("unknown action");
});
