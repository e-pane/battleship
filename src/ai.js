// helpers to help the computer choose next attack coords

// Level 1 random hunt helper to choose random attack coord
export function getLevel1Candidate(playerGameboard) {
  const availableCells = [];

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (!playerGameboard.hasBeenAttacked(i, j)) {
        availableCells.push([i, j]);
      }
    }
  }

  if (availableCells.length === 0) {
    return null;
  }

  const [x, y] = availableCells[Math.floor(Math.random() * availableCells.length)];
  return [x, y];
}
//Level 2 helper to choose attack coord
export function getLevel2Candidate(playerGameboard, lastAttackHit) {

  if (lastAttackHit) {
    const { x, y } = lastAttackHit;
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

    if (possibleCoords.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * possibleCoords.length);
    const [huntX, huntY] = possibleCoords[randomIndex];

    return [huntX, huntY];
  } else {
    const availableCells = [];
    const missedAttacks = playerGameboard.getMissedAttacks();

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (!playerGameboard.hasBeenAttacked(i, j)) {
          availableCells.push([i, j]);
        }
      }
    }

    if (availableCells.length === 0) {
      return null;
    }
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
    
    if (filteredCells.length === 0) {
      return null
    }
    const [x, y] = filteredCells[Math.floor(Math.random() * filteredCells.length)];
    return [x, y];
  }
}

//Level 3 helper to choose attack coord
export function getLevel3Candidate(playerGameboard) {
  // scan the board for any hit, but unSunk ships
  const hitUnsunkShips = playerGameboard.getShips().filter(({ ship, coords }) =>
    !ship.isSunk() &&
    coords.some(([x, y]) => playerGameboard.getAttacks().includes(`${x},${y}`))
  );

  if (hitUnsunkShips.length !== 0) {
    // enter targeted hunt mode
    if (hitUnsunkShips.length === 1) {
      // there's only one hitUnsunk ship, so pass it to the hunt helper
      const targetShip = hitUnsunkShips[0];
      return huntTargetHelper(playerGameboard, targetShip);
    } else {
      // scan the array of hitUnsunkShips to find the one closest to being sunk and pass that to helper
      const targetShip = hitUnsunkShips.reduce((target, current) => {
        return (current.ship.length - current.ship.timesHit) <
          (target.ship.length - target.ship.timesHit)
          ? current : target;
      });
      return huntTargetHelper(playerGameboard, targetShip);
    }
  } else {
    // enter random attack mode
    const unHitUnsunkShips = playerGameboard.getShips().filter(({ ship, coords }) =>
          !ship.isSunk() &&
          !coords.some(([x, y]) => playerGameboard.getAttacks().includes(`${x},${y}`))
      );
    const uniqueCandidatesFromLevel1 = new Set();
    const unHitUnsunkShipLengths = [];

    unHitUnsunkShips.forEach((ship) => { unHitUnsunkShipLengths.push(ship.ship.length) });
    unHitUnsunkShipLengths.sort((a, b) => a - b);

    // arrray of objects of form: [ {coords: [3,4], score: [7,5] }, etc..] where 7 is length of N/S available track
    const unHitUnsunkCandidates = [];

    let trackLength = 0;
    let attempts = 0;

    do {
      const coordCandidate = getLevel1Candidate(playerGameboard);
      const [x, y] = coordCandidate;
      const setKey = `${x},${y}`;

      if (uniqueCandidatesFromLevel1.has(setKey)) {
        continue;
      }

      uniqueCandidatesFromLevel1.add(setKey);

      const candidate = {
        coords: [x, y],
        score: {
          northSouth: 0,
          eastWest: 0
        }
      }

      let NorthY = y - 1;
      let SouthY = y + 1;
      let EastX = x + 1;
      let WestX = x - 1;

      while (NorthY >= 0 && !playerGameboard.hasBeenAttacked(x, NorthY)) {
        trackLength++;
        NorthY--;
      }
      while (SouthY <= 9 && !playerGameboard.hasBeenAttacked(x, SouthY)) {
        trackLength++;
        SouthY++;
      }
      const northSouthTrack = trackLength;
      trackLength = 0;

      while (EastX <= 9 && !playerGameboard.hasBeenAttacked(EastX, y)) {
        trackLength++;
        EastX++;
      }
      while (WestX >= 0 && !playerGameboard.hasBeenAttacked(WestX, y)) {
        trackLength++;
        WestX--;
      }

      const eastWestTrack = trackLength;
      trackLength = 0;

      if (northSouthTrack + 1 >= unHitUnsunkShipLengths[0]) {
        candidate.score.northSouth = northSouthTrack;
      }

      if (eastWestTrack + 1 >= unHitUnsunkShipLengths[0]) {
        candidate.score.eastWest = eastWestTrack;
      }

      if (candidate.score.eastWest > 0 || candidate.score.northSouth > 0) {
        unHitUnsunkCandidates.push(candidate);
      }

      attempts++;

    } while (unHitUnsunkCandidates.length < 20 && attempts < 100);

    //calculate total score of each candidate
    unHitUnsunkCandidates.forEach((candidate) => {
      const totalScore = candidate.score.northSouth + candidate.score.eastWest;
      candidate.totalScore = totalScore;
      console.log(unHitUnsunkCandidates);
      console.log(totalScore)
    });

    const bestCandidate = unHitUnsunkCandidates.reduce((best, candidate) => {
      return candidate.totalScore > best.totalScore ? candidate : best;
    });

    const [x, y] = bestCandidate.coords;
    return [x, y];
  }
}

