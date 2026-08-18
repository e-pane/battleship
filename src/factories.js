export const SHIP_TYPES = {
  destroyer: 2,
  submarine: 3,
  cruiser: 3,
  battleship: 4,
  carrier: 5,
};

export function createShip(shipType) {
    let timesHit = 0;
    const hitCoords = [];
    const length = SHIP_TYPES[shipType];

    return {
      type: shipType,
      length,
      get timesHit() {
        return timesHit;
      },
      hit(x, y) {
        timesHit++;
        hitCoords.push([x, y]);
      },
      getHitCoords() {
        return hitCoords;
      },
      isSunk() {
        return timesHit >= length;
      },
    };
}
// gameboard factory helper
export function getShipCoords(ship, x, y, orient) {
  const coords = [];

  for (let i = 0; i < ship.length; i++) {
    if (orient === "horizontal") coords.push([x + i, y]);
    else coords.push([x, y + i]);
  }

  return coords;
}
// gameboard factory helper
export function parseCoord(x, y) {
  // if already numeric, return as-is
  if (Number.isInteger(x) && Number.isInteger(y)) {
    return [x, y];
  }

  // convert "C", "5" → [4, 2]
  const row = x.toUpperCase().charCodeAt(0) - 65; // A-J
  const col = Number(y) - 1; // 1-10
  return [col, row];
}

export function createGameboard() {

  const gameboard = Object.create(null);

  const ships = [];
  const occupied = new Set();

  const missedAttacks = [];
  const attacked = new Set();
  const lastHitCoords = null;
  

  gameboard.getShips = () => ships;

  gameboard.hasBeenAttacked = (x, y) => {
    return attacked.has(`${x},${y}`);
  };

  gameboard.getAttacks = () => {
    return Array.from(attacked);
  }

  gameboard.getMissedAttacks = () => {
    return missedAttacks;
  };

  gameboard.canPlaceShip = (ship, x, y, orient) => {
    if (ships.some(el => el.ship.type === ship.type)) {
      return {
        ok: false,
        reason: "SHIP_ALREADY_PLACED",
      };
    }

    if (x < 0 || x > 9 || y < 0 || y > 9) {
      return { ok: false, reason: "INVALID_START" };
    }

    if (orient === "horizontal" && x + ship.length > 10) {
      return {
        ok: false,
        reason: "OUT_OF_BOUNDS",
      };
    }
    if (orient === "vertical" && y + ship.length > 10) {
      return {
        ok: false,
        reason: "OUT_OF_BOUNDS"
      };
    }

    const coords = getShipCoords(ship, x, y, orient);

    if (coords.some(([cx, cy]) => occupied.has(`${cx},${cy}`))) {
      return { ok: false, reason: "OVERLAP" };
    }

    return { ok: true };
  };

  gameboard.placeShip = (ship, x, y, orient) => {
    [x, y] = parseCoord(x, y);

    const result = gameboard.canPlaceShip(ship, x, y, orient);

    if (!result.ok) return result;

    const coords = getShipCoords(ship, x, y, orient);

    coords.forEach(([cx, cy]) => occupied.add(`${cx},${cy}`));

    ships.push({ ship, coords });

    return {
      ok: true,
      ship,
    };
  };

  gameboard.removeShip = (ship) => {
    const idx = ships.findIndex(el => el.ship.type === ship.ship.type);

    if (idx !== -1) {
      ships[idx].coords.forEach((coord) => {
        const stringCoord = `${coord[0]},${coord[1]}`;
        occupied.delete(stringCoord);
      });
      ships.splice(idx, 1);
    };

    return {
      ok: true
    };
  }

  // ships = [
  //   {
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
  //   {
  //     ship: {
  //       type: "destroyer",
  //       length: 2,
  //       hit(),
  //       isSunk()
  //     },
  //     coords: [
  //       [x, y],
  //       [x, y]
  //     ]
  //   }
  // ]

  gameboard.hasShipAt = (x, y) => {
    return occupied.has(`${x},${y}`);
  }
  // split attack conditionally - if cell already attacked return false/already_attacked, 
  // if new cell, add it to attacked set, then branch again, if hit, call ship.hit instance method
  // and return true/hit. if miss, add coord to missedAttacks array and return true/miss
  gameboard.receiveAttack = (x, y) => {
    const key = `${x},${y}`;

    if (attacked.has(key)) {
      return {
        ok: false,
        reason: "ALREADY_ATTACKED",
      };
    }

    attacked.add(key);

    for (const el of ships) {
      for (const coord of el.coords) {
        if (coord[0] === x && coord[1] === y) {
          el.ship.hit(x,y);
          return {
            ok: true,
            outcome: "hit",
            lastHitCoords: { x, y },
            sunk: el.ship.isSunk(),
          };
        }
      }
    }
    missedAttacks.push([x, y]);
    return {
      ok: true,
      outcome: "miss",
    };
  };

  gameboard.allShipsSunk = () => {
    return ships.every((el) => el.ship.isSunk());
  };

  return gameboard;
}

export function createPlayer(name){
    return {
        name,
        gameboard: createGameboard(),
    };
};


