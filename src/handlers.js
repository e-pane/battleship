import { renderShipPlacementScreen } from "./renderers.js";
import { SHIP_TYPES } from "./factories.js";

export function createHandlers(engine) {
    return {
        startGame: (payload) => handleStartGame(engine, payload),
        placeShip: (payload) => handlePlaceShip(engine, payload),
        removeShip: (payload) => handleRemoveShip(engine, payload),
    };
}

function handleStartGame(engine, payload) {
    engine.start(payload.playerName);
  
    const state = engine.state;
    
    if (state.phase === "shipPlacement") {
      renderShipPlacementScreen(state);
    }
}

function handlePlaceShip(engine, payload) {
    const { shipType, x, y, orient } = payload;
    const result = engine.placeShip(shipType, x, y, orient);

    let state = engine.state;
    const ships = state.player.gameboard.getShips();
    state = {...state, ships}

    if (result.ok) {
        renderShipPlacementScreen(state);
        return;
    }
    const errorMsg = result.reason;
    const uiState = { errorMsg };
    renderShipPlacementScreen(state, uiState);
}

function handleRemoveShip(engine, payload) {
    const { x, y } = payload;
    const result = engine.removeShipAt(x, y);
    

    if (!result.ok) return;

    let state = engine.state;
    const ships = state.player.gameboard.getShips();
    state = { ...state, ships };

    renderShipPlacementScreen(state);
}


