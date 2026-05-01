export const SHIP_TYPES = {
  destroyer: 2,
  submarine: 3,
  cruiser: 3,
  battleship: 4,
  carrier: 5,
};

export function createShip(shipType) {
    let timesHit = 0;
    const length = SHIP_TYPES[shipType];

    return {
        type: shipType,
        length,
        hit() {
        timesHit++;
        },
        isSunk() {
        return timesHit >= length;
        },
  };
}

export function createGameboard() {

  function parseCoord(x, y) {
    // if already numeric, return as-is
    if (Number.isInteger(x) && Number.isInteger(y)) {
      return [x, y];
    }

    // convert "C", "5" → [2, 4]
    const row = x.toUpperCase().charCodeAt(0) - 65; // A-J
    const col = Number(y) - 1; // 1-10
    return [col, row];
  }

  function getShipCoords(ship, x, y, orient) {
    const coords = [];

    for (let i = 0; i < ship.length; i++) {
      if (orient === "horizontal") coords.push([x + i, y]);
      else coords.push([x, y + i]);
    }

    return coords;
  }
  const gameboard = Object.create(null);

  const ships = [];
  const occupied = new Set();

  const missedAttacks = [];
  const attacked = new Set();

  gameboard.getShips = () => ships;

  gameboard.hasBeenAttacked = (x, y) => {
    return attacked.has(`${x},${y}`);
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
    console.log(ships);
    console.log(ship);
    const idx = ships.findIndex(el => el.ship.type === ship.ship.type);
    console.log(idx);

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
          el.ship.hit();
          return {
            ok: true,
            outcome: "hit",
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


