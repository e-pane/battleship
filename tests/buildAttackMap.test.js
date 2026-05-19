
import { jest } from "@jest/globals";
import {buildAttackMap} from "../src/utils.js";
test("buildAttackMap acepts args and returns correct attackMap", () => {
    const ships = [
        {
            ship: {
                type: "carrier",
                length: 5,
            },
            coords: [
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
            ],
        },

        {
            ship: {
                type: "battleship",
                length: 4,
            },
            coords: [
                [2, 3],
                [2, 4],
                [2, 5],
                [2, 6],
            ],
        },

        {
            ship: {
                type: "destroyer",
                length: 2,
            },
            coords: [
                [7, 7],
                [8, 7],
            ],
        },
    ];
    const attacked = new Set(["0,0", "1,0", "2,0", "3,0", "4,0", "5,0"]);
    const attacks = Array.from(attacked);

    const attackMap = buildAttackMap(attacks, ships);
    expect(attackMap.get('0,0').outcome).toBe('hit');
    expect(attackMap.get('0,0').shipName).toBe('carrier');
    expect(attackMap.get('5,0').outcome).toBe('miss');
    expect(attackMap.get('5,0').shipName).toBe(null);
    expect(attackMap.size).toEqual(6);
});