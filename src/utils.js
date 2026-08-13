// helper to build attackMaps for player and computer
export function buildAttackMap(attacks, ships) {
  const attackMap = new Map();

  for (const key of attacks) {
    const [x, y] = key.split(",").map(Number);
    const hitShip = ships.find((ship) =>
      ship.coords.some((coord) => coord[0] === x && coord[1] === y),
    );
    attackMap.set(key, {
      outcome: hitShip ? "hit" : "miss",
      shipName: hitShip ? hitShip.ship.type : null,
      sunk: hitShip ? hitShip.ship.isSunk() : false,
    });
  }
  return attackMap;
}
