// helpers to help the computer choose next attack coords
export function chooseComputerAttackCoords(engineState) {
  const playerGameboard = engineState.player.gameboard;
  
  const move = engineState.lastAttackHit ?
    getHuntCandidate(engineState.lastAttackHit.x, engineState.lastAttackHit.y, playerGameboard) :
    getRandomCandidate(playerGameboard);
  
  if (!move) return null;

  const [x, y] = move;
  return [x, y];
}

export function getHuntCandidate(x, y, playerGameboard) {
  let possibleCoords = [];
  possibleCoords.push([x + 1, y]);
  possibleCoords.push([x, y + 1]);
  possibleCoords.push([x - 1, y]);
  possibleCoords.push([x, y - 1]);

  possibleCoords = possibleCoords.filter(
    (coord) => coord[0] >= 0 && coord[0] <= 9 && coord[1] >= 0 && coord[1] <= 9,
  );

  possibleCoords = possibleCoords.filter(
    (coord) => !playerGameboard.hasBeenAttacked(coord[0], coord[1]),
  );

  if (possibleCoords.length === 0) { return null };

  const randomIndex = Math.floor(Math.random() * possibleCoords.length);
  const [huntX, huntY] = possibleCoords[randomIndex];

  return [huntX, huntY];
}

export function getRandomCandidate(playerGameboard) {
  const availableCells = [];

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (!playerGameboard.hasBeenAttacked(i, j)) {
        availableCells.push([i, j]);
      }
    }
  }

  const missedAttacks = playerGameboard.getMissedAttacks();

  const filteredCells = availableCells.filter(([x, y]) => {
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ].filter(([nx, ny]) => nx >= 0 && nx <= 9 && ny >= 0 && ny <= 9);

    return !neighbors.every(([nx, ny]) =>
      missedAttacks.some(([mx, my]) => mx === nx && my === ny),
    );
  });

  console.log("availableCells", availableCells.length);
  console.log("filteredCells", filteredCells.length);

  if (filteredCells.length === 0) { return null };

  const [x, y] =
    filteredCells[Math.floor(Math.random() * filteredCells.length)];

  return [x, y];
}