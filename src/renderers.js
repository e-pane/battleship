const letters = "ABCDEFGHIJ";
export function initRenderers(controller) {
  let selectedShip = null;
    let selectedCell = null;
    let selectedOrientation = "horizontal";

  const clickHandler = (e) => {
    if (controller.getPhase() === "attack") {
      const computerCell = e.target.closest(".computer-grid .cell");

      if (computerCell && document.querySelector(".attack-layout")) {
        const x = Number(computerCell.dataset.x);
        const y = Number(computerCell.dataset.y);

        controller.dispatch("playerAttack", { x, y });
        return;
      }
    }
    if (controller.getPhase() === "shipPlacement") {
      const shipBtn = e.target.closest(".ship-btn");

      if (shipBtn) {
        document.querySelectorAll(".ship-btn").forEach((btn) => {
          btn.classList.remove("selected");
        });

        shipBtn.classList.add("selected");
        selectedShip = shipBtn.dataset.ship;

        return;
      }

      const shipCell = e.target.closest(".cell.ship");

      if (shipCell) {
        const x = shipCell.dataset.x;
        const y = shipCell.dataset.y;

        controller.dispatch("removeShip", { x, y });
        return;
      }

      const emptyCell = e.target.closest(".cell");

      if (emptyCell && !emptyCell.classList.contains("ship")) {
        document
          .querySelectorAll(".cell.selected")
          .forEach((c) => c.classList.remove("selected"));

        emptyCell.classList.add("selected");

        const x = Number(emptyCell.dataset.x);
        const y = Number(emptyCell.dataset.y);

        selectedCell = { x, y };

        return;
      }
    }

    const orientationInput = e.target.closest("input[name=orientation]");
    if (orientationInput) {
      selectedOrientation = orientationInput.value;
      return;
    }
      
    const levelInput = e.target.closest("input[name=level]");
    if (levelInput) {
      controller.dispatch("selectLevel", { value: levelInput.value });
      return;
    }

    const action = e.target.dataset.action;
    if (!action) return;

    const actions = {
      startGame: () => {
        const nameInput = document.querySelector("#player-name");
        const playerName = nameInput.value.trim();

        controller.dispatch("startGame", { playerName: playerName || "Guest" });
      },
      placeShip: () => {
        if (!selectedShip) return;
        if (!selectedCell) return;

        const { x, y } = selectedCell;
          
        const orientInput = document.querySelector(
          "input[name=orientation]:checked",
        );
        if (!orientInput) return;

        controller.dispatch("placeShip", {
          shipType: selectedShip,
          x,
          y,
          orient: orientInput.value,
        });
          
        selectedCell = null;
        selectedShip = null;
      },
      enterAttackMode: () => {
        controller.dispatch("enterAttackMode");
      },
      startNewGame: () => {
        renderStartScreen();
      },
    };
    const handler = actions[action];
    if (handler) {
      handler();
    }
  };
  document.addEventListener("click", clickHandler);

  return () => {
    document.removeEventListener("click", clickHandler);
  };
}
export function renderGrid(container) {
  const cellMap = new Map();
  container.innerHTML = "";

  for (let i = 0; i < 100; i++) {
    const x = i % 10;
    const y = Math.floor(i / 10);

    const cell = document.createElement("div");
    cell.classList.add("cell");

    cell.dataset.x = x;
    cell.dataset.y = y;
    cellMap.set(`${x},${y}`, cell);
    container.appendChild(cell);
  }
  return cellMap;
}
export function renderStartScreen(level = 2) {
    const app = document.querySelector("#app");
    
    const savedName = localStorage.getItem("battleship-player-name");

  app.innerHTML = `
    <section class="start-screen-container">
        <div class="player-input">
            <input
                type="text"
                id="player-name"
                placeholder="Enter player name"
                value="${savedName ?? ""}"
            >
        </div>

        <div class="difficulty-options">

            <label data-description="________ Computer fires randomly">
                <input
                    type="radio"
                    name="level"
                    value="1"
                    ${level === 1 ? "checked" : ""}
                >
                Level 1
            </label>

            <label data-description="________ Computer hunts lightly">
                <input
                    type="radio"
                    name="level"
                    value="2"
                    ${level === 2 ? "checked" : ""}
                >
                Level 2
            </label>

            <label data-description="________ Computer hunts ruthlessly">
                <input
                    type="radio"
                    name="level"
                    value="3"
                    ${level === 3 ? "checked" : ""}
                >
                Level 3
            </label>

        </div>

        <a class="battleship-link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://gameonfamily.com/blogs/tutorials/battleship?srsltid=AfmBOoqKDgaLP3Fwtm9Ig9UF4CBqonT2ozgMsa6GsZ4f6kNydOakSk3B"
            >Want to know more about Battleship?</a>

        <div class="start-game-controls">
            <button
                type="button"
                class="btn start-game-btn"
                data-action="startGame"
            >
                Start Game
            </button>
        </div>
            
    </section>
    `;
}
export function renderShipPlacementScreen(state, uiState) {
    const { orientation } = uiState;
  const app = document.querySelector("#app");

  app.innerHTML = `
      <section class="place-ship-container">
  
        <h1 class="placement-header">Place Your Ships</h1>

        <div class="placement-main">
            <div class="placement-help">
                <p>                    
                    Select a ship icon and a starting cell for that ship.<br>
                    Choose horizontal or vertical orientation.<br>
                    Click "Place Ship"<br>
                    Chosen cell will be the top or left-most starting point.<br> 
                    To reposition a ship, click on the ship inside the grid.<br> 
                    
                </p>
            </div>
            <!-- GRID -->
            <div class="placement-visuals">
                <div class="board">
                    <div class="corner"></div>
                    <div class="top-labels"></div>
                    <div class="left-labels"></div>
                    <div class="grid"></div>
                </div>

                <!-- WARNING FOR INCORRECT PLACEMENT -->
                <div class="ui-information-display">
                    <div class="ships-placed">Ships placed</div>
                    <div class="ship-error-msg"></div>
                    <ul class="ship-list"></ul>
                </div>
            </div>
        </div>
            
        <!-- CONTROLS -->
        <div class="controls">
            <div class="ship-icons">
                <div class="ship-option">    
                    <button type="button" class="ship-btn" data-ship="carrier">Carrier
                    </button>

                    <div class="ship-info">
                        <p>Length: 5</p>
                    </div>
                </div>

                <div class="ship-option">
                    <button type="button" class="ship-btn" data-ship="battleship">Battleship
                    </button>

                    <div class="ship-info">
                        <p>Length: 4</p>
                    </div>
                </div>

                <div class="ship-option">
                    <button type="button" class="ship-btn" data-ship="submarine">Submarine
                    </button>

                    <div class="ship-info">
                        <p>Length: 3</p>
                    </div>
                </div>

                <div class="ship-option">
                    <button type="button" class="ship-btn" data-ship="cruiser">Cruiser
                    </button>

                    <div class="ship-info">
                        <p>Length: 3</p>
                    </div>
                </div>
            
                <div class="ship-option">
                    <button type="button" class="ship-btn" data-ship="destroyer">Destroyer
                    </button>

                    <div class="ship-info">
                        <p>Length: 2</p>
                    </div>
                </div>
            </div>

            <form class="place-ship-form">    
                <label>
                    <input type="radio" name="orientation" value="horizontal"
                    ${orientation === "horizontal" ? "checked" : ""}>
                    Horizontal
                </label>
    
                <label>
                    <input type="radio" name="orientation" value="vertical"
                    ${orientation === "vertical" ? "checked" : ""}>
                    Vertical
                </label>
    
                <button type="button" class="btn place-ship-btn" data-action="placeShip">
                    Place Ship
                </button>
            </form>
    
            
  
        </div>
  
      </section>
    `;
  const grid = document.querySelector(".grid");
  const cellMap = renderGrid(grid);

  const top = document.querySelector(".top-labels");
  const left = document.querySelector(".left-labels");

  top.innerHTML = "";
  left.innerHTML = "";

  for (let i = 1; i <= 10; i++) {
    const topCell = document.createElement("div");
    topCell.textContent = i;
    top.appendChild(topCell);
  }

  for (let i = 0; i < 10; i++) {
    const cell = document.createElement("div");
    cell.textContent = letters[i];
    left.appendChild(cell);
  }

  //paint the grid with each ship
  state.ships.forEach((ship) => {
    for (const coord of ship.coords) {
      const shipName = ship.ship.type;
      const shipAbbreviation = shipName.slice(0, 2).toUpperCase();
      const [x, y] = coord;
      const cell = cellMap.get(`${x},${y}`);

      if (cell) {
        cell.classList.add("ship");
        cell.textContent = shipAbbreviation;
      }
    }
  });
  // disable the button for any already placed ships
  document.querySelectorAll(".ship-btn").forEach((btn) => {
    const placed = state.ships.some(
      (ship) => ship.ship.type === btn.dataset.ship,
    );

    btn.disabled = placed;
  });
  //populate the placed ships list
  const shipList = document.querySelector(".ship-list");
  shipList.innerHTML = "";
  if (state.ships) {
    state.ships.forEach((ship) => {
      const listedShip = document.createElement("li");
      listedShip.classList.add("listed-ship");
      listedShip.innerText = ship.ship.type;
      shipList.append(listedShip);
    });
  }
  // update user with ongoing status of ship placement
  if (uiState?.errorMsg) {
    const errorBox = document.querySelector(".ship-error-msg");

    const ERROR_TEXT = {
      OVERLAP: "Ship overlaps another ship.",
      OUT_OF_BOUNDS: "Ship extends off the board.",
      INVALID_START: "Invalid starting coordinate.",
      SHIP_ALREADY_PLACED: "That ship has already been placed",
    };

    errorBox.textContent = ERROR_TEXT[uiState.errorMsg] || "";

    setTimeout(() => {
      errorBox.textContent = "";
    }, 5000);
  }
  // sync the UI to all ships being successfully placed
  if (!state.ships) return;
  const placementComplete = state.ships?.length === state.requiredShips;
  if (placementComplete) {
    const errorBox = document.querySelector(".ship-error-msg");
    errorBox.textContent = "All ships have been placed!!";

    const uiMessage = document.querySelector(".ui-information-display");
    uiMessage.innerHTML = "";
    const startAttackBtn = document.createElement("button");
    startAttackBtn.textContent = "Enter Attack Mode";
    startAttackBtn.classList.add("start-attack-btn");
    startAttackBtn.dataset.action = "enterAttackMode";

    uiMessage.append(startAttackBtn);
  }
}
export function renderAttackScreen(gameState, uiState) {
  const { computer, player, computerShips, playerShips } = gameState;
  const {
    currentPhase,
    currentLevel,
    turnText,
    turnInstruction,
    playerAttackMap,
    computerAttackMap,
    playerSunkShips,
    computerSunkShips,
    errorMsg,
    playerAttack,
    computerAttack,
    winner,
  } = uiState;

  const app = document.querySelector("#app");

  app.innerHTML = `
    <div class="attack-layout">

        <div class="computer-side">
            <div class="computer-board">
                <div class="computer-corner"></div>
                <div class="computer-top-labels"></div>
                <div class="computer-left-labels"></div>
                <div class="grid computer-grid"></div>
            </div>

            <div class="computer-ships-sunk">
                <h3>Computer's Ships Sunk:</h3>
            </div>
        </div>

        <div class="game-messaging">
            <div class="game-message"></div>
            <div class="outcome-error-msg"></div>
            <div class="level-msg">Level ${currentLevel}</div>
        </div>

        <div class="player-side">
            <div class="player-board">
                <div class="player-corner"></div>
                <div class="player-top-labels"></div>
                <div class="player-left-labels"></div>
                <div class="grid player-grid"></div>
            </div>

            <div class="player-ships-sunk">
                <h3>${player.name}'s Ships Sunk:</h3>
            </div>
        </div>

    </div>
    `;

  const computerGrid = document.querySelector(".computer-grid");
  const playerGrid = document.querySelector(".player-grid");

  const computerCellMap = renderGrid(computerGrid);
  const playerCellMap = renderGrid(playerGrid);

  const computerTop = document.querySelector(".computer-top-labels");
  const computerLeft = document.querySelector(".computer-left-labels");

  computerTop.innerHTML = "";
  computerLeft.innerHTML = "";

  for (let i = 1; i <= 10; i++) {
    const computerTopCell = document.createElement("div");
    computerTopCell.textContent = i;
    computerTop.appendChild(computerTopCell);
  }

  for (let i = 0; i < 10; i++) {
    const computerCell = document.createElement("div");
    computerCell.textContent = letters[i];
    computerLeft.appendChild(computerCell);
  }

  const playerTop = document.querySelector(".player-top-labels");
  const playerLeft = document.querySelector(".player-left-labels");

  playerTop.innerHTML = "";
  playerLeft.innerHTML = "";

  for (let i = 1; i <= 10; i++) {
    const playerTopCell = document.createElement("div");
    playerTopCell.textContent = i;
    playerTop.appendChild(playerTopCell);
  }

  for (let i = 0; i < 10; i++) {
    const playerCell = document.createElement("div");
    playerCell.textContent = letters[i];
    playerLeft.appendChild(playerCell);
  }

  //paint the player's grid ONLY with each ship
  playerShips.forEach((ship) => {
    for (const coord of ship.coords) {
      const shipName = ship.ship.type;
      const shipAbbreviation = shipName.slice(0, 2).toUpperCase();
      const [x, y] = coord;
      const cell = playerCellMap.get(`${x},${y}`);

      if (cell) {
        cell.classList.add("ship");
        cell.textContent = `${shipAbbreviation}`;
      }
    }
  });

  //populate computer's shipsSunk list
  const compShipsSunk = document.querySelector(".computer-ships-sunk");
  const compSunkList = document.createElement("ul");
  compSunkList.classList.add("sunk-list", "computer-sunk-list");

  computerSunkShips.forEach((s) => {
    const listItem = document.createElement("li");
    listItem.textContent = s;
    compSunkList.append(listItem);
  });

  compShipsSunk.append(compSunkList);

  //populate player's shipsSunk list
  const playerShipsSunk = document.querySelector(".player-ships-sunk");
  const playerSunkList = document.createElement("ul");
  playerSunkList.classList.add("sunk-list", "player-sunk-list");

  playerSunkShips.forEach((s) => {
    const listItem = document.createElement("li");
    listItem.textContent = s;
    playerSunkList.append(listItem);
  });

  playerShipsSunk.append(playerSunkList);

  //display who's turn it is
  const gameMessage = document.querySelector(".game-message");

  if (gameMessage) {
    gameMessage.innerHTML = `
            <p class="turn-message">${turnText}. ${turnInstruction}</p>
        `;
  }

  // guard agains attacking the same computer cell
  if (errorMsg) {
    const ERROR_TEXT = {
      ALREADY_ATTACKED: "You've already attacked that cell",
    };
    const gameMessageContainer = document.querySelector(".game-messaging");
    const outcomeErrorMsgContainer = document.querySelector(".outcome-error-msg");
    outcomeErrorMsgContainer.textContent = ERROR_TEXT[errorMsg] || "";

    gameMessageContainer.append(outcomeErrorMsgContainer);

    setTimeout(() => errorEl.remove(), 2500);
  }
  // paint player and computer grids with hits and misses
  if (playerAttackMap && computerAttackMap) {
    for (const key of playerCellMap.keys()) {
      const cell = playerCellMap.get(key);
      const attackData = playerAttackMap.get(key);

      if (attackData) {
        if (attackData.sunk) {
          cell.classList.add("sunk");
        } else {
          cell.classList.add(attackData.outcome);
        }
      }
    }

    for (const key of computerCellMap.keys()) {
      const cell = computerCellMap.get(key);
      const attackData = computerAttackMap.get(key);

      if (attackData) {
        if (attackData.sunk) {
          cell.classList.add("sunk");
        } else {
          cell.classList.add(attackData.outcome);
        }

        if (attackData.shipName) {
          cell.classList.add("ship");
          cell.textContent = attackData.shipName.slice(0, 2).toUpperCase();
        }
      }
    }
  }

    // add 2 sec outcome message to the area under each grid
    const gameMessageContainer = document.querySelector(".game-messaging");
    const outcomeErrorMsgContainer = document.querySelector(".outcome-error-msg");
    const levelMsgContainer = document.querySelector(".level-msg");

  if (playerAttack && playerAttack.outcome) {
    outcomeErrorMsgContainer.textContent = `A ${playerAttack.outcome.toUpperCase()} for ${player.name}`;

    gameMessageContainer.append(outcomeErrorMsgContainer);

    setTimeout(() => outcomeErrorMsgContainer.remove(), 2000);
  }

  if (computerAttack && computerAttack.outcome) {
    outcomeErrorMsgContainer.textContent = `A ${computerAttack.outcome.toUpperCase()} for the computer`;

    gameMessageContainer.append(outcomeErrorMsgContainer);

    setTimeout(() => outcomeErrorMsgContainer.remove(), 2000);
  }

    levelMsgContainer.textContent = `Level ${currentLevel}`;
    gameMessageContainer.append(levelMsgContainer)

  if (currentPhase === "gameOver") {
    let displayName = winner === "player" ? player.name : computer.name;

    gameMessage.innerHTML = `${displayName} Wins the Game!!!`;

    const newGameBtn = document.createElement("button");
    newGameBtn.textContent = "New Game";
    newGameBtn.classList.add("new-game-btn");
    newGameBtn.dataset.action = "startNewGame";

    outcomeErrorMsgContainer.append(newGameBtn);
  }
}
