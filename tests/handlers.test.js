import { jest } from "@jest/globals";

const mockRenderShipPlacementScreen = jest.fn();
const mockRenderAttackScreen = jest.fn();

const mockBuildAttackMap = jest.fn();

jest.unstable_mockModule("../src/utils.js", () => ({
  buildAttackMap: mockBuildAttackMap,
}));

jest.unstable_mockModule("../src/renderers.js", () => ({
  renderShipPlacementScreen: mockRenderShipPlacementScreen,
  renderAttackScreen: mockRenderAttackScreen,
}));

// factory to make a fresh mockEngine object for each handler test
function createMockEngine(overrides = {}) {
  return {
    start: jest.fn(),
    placeShip: jest.fn(),
    removeShipAt: jest.fn(),
    enterAttackMode: jest.fn(),
    playerAttack: jest.fn(),

    state: {
      player: {
        gameboard: {
          getShips: jest.fn(() => overrides.playerShips || []),
          getAttacks: jest.fn(() => []),
        },
      },
      computer: {
        gameboard: {
          getShips: jest.fn(() => overrides.computerShips || []),
          getAttacks: jest.fn(() => []),
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
test("handleEnterAttackMode calls engine.attackMode", () => {
  handlers.enterAttackMode();
  
  expect(mockEngine.enterAttackMode).toHaveBeenCalledTimes(1);
});
test("handleEnterAttackMode calls renderAttackScreen with derived viewModel and uiState", () => {
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

  mockEngine = createMockEngine({ playerShips, computerShips });

  mockEngine.state.player.name = "Harry";
  mockEngine.state.phase = "attack";
  mockEngine.state.turn = "player";

  handlers = createHandlers(mockEngine);

  handlers.enterAttackMode();

  expect(mockRenderAttackScreen).toHaveBeenCalledTimes(1);
  const [viewModel, uiState] = mockRenderAttackScreen.mock.calls[0];
  expect(viewModel.playerShips).toBe(playerShips);
  expect(viewModel.computerShips).toBe(computerShips);

  expect(uiState.currentPhase).toBe("attack");

  expect(uiState.turnText).toBe("It's Harry's turn");

  expect(uiState.turnInstruction).toBe(
    "Click on a cell in the computer's grid to attack",
  );
});
test("handleEnterAttackMode derives sunk ships correctly", () => {
  const playerShips = [
    {
      ship: {
        type: "carrier",
        isSunk: jest.fn(() => true),
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

  mockEngine = createMockEngine({ playerShips, computerShips });

  mockEngine.state.player.name = "Harry";
  mockEngine.state.phase = "attack";
  mockEngine.state.turn = "player";

  handlers = createHandlers(mockEngine);

  handlers.enterAttackMode();
  const [viewModel, uiState] = mockRenderAttackScreen.mock.calls[0];

  expect(uiState.playerSunkShips).toEqual(["carrier"]);
});
test("handlePlayerAttack calls engine.playerAttack with correct args", () => {
  mockEngine.playerAttack = jest.fn(() => ({
    ok: true,
    outcome: "miss",
  }));
  mockEngine.state.turn = "player";

  const payload = {
    x: 3,
    y: 7,
  };

  handlers.playerAttack(payload);
  expect(mockEngine.playerAttack).toHaveBeenCalledTimes(1);
  expect(mockEngine.playerAttack).toHaveBeenCalledWith(3, 7);
});
test("handlePlayerAttack hanldes success path from engine.playerAttack call", () => {
  mockEngine.playerAttack = jest.fn(() => ({
    ok: true,
    outcome: "miss",
  }));
  mockEngine.state.turn = "player";

  const payload = {
    x: 3,
    y: 7,
  };

  handlers.playerAttack(payload);
  expect(mockRenderAttackScreen).toHaveBeenCalledTimes(1);
  const [viewModel, uiState] = mockRenderAttackScreen.mock.calls[0];
  expect(uiState.playerAttack).toEqual({
    x: 3,
    y: 7,
    outcome: "miss",
  });
});
test("handlePlayerAttack hanldes failure path from engine.playerAttack call", () => {
  mockEngine.playerAttack = jest.fn(() => ({
    ok: false, reason: "NOT_YOUR_TURN",
  }));
  mockEngine.state.turn = "computer";

  const payload = {
    x: 3,
    y: 7,
  };

  handlers.playerAttack(payload);
  expect(mockRenderAttackScreen).toHaveBeenCalledTimes(1);
  const [viewModel, uiState] = mockRenderAttackScreen.mock.calls[0];
  
  expect(uiState.errorMsg).toBe("NOT_YOUR_TURN"); 
});
test("handlePlayerAttack passes correct args to buildAttackMap helper", () => {
  mockEngine.playerAttack = jest.fn(() => ({
    ok: true,
    outcome: "miss",
  }));
  mockEngine.state.turn = "player";

  const payload = {
    x: 3,
    y: 7,
  };

  handlers.playerAttack(payload);
  expect(mockBuildAttackMap).toHaveBeenCalledTimes(2);
  const [attacks, ships] = mockBuildAttackMap.mock.calls[0];
  expect(mockBuildAttackMap).toHaveBeenCalledWith(
    expect.any(Array),
    expect.any(Array),
  );
});
test("handlePlayerAttack adds returned attackMaps to uiState", () => {
  const playerMap = new Map([["0,0", { outcome: "hit" }]]);
  const computerMap = new Map([["1,1", { outcome: "miss" }]]);

  mockBuildAttackMap
    .mockReturnValueOnce(playerMap)
    .mockReturnValueOnce(computerMap);
  
  mockEngine.playerAttack = jest.fn(() => ({
    ok: true,
    outcome: "miss",
  }));
  
  mockEngine.state.turn = "player";

  handlers.playerAttack({ x: 3, y: 7 });

  const [, uiState] = mockRenderAttackScreen.mock.calls[0];

  expect(uiState.playerAttackMap).toBe(playerMap);
  expect(uiState.computerAttackMap).toBe(computerMap);
});
test("handlePlayerAttack triggers computer attack after timeout and renders updated state", () => {
  jest.useFakeTimers();

  mockEngine.playerAttack = jest.fn(() => ({
    ok: true,
    outcome: "miss",
  }));

  mockEngine.computerAttack = jest.fn(() => ({
    x: 2,
    y: 5,
    outcome: "miss",
  }));

  mockEngine.state.turn = "player";

  handlers.playerAttack({ x: 3, y: 7 });

  expect(mockEngine.computerAttack).not.toHaveBeenCalled();
  expect(mockRenderAttackScreen).toHaveBeenCalledTimes(1);

  jest.runAllTimers();

  expect(mockEngine.computerAttack).toHaveBeenCalledTimes(1);
  expect(mockRenderAttackScreen).toHaveBeenCalledTimes(2);

  const [, secondUiState] = mockRenderAttackScreen.mock.calls[1];

  expect(secondUiState.computerAttack).toEqual({
    x: 2,
    y: 5,
    outcome: "miss",
  });

  jest.useRealTimers();
});

