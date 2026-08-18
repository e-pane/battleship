import { renderShipPlacementScreen, renderAttackScreen } from "./renderers.js";
import { buildAttackMap } from "./utils.js";
import { SHIP_TYPES } from "./factories.js";

export function createHandlers(engine) {
    return {
      startGame: (payload, uiState) => handleStartGame(engine, payload, uiState),
      selectLevel: (payload, uiState) => handleSelectLevel(engine, payload, uiState),
      placeShip: (payload, uiState) => handlePlaceShip(engine, payload, uiState),
      removeShip: (payload, uiState) => handleRemoveShip(engine, payload, uiState),
      enterAttackMode: () => handleEnterAttackMode(engine),
      playerAttack: (payload, uiState) => handlePlayerAttack(engine, payload, uiState),
    };
}

function handleStartGame(engine, payload, uiState) {
    localStorage.setItem("battleship-player-name", payload.playerName);
    engine.start(payload.playerName);
  
    const state = engine.state;
    const ships = state.player.gameboard.getShips();
    const viewModel = { ...state, ships };
    
    if (state.phase === "shipPlacement") {
      renderShipPlacementScreen(viewModel, uiState);
    }
}

function handleSelectLevel(engine, payload) {
  engine.state.level = Number(payload.value);
  localStorage.setItem("battleship-level", payload.value);
}

function handlePlaceShip(engine, payload, uiState) {
    const { shipType, x, y, orient } = payload;
    const result = engine.placeShip(shipType, x, y, orient);

    const state = engine.state;
    const ships = state.player.gameboard.getShips();
    const viewModel = { ...state, ships };

    uiState.orientation = orient;
    uiState.errorMsg = result.ok ? null : result.reason;

    renderShipPlacementScreen(viewModel, uiState);
}

function handleRemoveShip(engine, payload, uiState) {
    const { x, y } = payload;
    const result = engine.removeShipAt(x, y);


    if (!result.ok) return;

    const state = engine.state;
    const ships = state.player.gameboard.getShips();
    const viewModel = { ...state, ships };

    renderShipPlacementScreen(viewModel, uiState);
}

