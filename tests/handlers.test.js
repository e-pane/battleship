import { jest } from "@jest/globals";

const mockRenderShipPlacementScreen = jest.fn();
const mockRenderAttackScreen = jest.fn();

jest.unstable_mockModule("../src/renderers.js", () => ({
  renderShipPlacementScreen: mockRenderShipPlacementScreen,
  renderAttackScreen: mockRenderAttackScreen,
}));

// factory to make a fresh mockEngine object for each handler test
function createMockEngine() {
  return {
    start: jest.fn(),
    placeShip: jest.fn(),
    removeShipAt: jest.fn(),
    enterAttackMode: jest.fn(),

    state: {
      player: {
        gameboard: {
          getShips: jest.fn(() => []),
        },
      },
      computer: {
        gameboard: {
          getShips: jest.fn(() => []),
        },
      },
      phase: "shipPlacement",
      turn: "player",
      gameOver: false,
      requiredShips: 5,
    },
  };
}

const { createHandlers } = await import("../src/handlers.js");

// factor out handler instantiation with a mockEngine
let handlers;
let mockEngine;
beforeEach(() => {
  jest.clearAllMocks();
  mockEngine = createMockEngine();
  handlers = createHandlers(mockEngine);
});

test("handleStartGame starts game with payload name and renders placement screen", () => {
  handlers.startGame({ playerName: "Harry" });

  expect(mockEngine.start).toHaveBeenCalledTimes(1);
  expect(mockEngine.start).toHaveBeenCalledWith("Harry");

  expect(mockRenderShipPlacementScreen).toHaveBeenCalledTimes(1);
  expect(mockRenderShipPlacementScreen).toHaveBeenCalledWith(
    {
      ...mockEngine.state, ships: [],
    })
});

test("handlePlaceShip calls engine with correct args & renders updated state", () => {
  mockEngine.placeShip.mockReturnValue({ ok: true });
  
  mockEngine.state.player.gameboard.getShips = jest.fn(() => [
    { ship: { type: 'carrier' }, coords: [] } 
  ]);

  handlers.startGame({ playerName: "Harry" });

  const payload = {
    shipType: "carrier",
    x: "A",
    y: 1,
    orient: "horizontal",
  };

  handlers.placeShip(payload);

  expect(mockEngine.placeShip).toHaveBeenCalledWith(
    "carrier",
    "A",
    1,
    "horizontal",
  );

  expect(mockRenderShipPlacementScreen).toHaveBeenCalledWith({
    ...mockEngine.state,
    ships: [
      { ship: { type: "carrier" }, coords: [] }
    ],
  });
});

test("handlePlaceShip calls engine with correct args & follows engine failure response path", () => {
  mockEngine.placeShip.mockReturnValue({ ok: false, reason: 'overlap', });
  
  mockEngine.state.player.gameboard.getShips = jest.fn(() => [
    { ship: { type: 'carrier' }, coords: [] } 
  ]);

  handlers.startGame({ playerName: "Harry" });

  const payload = {
    shipType: "carrier",
    x: "A",
    y: 1,
    orient: "horizontal",
  };

  handlers.placeShip(payload);

  expect(mockEngine.placeShip).toHaveBeenCalledWith(
    "carrier",
    "A",
    1,
    "horizontal",
  );

  expect(mockRenderShipPlacementScreen).toHaveBeenCalledWith({
    ...mockEngine.state,
    ships: [
      { ship: { type: "carrier" }, coords: [] }
    ],
  },
    {
      errorMsg: 'overlap',
    }
  );
});

test("handleRemoveShip calls engine with correct args & renders updated state", () => {
  mockEngine.removeShipAt.mockReturnValue({ ok: true });

  mockEngine.state.player.gameboard.getShips = jest.fn(() => [
    { ship: { type: "carrier" }, coords: [] },
  ]);

  handlers.startGame({ playerName: "Harry" });

  const payload = {
    x: "A",
    y: 1,
  };

  handlers.removeShip(payload);

  expect(mockEngine.removeShipAt).toHaveBeenCalledWith(
    "A",
    1,
  );

  expect(mockRenderShipPlacementScreen).toHaveBeenCalledWith({
    ...mockEngine.state,
    ships: [{ ship: { type: "carrier" }, coords: [] }],
  });
});

test("handleRemoveShip calls engine with correct args & follows engine failure response path", () => {
  mockEngine.removeShipAt.mockReturnValue({ ok: false, reason: "no ship" });

  const payload = {
    x: "A",
    y: 1,
  };

  handlers.removeShip(payload);

  expect(mockEngine.removeShipAt).toHaveBeenCalledWith("A", 1);
  expect(mockRenderShipPlacementScreen).not.toHaveBeenCalled();
});

test("handleAttackMode calls the engine", () => {
  handlers.enterAttackMode();
  expect(mockEngine.enterAttackMode).toHaveBeenCalledTimes(1);
});

test("handleAttackMode calls renderAttackScreen with expected data", () => {
  const playerShips = [
    {
      ship: {
        type: "carrier",
        isSunk: jest.fn(() => false),
      },
      coords: [],
    },
  ];

  const computerShips = [
    {
      ship: {
        type: "carrier",
        isSunk: jest.fn(() => false),
      },
      coords: [],
    },
  ];

  mockEngine.state.player.gameboard.getShips = jest.fn(() => playerShips);
  mockEngine.state.computer.gameboard.getShips = jest.fn(() => computerShips);

  handlers.enterAttackMode();

  expect(mockRenderAttackScreen).toHaveBeenCalledWith(
    expect.objectContaining({
      playerShips,
      computerShips,
    }),
    expect.objectContaining({
      turnText: expect.any(String),
      turnInstruction: expect.any(String),
      playerSunkShips: [],
      computerSunkShips: [],
    }),
  );

})
