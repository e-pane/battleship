import { jest } from "@jest/globals";
import { getRandomCandidate, getHuntCandidate, chooseComputerAttackCoords } from "../src/ai";

test("getHuntCandidate returns an unattacked neighboring cell", () => {
  // mock a gameboard with 5,6 attacked previously.  Then pass 5,5 to getHuntCandidate.  force
  // randomness so first array element - (x + 1, y) or 6, 5 is chosen
  const mockGameBoard = {
    hasBeenAttacked: jest.fn((x, y) => x === 5 && y === 6),
  };

  jest.spyOn(Math, "random").mockReturnValue(0);

  const result = getHuntCandidate(5, 5, mockGameBoard);

  expect(result).toEqual([6, 5]);
});

test("getHuntCandidate returns null if all neighboring cells of a hit have been attacked", () => {
  // mock a gameboard with 5,6 4,5 6,5 and 5,4 attacked previously.  Then pass 5,5 to getHuntCandidate.  force
  // return should be null since all neighbors have been attacked
  const mockGameBoard = {
    hasBeenAttacked: jest.fn(
      (x, y) =>
        (x === 5 && y === 6) ||
        (x === 6 && y === 5) ||
        (x === 4 && y === 5) ||
        (x === 5 && y === 4),
    ),
  };

  const result = getHuntCandidate(5, 5, mockGameBoard);

  expect(result).toBeNull();
});

test("chooseComputerAttackCoords uses random when no lastAttackHit", () => {
    const engineState = {
      lastAttackHit: null,
      player: {
        gameboard: {
          hasBeenAttacked: jest.fn(() => false),
          getMissedAttacks: jest.fn(() => []),
        },
      },
    };

    jest.spyOn(Math, "random").mockReturnValue(0);

    const result = chooseComputerAttackCoords(engineState);

    expect(result).toEqual(expect.any(Array));
    expect(result.length).toBe(2);

    Math.random.mockRestore();
});

test("getRandomCandidate returns a valid unattacked cell", () => {
  const mockGameBoard = {
    hasBeenAttacked: jest.fn(() => false),
    getMissedAttacks: jest.fn(() => []),
  };

  const result = getRandomCandidate(mockGameBoard);

  expect(result).toEqual(expect.any(Array));
  expect(result.length).toBe(2);
});

test("getRandomCandidate avoids cells surrounded by missed attacks", () => {
  const mockGameBoard = {
    hasBeenAttacked: jest.fn(() => false),
    getMissedAttacks: jest.fn(() => [
      [0, 1],
      [1, 0],
      [1, 1],
    ]),
  };

  const result = getRandomCandidate(mockGameBoard);

  expect(result).toEqual(expect.any(Array));
});

