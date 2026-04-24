/**
 * @jest-environment jsdom
 */

const { initRenderers } = require("../src/renderers");

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
