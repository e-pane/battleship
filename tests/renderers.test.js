/**
 * @jest-environment jsdom
 */
import { jest } from "@jest/globals";
import { initRenderers, renderShipPlacementScreen, renderStartScreen } from "../src/renderers.js";

beforeEach(() => {
  document.body.innerHTML = `
    <div id="app"></div>
    <ul class="ships-placed"></ul>
  `;
});

test("clicking start button dispatches startGame with playerName", () => {
  document.body.innerHTML = `
        <input id="player-name" value="Harry" />
        <button data-action="startGame">Start Game</button>
    `;

  const mockController = {
    dispatch: jest.fn(),
  };

  initRenderers(mockController);
  document.querySelector("[data-action='startGame']").click();

  expect(mockController.dispatch).toHaveBeenCalledTimes(1);
  expect(mockController.dispatch).toHaveBeenCalledWith("startGame", {
    playerName: "Harry",
  });
});

test("clicking on ship, entering starting x/y/orientation dispatches placeShip with form data", () => {
  document.body.innerHTML = `

    <div class="ship-icons">
      <button type="button" class="ship-btn carrier" data-ship="carrier">Carrier</button>
      <button type="button" class="ship-btn battleship" data-ship="battleship">Battleship</button>
    </div>

    <input id="ship-x" value= "3" />
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
  };

  initRenderers(mockController);
  document.querySelector(".ship-btn.carrier").click();
  document.querySelector('[data-action="placeShip"]').click();

  expect(mockController.dispatch).toHaveBeenCalledTimes(1);
  expect(mockController.dispatch).toHaveBeenCalledWith("placeShip", {
    shipType: "carrier",
    x: "3",
    y: "3",
    orient: "horizontal",
  });
});

test("shows ships after placement", () => {
  const mockShips = [
    {
      ship: {
        type: "destroyer",
        length: 3,
        hit: () => {},
        isSunk: () => false,
      },
      coords: [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
    },
    {
      ship: {
        type: "submarine",
        length: 3,
        hit: () => {},
        isSunk: () => false,
      },
      coords: [
        [5, 5],
        [5, 6],
        [5, 7],
      ],
    },
  ];

  const mockState = {
    ships: mockShips,
    phase: "shipPlacement",
  };

  renderShipPlacementScreen(mockState);
  const shipList = document.querySelector(".ships-placed");
  expect(shipList.querySelectorAll("li").length).toBe(2);
  expect(shipList.textContent).toContain("destroyer");
  expect(shipList.textContent).toContain("submarine");

  const items = shipList.querySelectorAll("li");
  expect(items[0].tagName).toBe("LI");
  expect(items[1].tagName).toBe("LI");
  expect(items[0].textContent).toBe("destroyer");
  expect(items[1].textContent).toBe("submarine");
});
