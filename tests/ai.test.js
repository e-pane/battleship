import { jest } from "@jest/globals";
import { getLevel1Candidate, getLevel2Candidate, getLevel3Candidate } from "../src/ai.js";

test("Level 1 returns an un-attacked coordinate", () => {
  const mockGameBoard = {
    hasBeenAttacked: jest.fn((x, y) => x === 5 && y === 6),
  };

  const candidate = getLevel1Candidate(mockGameBoard);

  expect(candidate).not.toBeNull();
  const [x, y] = candidate;
  expect(x).toBeGreaterThanOrEqual(0);
  expect(x).toBeLessThanOrEqual(9);

  expect(y).toBeGreaterThanOrEqual(0);
  expect(y).toBeLessThanOrEqual(9);
  
  expect(mockGameBoard.hasBeenAttacked(x, y)).toBe(false);
});

test("Level 1 returns null when no cells are available", () => {
  const mockGameBoard = {
    hasBeenAttacked: jest.fn(() => true),
  };

  const candidate = getLevel1Candidate(mockGameBoard);
  expect(candidate).toBeNull();
});

test("Level 2 chooses an unattacked neighbor after a hit", () => {
  const mockGameBoard = { 
    hasBeenAttacked: jest.fn((x, y) => x === 5 && y === 6),
  };

  const lastAttackHit = { x: 5, y: 5 };
  const candidate = getLevel2Candidate(mockGameBoard, lastAttackHit);
  expect(candidate).not.toBeNull();
  expect(candidate).not.toEqual([5, 6]);
  expect([
    [6, 5],
    [4, 5],
    [5, 4],
  ]).toContainEqual(candidate);
});

test(
  "Level 2 chooses a candidate based on missed attacks when there is no previous hit", () => {
    const mockGameBoard = {
      hasBeenAttacked: jest.fn(
        (x, y) =>
          (x === 5 && y === 4) ||
          (x === 5 && y === 6) ||
          (x === 4 && y === 5) ||
          (x === 6 && y === 5),
      ),
      getMissedAttacks: jest.fn(() => [
        [5, 4],
        [5, 6],
        [4, 5],
        [6, 5],
      ]),
    };
    const lastAttackHit = null;
    const candidate = getLevel2Candidate(mockGameBoard, lastAttackHit);

    expect(candidate).not.toBeNull();
    expect(candidate).not.toEqual([5, 5]);
  }
);

test("Level 3 targets an unsunk ship that has already been hit", () => {
  const mockGameBoard = {
    getShips: jest.fn(() => [
      {
        ship: {
          type: "destroyer",
          length: 2,
          getHitCoords: jest.fn(() => [[5, 5]]),
          isSunk: jest.fn(() => false),
        },
        coords: [
          [5,5],
          [5,4],
        ]
      },
    ]),
    getAttacks: jest.fn(() => ["5,5"]),
    hasBeenAttacked: jest.fn(
      (x, y) => x === 5 && y === 5
    ),
  };

  const candidate = getLevel3Candidate(mockGameBoard);
  expect(candidate).not.toBeNull();

  expect([
    [6, 5],
    [4, 5],
    [5, 4],
    [5, 6]
  ]).toContainEqual(candidate);

  const [x,y] = candidate
  expect(mockGameBoard.hasBeenAttacked(x, y)).toBe(false);
});

test("Level 3 hunts along the ship's orientation after multiple hits", () => {
  const mockGameBoard = {
    getShips: jest.fn(() => [
      {
        ship: {
          type: "submarine",
          length: 3,
          getHitCoords: jest.fn(() => [[5, 5], [5, 6]]),
          isSunk: jest.fn(() => false),
        },
        coords: [
          [5, 5],
          [5, 4],
          [5, 6],
        ],
      },
    ]),
    getAttacks: jest.fn(() => ["5,5", "5,6"]),
    hasBeenAttacked: jest.fn(
      (x, y) =>
        (x === 5 && y === 5) ||
        (x === 5 && y === 6)
    ),
  };
  const candidate = getLevel3Candidate(mockGameBoard);
  expect(candidate).not.toBeNull();
  expect(candidate).toEqual([5, 4]);
});

test("Level 3 hunt chooses the hitUnsunk ship closest to being sunk if there are more than one", () => {
  const mockGameBoard = {
    getShips: jest.fn(() => [
      {
        ship: {
          type: "submarine",
          length: 3,
          timesHit: 2,
          getHitCoords: jest.fn(() => [
            [5, 5],
            [5, 6],
          ]),
          isSunk: jest.fn(() => false),
        },
        coords: [
          [5, 5],
          [5, 4],
        ],
      },
      {
        ship: {
          type: "carrier",
          length: 5,
          timesHit: 1,
          getHitCoords: jest.fn(() => [[0, 0]]),
          isSunk: jest.fn(() => false),
        },
        coords: [
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
        ],
      },
    ]),
    getAttacks: jest.fn(() => ["5,5", "5,6", "0,0"]),
    hasBeenAttacked: jest.fn(
      (x, y) =>
        (x === 5 && y === 5) || (x === 5 && y === 6) || (x === 0 && y === 0),
    ),
  };
  const candidate = getLevel3Candidate(mockGameBoard);
  expect(candidate).not.toBeNull();
  expect(candidate).toEqual([5, 4]);
});

test("Level 3 targets an un-attacked cell between two hits when both ends are blocked", () => {
  const mockGameBoard = {
    getShips: jest.fn(() => [
      {
        ship: {
          type: "cruiser",
          length: 3,
          getHitCoords: jest.fn(() => [
            [5, 5],
            [5, 7],
          ]),
          isSunk: jest.fn(() => false),
        },

        coords: [
          [5, 5],
          [5, 6],
          [5, 7],
        ],
      },
    ]),

    getAttacks: jest.fn(() => ["5,4", "5,5", "5,7", "5,8"]),

    hasBeenAttacked: jest.fn(
      (x, y) =>
        (x === 5 && y === 4) ||
        (x === 5 && y === 5) ||
        (x === 5 && y === 7) ||
        (x === 5 && y === 8),
    ),
  };

  const candidate = getLevel3Candidate(mockGameBoard);

  expect(candidate).toEqual([5, 6]);
});