// helper to hunt down a ship until sunk
function huntTargetHelper(playerGameboard, ship) {
  // get ship's hit coords and check if there is more than 1.  If so, get orientation & hunt uniaxially
  const hitCoords = ship.ship.getHitCoords();

  if (hitCoords.length > 1) {
    const orientation = hitCoords.every((coord) => coord[0] === hitCoords[0][0]) ?
      "vertical" : "horizontal";
  
    if (orientation === "vertical") {
      const northMostHitCell = hitCoords.reduce((acc, current) => {
        return acc[1] < current[1] ? acc : current;
      });
    
      const [northX, northY] = northMostHitCell;
      const northCandidate = [northX, northY - 1];

      if (northCandidate[1] >= 0 &&
        !playerGameboard.hasBeenAttacked(northCandidate[0], northCandidate[1])) {
        return northCandidate;
      } 

      const southMostHitCell = hitCoords.reduce((acc, current) => {
        return acc[1] > current[1] ? acc : current;
      });

      const [southX, southY] = southMostHitCell;
      const southCandidate = [southX, southY + 1];

      if (
        southCandidate[1] <= 9 &&
        !playerGameboard.hasBeenAttacked(southCandidate[0], southCandidate[1])
      ) {
        return southCandidate;
      }

      // edge case if N and S searches terminate and cell between termini still not hit
      if (!ship.ship.isSunk()) {
        for (let y = northY + 1; y < southY; y++) {
          if (!playerGameboard.hasBeenAttacked(northX, y)) {
            return [northX, y];
          }
        }
      }
    }
    // else, must be horizontal, so hunt East/West
    else {
      const westMostHitCell = hitCoords.reduce((acc, current) => {
        return acc[0] < current[0] ? acc : current;
      });

      const [westX, westY] = westMostHitCell;
      const westCandidate = [westX - 1, westY];

      if (
        westCandidate[0] >= 0 &&
        !playerGameboard.hasBeenAttacked(westCandidate[0], westCandidate[1])
      ) {
        return westCandidate;
      } 

      const eastMostHitCell = hitCoords.reduce((acc, current) => {
        return acc[0] > current[0] ? acc : current;
      });

      const [eastX, eastY] = eastMostHitCell;
      const eastCandidate = [eastX + 1, eastY];

      if (
        eastCandidate[0] <= 9 &&
        !playerGameboard.hasBeenAttacked(eastCandidate[0], eastCandidate[1])
      ) {
        return eastCandidate;
      }

      if (!ship.ship.isSunk()) {
        for (let x = westX + 1; x < eastX; x++) {
          if (!playerGameboard.hasBeenAttacked(x, westY)) {
            return [x, westY];
          }
        }
      }
    }
  }
  //else, there's only one hit point, so need to call the trackLength helper to see if N/S is viable
  else {
    let trackLength = 0;

    const [x, y] = hitCoords[0];

    let NorthY = y - 1;
    let SouthY = y + 1;
    let EastX = x + 1;
    let WestX = x - 1;

    while (NorthY >= 0 && !playerGameboard.hasBeenAttacked(x, NorthY)) {
      trackLength++;
      NorthY--;
    }
    while (SouthY <= 9 && !playerGameboard.hasBeenAttacked(x, SouthY)) {
      trackLength++;
      SouthY++;
    }
    const northSouthTrack = trackLength;
    trackLength = 0;

    if (northSouthTrack + 1 >= ship.ship.length) {
      const northCandidate = [x, y - 1];

      if (
        northCandidate[1] >= 0 &&
        !playerGameboard.hasBeenAttacked(northCandidate[0], northCandidate[1])
      ) {
        return northCandidate;
      }

      const southCandidate = [x, y + 1];

      if (
        southCandidate[1] <= 9 &&
        !playerGameboard.hasBeenAttacked(southCandidate[0], southCandidate[1])
      ) {
        return southCandidate;
      }
    }
    // If N/S doesn't produce a candidate, hunt E/W.
    const westCandidate = [WestX, y];

    if (
      westCandidate[0] >= 0 &&
      !playerGameboard.hasBeenAttacked(westCandidate[0], westCandidate[1])
    ) {
      return westCandidate;
    } else {
      const eastCandidate = [EastX, y];

      if (
        eastCandidate[0] <= 9 &&
        !playerGameboard.hasBeenAttacked(eastCandidate[0], eastCandidate[1])
      ) {
        return eastCandidate;
      }
    }
  }
}

  //     ship: {
  //       type: "carrier",
  //       length: 5,
  //       hit(),
  //       isSunk()
  //     },
  //     coords: [
  //       [x, y],
  //       [x, y],
  //       [x, y],
  //       [x, y],
  //       [x, y]
  //     ]
  //   },

// ship.isSunk()
// ship.length

// const ships = [];
// const occupied = new Set();
// const missedAttacks = [];
// const attacked = new Set();
// const lastHitCoords = null;

// gameboard.getShips 
// gameboard.hasBeenAttacked 
// gameboard.getAttacks 
// gameboard.getMissedAttacks 
// gameboard.hasShipAt 
// gameboard.receiveAttack 
// gameboard.allShipsSunk 
