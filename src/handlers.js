import { renderShipPlacementScreen, renderAttackScreen } from "./renderers.js";
import { SHIP_TYPES } from "./factories.js";

export function createHandlers(engine) {
    return {
        startGame: (payload) => handleStartGame(engine, payload),
        placeShip: (payload) => handlePlaceShip(engine, payload),
        removeShip: (payload) => handleRemoveShip(engine, payload),
        enterAttackMode: () => handleEnterAttackMode(engine),
        playerAttack: (payload) => handlePlayerAttack(engine, payload),
    };
}

function handleStartGame(engine, payload) {
    engine.start(payload.playerName);
  
    const state = engine.state;
    const ships = state.player.gameboard.getShips();
    const viewModel = { ...state, ships };
    
    if (state.phase === "shipPlacement") {
      renderShipPlacementScreen(viewModel);
    }
}

function handlePlaceShip(engine, payload) {
    const { shipType, x, y, orient } = payload;
    const result = engine.placeShip(shipType, x, y, orient);

    const state = engine.state;
    const ships = state.player.gameboard.getShips();
    const viewModel = {...state, ships}

    if (result.ok) {
        renderShipPlacementScreen(viewModel);
        return;
    }
    const errorMsg = result.reason;
    const uiState = { errorMsg };
    renderShipPlacementScreen(viewModel, uiState);
}

function handleRemoveShip(engine, payload) {
    const { x, y } = payload;
    const result = engine.removeShipAt(x, y);


    if (!result.ok) return;

    const state = engine.state;
    const ships = state.player.gameboard.getShips();
    const viewModel = { ...state, ships };

    renderShipPlacementScreen(viewModel);
}

function handleEnterAttackMode(engine) {
    engine.enterAttackMode();

    let state = engine.state;

    const currentPhase = state.phase;

    const viewModel = {
      ...state,
      playerShips: state.player.gameboard.getShips(),
      computerShips: state.computer.gameboard.getShips(),
    };
    //derive uiState of ships currently sunk from stateful ships arrays
    const isPlayerTurn = engine.state.turn === 'player';

    const turnText = isPlayerTurn
        ? `It's ${engine.state.player.name}'s turn`
        : "The computer is choosing a target";
    
    const turnInstruction = isPlayerTurn
        ? "Click on a cell in the computer's grid to attack"
        : "";
    
    const uiState = {
        currentPhase,
        turnText,
        turnInstruction,
        playerSunkShips: viewModel.playerShips.filter(s => s.ship.isSunk()).map(s => s.ship.type),
        computerSunkShips: viewModel.computerShips.filter(s => s.ship.isSunk()).map(s => s.ship.type),
    }

    renderAttackScreen(viewModel, uiState);
}

function handlePlayerAttack(engine, payload) {
    // payload shape { x: 3, y: 7 }
    const { x, y } = payload;

    const playerResult = engine.playerAttack(x, y);

    let state = engine.state;

    const currentPhase = state.phase;

    const viewModel = {
      ...state,
      playerShips: state.player.gameboard.getShips(),
      computerShips: state.computer.gameboard.getShips(),
    };
    //derive uiState of ships currently sunk from stateful ships arrays
    const isPlayerTurn = engine.state.turn === "player";

    const turnText = isPlayerTurn
      ? `It's ${engine.state.player.name}'s turn`
      : "The computer is choosing a target";

    const turnInstruction = isPlayerTurn
      ? "Click on a cell in the computer's grid to attack"
      : "";

    const uiState = {
      currentPhase,
      turnText,
      turnInstruction,
      playerSunkShips: viewModel.playerShips
        .filter((s) => s.ship.isSunk())
        .map((s) => s.ship.type),
      computerSunkShips: viewModel.computerShips
        .filter((s) => s.ship.isSunk())
        .map((s) => s.ship.type),
    };

    if (!playerResult.ok) {
        renderAttackScreen(viewModel, { ...uiState, errorMsg: result.reason });
        return;
    }

    const computerResult = engine.computerAttack();

    renderAttackScreen(viewModel, {
      ...uiState,
      playerAttack: {
        x,
        y,
        outcome: playerResult.outcome,
      },
      computerAttack: {
        x: computerResult.x,
        y: computerResult.y,
        outcome: computerResult.outcome,
      },
    });
}

