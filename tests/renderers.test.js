/**
 * @jest-environment jsdom
 */
import { jest } from "@jest/globals";
import {
  initRenderers,
  renderAttackScreen,
  renderGrid,
  renderShipPlacementScreen,
  renderStartScreen,
} from "../src/renderers.js";

let cleanup;

beforeEach(() => {
  document.body.innerHTML = `<div id="app"></div>`;
});

afterEach(() => {
  jest.clearAllMocks();
  if (cleanup) {
    cleanup();
    cleanup = undefined;
  }
});
// test renderStartScreen
test("clicking start button dispatches startGame with playerName", () => {
  document.body.innerHTML = `
        <input id="player-name" value="Harry" />
        <button data-action="startGame">Start Game</button>
    `;

  const mockController = {
    dispatch: jest.fn(),
    getPhase: jest.fn(),
  };

  initRenderers(mockController);
  document.querySelector("[data-action='startGame']").click();

  expect(mockController.dispatch).toHaveBeenCalledTimes(1);
  expect(mockController.dispatch).toHaveBeenCalledWith("startGame", {
    playerName: "Harry",
  });
});
// test renderShipPlacementScreen
test("clicking on ship, entering starting x/y/orientation dispatches placeShip with form data", () => {
  document.body.innerHTML = `

    <div class="ship-icons">
      <button type="button" class="ship-btn carrier" data-ship="carrier">Carrier</button>
      <button type="button" class="ship-btn battleship" data-ship="battleship">Battleship</button>
    </div>

    <input id="ship-x" value= "C" />
    <input id="ship-y" value= "3" />

    <label>
      <input type="radio" name="orientation" value="horizontal" checked>
      Horizontal
    </label>

    <label>
      <input type="radio" name="orientation" value="vertical">
      Vertical
    </label>

    <button data-action="placeShip">Place Ship</button>
  `;

  const mockController = {
    dispatch: jest.fn(),
    getPhase: jest.fn(() => 'shipPlacement'),
  };

  cleanup = initRenderers(mockController);

  document.querySelector(".ship-btn.carrier").click();
  document.querySelector('[data-action="placeShip"]').click();
  expect(
    document.querySelector(".ship-btn.carrier").classList.contains("selected"),
  ).toBe(true);

  expect(mockController.dispatch).toHaveBeenCalledTimes(1);
  expect(mockController.dispatch).toHaveBeenCalledWith("placeShip", {
    shipType: "carrier",
    x: "C",
    y: "3",
    orient: "horizontal",
  });
});

test("clicking an empty grid cell updates ship-x and ship-y inputs", () => {
  document.body.innerHTML = `
    <div class="cell" data-x="1" data-y="3"></div>
    <input id="ship-x">
    <input id="ship-y">
    <input type="radio" name="orientation" value="horizontal" checked />
    <button data-action="placeShip">Place Ship</button>
  `;

  const mockController = {
    dispatch: jest.fn(),
    getPhase: jest.fn(() => "shipPlacement"),
  };

  const cleanup = initRenderers(mockController);

  document.querySelector(".cell").click();

  expect(document.querySelector("#ship-x").value).toBe("D");
  expect(document.querySelector("#ship-y").value).toBe("2");
});

test("clicking a grid cell with a ship calls sends removeShip intent to dispatch with coord payload", () => {
  document.body.innerHTML = `
    <div class="cell ship" data-x="2" data-y="5"></div>
  `;

  const mockController = {
    dispatch: jest.fn(),
    getPhase: jest.fn(() => "shipPlacement"),
  };

  const cleanup = initRenderers(mockController);

  document.querySelector(".cell.ship").click();
  expect(mockController.dispatch).toHaveBeenCalledTimes(1);
  expect(mockController.dispatch).toHaveBeenCalledWith("removeShip", {
    x: "2",
    y: "5",
  });
});

test("placeShip does nothing if no ship selected", () => {
  document.body.innerHTML = `
    <input id="ship-x" value="A">
    <input id="ship-y" value="1">
    <input type="radio" name="orientation" value="horizontal" checked />
    <button data-action="placeShip">Place Ship</button>
  `;

  const mockController = {
    dispatch: jest.fn(),
    getPhase: jest.fn(() => "shipPlacement"),
  };

  const cleanup = initRenderers(mockController);

  document.querySelector('[data-action="placeShip"]').click();
  expect(mockController.dispatch).not.toHaveBeenCalled();
});

