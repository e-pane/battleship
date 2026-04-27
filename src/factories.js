export const SHIP_TYPES = {
  destroyer: 2,
  submarine: 3,
  cruiser: 3,
  battleship: 4,
  carrier: 5,
};

export function createShip(type) {
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

export function createGameboard() {

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
  const missedAttacks = [];
  const occupied = new Set();

  gameboard.getShips = () => ships;

  gameboard.canPlaceShip = (ship, x, y, orient) => {
    if (!Number.isInteger(x) || !Number.isInteger(y)) return false;
    if (x < 0 || x > 9 || y < 0 || y > 9) return false;

    if (orient === "horizontal" && x + ship.length > 10) return false;
    if (orient === "vertical" && y + ship.length > 10) return false;

    const coords = getShipCoords(ship, x, y, orient);

    return !coords.some(([cx, cy]) => occupied.has(`${cx},${cy}`));
  };

  gameboard.placeShip = (ship, x, y, orient) => {
    console.log("SHIP:", ship);
    console.log("LENGTH:", ship.length);
    if (!gameboard.canPlaceShip(ship, x, y, orient)) return false;

    const coords = getShipCoords(ship, x, y, orient);

    coords.forEach(([cx, cy]) => occupied.add(`${cx},${cy}`));

    ships.push({ ship, coords });

    return true;
  };
  // ships = [{ ship: destroyer, coords: [ [2,3], [3,3] ]},
  //          { ship: cruiser, coords: [ [4,5], [4,6], [4,7] ]} ]

  gameboard.hasShipAt = (x, y) => {
    return occupied.has(`${x},${y}`);
  }

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

export function createPlayer(name){
    return {
        name,
        gameboard: createGameboard(),
    };
};