function handleEnterAttackMode(engine) {
    engine.enterAttackMode();

    let state = engine.state;
    
    const currentLevel = state.level;
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
        : "The enemy is choosing a target";
    
    const turnInstruction = isPlayerTurn
        ? "Click on a cell in the enemy's grid to attack"
      : "";

    const playerAttackMap = buildAttackMap(
      state.player.gameboard.getAttacks(),
      state.player.gameboard.getShips(),
    );

    const computerAttackMap = buildAttackMap(
      state.computer.gameboard.getAttacks(),
      state.computer.gameboard.getShips(),
    );
    
    const uiState = {
        currentPhase,
        currentLevel,
        turnText,
        turnInstruction,
        playerAttackMap,
        computerAttackMap,
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
  
    const playerAttackMap = buildAttackMap(
      state.player.gameboard.getAttacks(),
      state.player.gameboard.getShips(),
    );
  
    const computerAttackMap = buildAttackMap(
      state.computer.gameboard.getAttacks(),
      state.computer.gameboard.getShips(),
    );

    const currentPhase = state.phase;
    const currentLevel = state.level;
  
    if (currentPhase === "gameOver") {
      const viewModel = {
        ...state,
        playerShips: state.player.gameboard.getShips(),
        computerShips: state.computer.gameboard.getShips(),
      };

      const playerAttackMap = buildAttackMap(
        state.player.gameboard.getAttacks(),
        state.player.gameboard.getShips(),
      );

      const computerAttackMap = buildAttackMap(
        state.computer.gameboard.getAttacks(),
        state.computer.gameboard.getShips(),
      );

      const uiState = {
        currentPhase,
        currentLevel,
        turnText: null,
        turnInstruction: null,
        playerAttackMap,
        computerAttackMap,
        playerSunkShips: viewModel.playerShips
          .filter((s) => s.ship.isSunk())
          .map((s) => s.ship.type),
        computerSunkShips: viewModel.computerShips
          .filter((s) => s.ship.isSunk())
          .map((s) => s.ship.type),
        winner: state.winner,
      };
      renderAttackScreen(viewModel, uiState);
      return;
    }
  
    const viewModel = {
      ...state,
      playerShips: state.player.gameboard.getShips(),
      computerShips: state.computer.gameboard.getShips(),
    };
    //derive uiState of ships currently sunk from stateful ships arrays
    const isPlayerTurn = engine.state.turn === "player";

    const turnText = isPlayerTurn
      ? `It's ${engine.state.player.name}'s turn`
      : "The enemy is choosing a target";

    const turnInstruction = isPlayerTurn
      ? "Click on a cell in enemy's grid to attack"
      : "";

    const uiState = {
      currentPhase,
      currentLevel,
      turnText,
      turnInstruction,
      playerAttackMap,
      computerAttackMap,
      playerSunkShips: viewModel.playerShips
        .filter((s) => s.ship.isSunk())
        .map((s) => s.ship.type),
      computerSunkShips: viewModel.computerShips
        .filter((s) => s.ship.isSunk())
        .map((s) => s.ship.type),
    };

    if (!playerResult.ok) {
        renderAttackScreen(viewModel, { ...uiState, errorMsg: playerResult.reason });
        return;
    }

    renderAttackScreen(viewModel, {
        ...uiState,
        playerAttack: {
            x,
            y,
            outcome: playerResult.outcome,
        },
    });

    setTimeout(() => {
      const computerResult = engine.computerAttack();

      let state = engine.state;
      const currentPhase = state.phase;
      
      if (currentPhase === "gameOver") {
        const viewModel = {
          ...state,
          playerShips: state.player.gameboard.getShips(),
          computerShips: state.computer.gameboard.getShips(),
        };

        const playerAttackMap = buildAttackMap(
          state.player.gameboard.getAttacks(),
          state.player.gameboard.getShips(),
        );

        const computerAttackMap = buildAttackMap(
          state.computer.gameboard.getAttacks(),
          state.computer.gameboard.getShips(),
        );

        const uiState = {
          currentPhase,
          currentLevel,
          turnText: null,
          turnInstruction: null,
          playerAttackMap,
          computerAttackMap,
          playerSunkShips: viewModel.playerShips
            .filter((s) => s.ship.isSunk())
            .map((s) => s.ship.type),
          computerSunkShips: viewModel.computerShips
            .filter((s) => s.ship.isSunk())
            .map((s) => s.ship.type),
          winner: state.winner,
        };
        renderAttackScreen(viewModel, uiState);
        return;
      }
        const viewModel = {
            ...state,
            playerShips: state.player.gameboard.getShips(),
            computerShips: state.computer.gameboard.getShips(),
        };

        const isPlayerTurn = engine.state.turn === "player";

        const turnText = isPlayerTurn
          ? `It's ${engine.state.player.name}'s turn`
          : "The enemy is choosing a target";

        const turnInstruction = isPlayerTurn
          ? "Click on a cell in enemy's grid to attack"
          : "";
      
          const playerAttackMap = buildAttackMap(
            state.player.gameboard.getAttacks(),
            state.player.gameboard.getShips(),
          );

          const computerAttackMap = buildAttackMap(
            state.computer.gameboard.getAttacks(),
            state.computer.gameboard.getShips(),
          );

        const uiState = {
          currentPhase,
          currentLevel,
          turnText,
          turnInstruction,
          playerAttackMap,
          computerAttackMap,
          playerSunkShips: viewModel.playerShips
            .filter((s) => s.ship.isSunk())
            .map((s) => s.ship.type),
          computerSunkShips: viewModel.computerShips
            .filter((s) => s.ship.isSunk())
            .map((s) => s.ship.type),
        };
        
        renderAttackScreen(viewModel, {
          ...uiState,
          computerAttack: {
            x: computerResult.x,
            y: computerResult.y,
            outcome: computerResult.outcome,
          },
        });
    }, 2000);
}

