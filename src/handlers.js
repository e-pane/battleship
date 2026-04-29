import { renderShipPlacementScreen } from "./renderers.js";
import { SHIP_TYPES } from "./factories.js";

export function createHandlers(engine) {
    return {
        startGame: (payload) => handleStartGame(engine, payload),
        placeShip: (payload) => handlePlaceShip(engine, payload),
        handlePlacementModal: (payload) => handlePlacementModal(engine, payload),
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
    const result = engine.placeShip(shipType, x, y, orient);

    const state = engine.state;
    const ships = state.player.gameboard.getShips();

    if (result.ok) {
        renderShipPlacementScreen({ ...state, ships });
    }
}

function handlePlacementModal(engine, payload) {
    const { shipType, modalOpen } = payload
    const state = engine.state;
    const shipLength = SHIP_TYPES[shipType];
    const uiState = { shipType, shipLength, modalOpen };
    renderShipPlacementScreen({state, uiState});
}