test("placeShip does nothing if no orientation selected", () => {
  document.body.innerHTML = `
    <div class="ship-icons">
      <button type="button" class="ship-btn carrier" data-ship="carrier">Carrier</button>
    </div>  
    <input id="ship-x" value="A">
    <input id="ship-y" value="1">
    <input type="radio" name="orientation" value="horizontal"/>
    <button data-action="placeShip">Place Ship</button>
  `;

  const mockController = {
    dispatch: jest.fn(),
    getPhase: jest.fn(() => "shipPlacement"),
  };

  const cleanup = initRenderers(mockController);

  document.querySelector(".ship-btn.carrier").click();

  document.querySelector('[data-action="placeShip"]').click();
  expect(mockController.dispatch).not.toHaveBeenCalled();
});

test("selecting a ship deselects other ships", () => {
  document.body.innerHTML = `
    <button class="ship-btn" data-ship="carrier"></button>
    <button class="ship-btn" data-ship="battleship"></button>
  `;

  const mockController = {
    dispatch: jest.fn(),
    getPhase: jest.fn(() => "shipPlacement"),
  };

  const cleanup = initRenderers(mockController);

  const carrierBtn = document.querySelector('[data-ship="carrier"]');
  const battleshipBtn = document.querySelector('[data-ship="battleship"]');

  carrierBtn.click();
  expect(carrierBtn.classList.contains("selected")).toBe(true);

  battleshipBtn.click();
  expect(carrierBtn.classList.contains("selected")).toBe(false);
  expect(battleshipBtn.classList.contains("selected")).toBe(true);
});

test("renderShipPlacementScreen paints grid on screen", () => {
  const state = {
    ships: [
      {
        ship: { type: "destroyer" },
        coords: [
          [0, 0],
          [1, 0],
        ],
      },
    ],
  };

  renderShipPlacementScreen(state, {});

  const shipCell = document.querySelector('.cell[data-x="0"][data-y="0"]');
  expect(shipCell.classList.contains("ship")).toBe(true);
  expect(shipCell.textContent).toBe("D");
});

test("renderGrid creates 100 cells with correct zero-indexed coordinates", () => {
  const container = document.createElement("div");
  container.innerHTML = "<p>junk</p>";

  renderGrid(container);

  const cells = container.querySelectorAll(".cell");

  expect(cells.length).toBe(100);

  const cell00 = container.querySelector('[data-x="0"][data-y="0"]');
  const cell99 = container.querySelector('[data-x="9"][data-y="9"]');
  const cell34 = container.querySelector('[data-x="4"][data-y="3"]');

  expect(cell00).not.toBeNull();
  expect(cell99).not.toBeNull();
  expect(cell34).not.toBeNull();

  expect(container.innerHTML).not.toContain("junk");
});

test("renderShipPlacementScreen displays error message when uiState.errorMsg is set", () => {
  const state = { ships: [] };

  renderShipPlacementScreen(state, { errorMsg: "OVERLAP" });

  const errorBox = document.querySelector(".ship-error-msg");

  expect(errorBox.textContent).toBe("Ship overlaps another ship.");
});

test("error msg cleared after timeout", () => {
  jest.useFakeTimers();

  const state = { ships: [] };

  renderShipPlacementScreen(state, { errorMsg: "OVERLAP" });

  const errorBox = document.querySelector(".ship-error-msg");

  jest.advanceTimersByTime(5000);

  expect(errorBox.textContent).toBe("");
});

