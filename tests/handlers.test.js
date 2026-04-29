import { jest } from "@jest/globals";

const mockRenderShipPlacementScreen = jest.fn();

jest.unstable_mockModule("../src/renderers.js", () => ({
  renderShipPlacementScreen: mockRenderShipPlacementScreen,
}));

const { createHandlers } = await import("../src/handlers.js");

test("handleStartGame starts game with payload name", () => {
  const mockEngine = {
    start: jest.fn(),
    state: { phase: "shipPlacement" },
  };

  const handler = createHandlers(mockEngine);
  handler.startGame({ playerName: "Harry" });

  expect(mockEngine.start).toHaveBeenCalledTimes(1);
  expect(mockEngine.start).toHaveBeenCalledWith("Harry");

  expect(mockRenderShipPlacementScreen).toHaveBeenCalledTimes(1);
  expect(mockRenderShipPlacementScreen).toHaveBeenCalledWith(mockEngine.state);
});
