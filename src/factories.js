const SHIP_TYPES = {
  destroyer: 2,
  submarine: 3,
  cruiser: 3,
  battleship: 4,
  carrier: 5,
};

function createShip(type) {
    let timesHit = 0;
    const length = SHIP_TYPES[type];

    return {
        type,
        length,
        hit() {
        timesHit++;
        },
        isSunk() {
        return timesHit >= length;
        },
  };
}

function createGameboard() {
  const gameboard = Object.create(null);

  const ships = [];
  const missedAttacks = [];
  const occupied = new Set();

  gameboard.getShips = () => ships;

  gameboard.placeShip = (ship, x, y, orient) => {
    if (x < 0 || x > 9 || y < 0 || y > 9) return;

    if (!Number.isInteger(x) || !Number.isInteger(y)) return;

    if (orient === "hor" && x + ship.length > 10) return;
    if (orient === "vert" && y + ship.length > 10) return;
    const coords = [];
    for (let i = 0; i < ship.length; i++) {
      if (orient === "hor") {
        coords.push([x + i, y]);
      } else if (orient === "vert") {
        coords.push([x, y + i]);
      }
    }
    const isOccupied = coords.some(([x, y]) => occupied.has(`${x},${y}`));
    if (isOccupied) return;

    coords.forEach(([x, y]) => occupied.add(`${x},${y}`));
    ships.push({ ship, coords });
  };
  // ships = [{ ship: destroyer, coords: [ [2,3], [3,3] ]},
  //          { ship: cruiser, coords: [ [4,5], [4,6], [4,7] ]} ]
  gameboard.receiveAttack = (x, y) => {
    for (const el of ships) {
      for (const coord of el.coords) {
        if (coord[0] === x && coord[1] === y) {
          el.ship.hit();
          return "hit";
        }
      }
    }
    missedAttacks.push([x, y]);
    return "miss";
  };

  gameboard.allShipsSunk = () => {
    return ships.every((el) => el.ship.isSunk());
  };

  return gameboard;
}

const createPlayer = (name) => {
    return {
        name,
        gameboard: createGameboard(),
    };
};

module.exports = { createShip, createGameboard, createPlayer, SHIP_TYPES };
