import { renderShipPlacementScreen } from "./renderers.js";

export function createHandlers(engine) {
    return {
        startGame: (payload) => handleStartGame(engine, payload),
        placeShip: (payload) => handlePlaceShip(engine, payload)
    };
}

function handleStartGame(engine, payload) {
    console.log(payload.playerName);
    engine.start(payload.playerName);
  
    const state = engine.state;
    
    if (state.phase === "shipPlacement") {
      renderShipPlacementScreen(state);
    }
}

function handlePlaceShip(engine, payload) {
    const { shipType, x, y, orient } = payload;
    const success = engine.placeShip(shipType, x, y, orient);
    console.log(success);
    
    return success;
}