test("placementComplete block of renderShipPlacementScreen mutates the DOM correctly", () => {
  // mock state to meet conditional block requirements
  const state = {
    requiredShips: 5,
    ships: [
      { ship: { type: "carrier" }, coords: [] },
      { ship: { type: "battleship" }, coords: [] },
      { ship: { type: "cruiser" }, coords: [] },
      { ship: { type: "submarine" }, coords: [] },
      { ship: { type: "destroyer" }, coords: [] },
    ],
  };

  renderShipPlacementScreen(state, {});
  // get reference to the btn the DOM should display
  const btn = document.querySelector(".start-attack-btn");
  expect(btn).not.toBeNull();
  expect(btn.textContent).toBe("Enter Attack Mode");
});
// test renderAttackScreen
test("renderAttackScreen creates both boards and messaging area", () => {
  // mock gameState and uiState passed to renderAttackScreen
  const gameState = {
    player: { name: "TestPlayer" },
    computer: {},
    playerShips: [],
    computerShips: [],
  };

  const uiState = {
    currentPhase: "attack",
    turnText: "Player Turn",
    turnInstruction: "Attack",
    playerAttackMap: new Map(),
    computerAttackMap: new Map(),
    playerSunkShips: [],
    computerSunkShips: [],
    errorMsg: null,
    playerAttack: null,
    computerAttack: null,
  };

  renderAttackScreen(gameState, uiState);
  // assert that 2 gameboards with grids and a message area are added to the DOM
  expect(document.querySelector(".computer-board")).not.toBeNull();
  expect(document.querySelector(".player-board")).not.toBeNull();

  expect(document.querySelector(".computer-grid")).not.toBeNull();
  expect(document.querySelector(".player-grid")).not.toBeNull();

  expect(document.querySelector(".game-message")).not.toBeNull();
});
test("renderAttackScreen renders computer grid labels 1–10 and A–J", () => {
  // mock gameState and uiState passed to renderAttackScreen
  const gameState = {
    player: { name: "TestPlayer" },
    computer: {},
    playerShips: [],
    computerShips: [],
  };

  const uiState = {
    currentPhase: "attack",
    turnText: "Player Turn",
    turnInstruction: "Attack",
    playerAttackMap: new Map(),
    computerAttackMap: new Map(),
    playerSunkShips: [],
    computerSunkShips: [],
    errorMsg: null,
    playerAttack: null,
    computerAttack: null,
  };

  renderAttackScreen(gameState, uiState);

  const computerTopLabels = document.querySelectorAll(".computer-top-labels div");
  const computerLeftLabels = document.querySelectorAll(".computer-left-labels div");

  expect(computerTopLabels).toHaveLength(10);
  expect(computerLeftLabels).toHaveLength(10);

  expect(computerTopLabels[0].textContent).toBe("1");
  expect(computerTopLabels[9].textContent).toBe("10");

  expect(computerLeftLabels[0].textContent).toBe("A");
  expect(computerLeftLabels[9].textContent).toBe("J");
});
test("renderAttackScreen renders sunk ships containers", () => {
  const gameState = {
    player: { name: "TestPlayer" },
    computer: {},
    playerShips: [],
    computerShips: [],
  };

  const uiState = {
    currentPhase: "attack",
    turnText: "Player Turn",
    turnInstruction: "Attack",
    playerAttackMap: new Map(),
    computerAttackMap: new Map(),
    playerSunkShips: [],
    computerSunkShips: [],
    errorMsg: null,
    playerAttack: null,
    computerAttack: null,
  };

  renderAttackScreen(gameState, uiState);

  const compList = document.querySelector(".computer-ships-sunk ul");
  const playerList = document.querySelector(".player-ships-sunk ul");

  expect(compList).not.toBeNull();
  expect(playerList).not.toBeNull();
});
test("renderAttackScreen populates sunk ship lists", () => {
  const gameState = {
    player: { name: "TestPlayer" },
    computer: {},
    playerShips: [],
    computerShips: [],
  };

  const uiState = {
    currentPhase: "attack",
    turnText: "Player Turn",
    turnInstruction: "Attack",
    playerAttackMap: new Map(),
    computerAttackMap: new Map(),
    playerSunkShips: ["destroyer"],
    computerSunkShips: ["carrier", "submarine"],
    errorMsg: null,
    playerAttack: null,
    computerAttack: null,
  };

  renderAttackScreen(gameState, uiState);

  const compList = document.querySelector(".computer-ships-sunk ul");
  const playerList = document.querySelector(".player-ships-sunk ul");

  const compItems = compList.querySelectorAll("li");
  const playerItems = playerList.querySelectorAll("li");

  expect(compItems).toHaveLength(2);
  expect(playerItems).toHaveLength(1);

  expect(compItems[0].textContent).toBe("carrier");
  expect(compItems[1].textContent).toBe("submarine");

  expect(playerItems[0].textContent).toBe("destroyer");
});
test("renderAttackScreen renders who's turn it is", () => {
  const gameState = {
    computer: {},
    player: {name: 'Bob'},
    computerShips: [],
    playerShips: [],
  };
  const uiState = {
    currentPhase: "attack",
    turnText: `It's ${gameState.player.name}'s turn`,
    turnInstruction: "Click on a cell in the computer's grid to attack",
    playerAttackMap: new Map(),
    computerAttackMap: new Map(),
    playerSunkShips: ["destroyer"],
    computerSunkShips: ["carrier", "submarine"],
    errorMsg: null,
    playerAttack: null,
    computerAttack: null,
  };

  renderAttackScreen(gameState, uiState);

  const turnMessage = document.querySelector(".game-message .turn-message");

  expect(turnMessage).not.toBeNull();
  expect(turnMessage.innerHTML).toContain
    ("It's Bob's turn. Click on a cell in the computer's grid to attack");
});
test("renderAttackScreen renders winner message and new game button when game is over", () => {
  
});