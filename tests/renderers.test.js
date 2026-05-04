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
  };

  initRenderers(mockController);
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
    <div class="cell" data-x="2" data-y="5"></div>
    <input id="ship-x">
    <input id="ship-y">
    <input type="radio" name="orientation" value="horizontal" checked />
    <button data-action="placeShip">Place Ship</button>
  `;

  const mockController = {
    dispatch: jest.fn(),
  };

  initRenderers(mockController);

  document.querySelector(".cell").click();

  expect(document.querySelector("#ship-x").value).toBe("2");
  expect(document.querySelector("#ship-y").value).toBe("5");
});

test("clicking a grid cell with a ship calls sends removeShip intent to dispatch with coord payload", () => {
  document.body.innerHTML = `
    <div class="cell ship" data-x="2" data-y="5"></div>
  `;

  const mockController = {
    dispatch: jest.fn(),
  };

  initRenderers(mockController);

  document.querySelector(".cell.ship").click();
  expect(mockController.dispatch).toHaveBeenCalledTimes(1);
  expect(mockController.dispatch).toHaveBeenCalledWith("removeShip", {
    x: "2",
    y: "5",
  });
});


