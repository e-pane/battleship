const letters = "ABCDEFGHIJ";

export function initRenderers(controller) {
    let selectedShip = null;

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
                const inputX = document.querySelector("#ship-x");
                const inputY = document.querySelector("#ship-y");

                if (inputX) inputX.value = "";
                if (inputY) inputY.value = "";

                document.querySelectorAll('.cell.selected').
                    forEach(c => c.classList.remove('selected'));

                emptyCell.classList.add('selected');

                const x = Number(emptyCell.dataset.x);
                const y = Number(emptyCell.dataset.y);

                const uiX = letters[y];
                const uiY = x + 1;

                inputX.value = uiX;
                inputY.value = uiY;

                return;
            }
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
            
                const x = document.querySelector("#ship-x").value.trim();
                const y = document.querySelector("#ship-y").value.trim();
            
                const orientInput = document.querySelector("input[name=orientation]:checked");
                if (!orientInput) return;
            
                controller.dispatch("placeShip", {
                    shipType: selectedShip,
                    x,
                    y,
                    orient: orientInput.value,
                });
            },
            enterAttackMode: () => {
                controller.dispatch("enterAttackMode");
            },
            startNewGame: () => {
                renderStartScreen();
            }
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

export function renderStartScreen() {
  const app = document.querySelector("#app");

  app.innerHTML = `
        <section class="player-name-container">
            <form class="start-game-form">
                <input type="text" id="player-name" placeholder="Enter player name">
                <button type="button" class="btn start-game" data-action="startGame">
                    Start Game
                </button>
            </form>
        </section>
    `;
}
export function renderShipPlacementScreen(state, uiState) {
  const app = document.querySelector("#app");

  app.innerHTML = `
      <section class="place-ship-container">
  
        <!-- UI MESSAGES -->
        <div class="ui-messages">
          <p class="message">Place your ships</p>
        </div>

        <div class="placement-main">
            <div class="placement-help">
                <p>
                    Select a ship icon, enter row A–J and column 1–10,
                    choose horizontal or vertical orientation,
                    then click PLACE SHIP.  Or select a ship icon and a starting cell for that ship.
                    To reposition any ship, click on the ship inside the grid.  
                </p>
            </div>
            <!-- GRID -->
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
            
        <!-- CONTROLS -->
        <div class="controls">
            <div class="ship-icons">
                <button type="button" class="ship-btn" data-ship="carrier">
                <img src="/images/carrier.jpeg" alt="Carrier">
                </button>

                <div class="ship-info">
                    <p>carrier</p>
                    <p>length: 5</p>
                </div>
            
                <button type="button" class="ship-btn" data-ship="battleship">
                <img src="/images/battleship.jpeg" alt="Battleship">
                </button>

                <div class="ship-info">
                    <p>battleship</p>
                    <p>length: 4</p>
                </div>
            
                <button type="button" class="ship-btn" data-ship="submarine">
                <img src="/images/submarine.jpeg" alt="Submarine">
                </button>

                <div class="ship-info">
                    <p>submarine</p>
                    <p>length: 3</p>
                </div>
            
                <button type="button" class="ship-btn" data-ship="cruiser">
                <img src="/images/cruiser.jpeg" alt="Cruiser">
                </button>

                <div class="ship-info">
                    <p>cruiser</p>
                    <p>length: 3</p>
                </div>
            
                <button type="button" class="ship-btn" data-ship="destroyer">
                <img src="/images/destroyer.jpeg" alt="Destroyer">
                </button>

                <div class="ship-info">
                    <p>destroyer</p>
                    <p>length: 2</p>
                </div>
        
            </div>
    
            <form class="place-ship-form">
                <input id="ship-x" placeholder="A">
                <input id="ship-y" placeholder="1">
    
                <label>
                <input type="radio" name="orientation" value="horizontal" checked>
                Horizontal
                </label>
    
                <label>
                <input type="radio" name="orientation" value="vertical">
                Vertical
                </label>
    
                <button type="button" data-action="placeShip">
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
            const firstLetter = shipName[0].toUpperCase();
            const [x, y] = coord;
            const cell = cellMap.get(`${x},${y}`);

            if (cell) {
                cell.classList.add("ship");
                cell.textContent = `${firstLetter}`;
            }
        }
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
            const errorBox = document.querySelector('.ship-error-msg');
            errorBox.textContent = "All ships have been placed!!"

            const uiMessage = document.querySelector('.ui-messages');
            uiMessage.innerHTML = "";
            const startAttackBtn = document.createElement('button');
            startAttackBtn.textContent = "Enter Attack Mode";
            startAttackBtn.classList.add('start-attack-btn');
            startAttackBtn.dataset.action = 'enterAttackMode';

            uiMessage.append(startAttackBtn);
        }
}
export function renderAttackScreen(gameState, uiState) {
  const { computer, player, computerShips, playerShips } = gameState;
  const {
    currentPhase,
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

    console.log(playerAttackMap);
    console.log(currentPhase);
    console.log(turnText);
    console.log(computerAttackMap);
    console.log(playerSunkShips);
    console.log(playerAttack);
    console.log(winner);

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
        const firstLetter = shipName[0].toUpperCase();
        const [x, y] = coord;
        const cell = playerCellMap.get(`${x},${y}`);

        if (cell) {
            cell.classList.add("ship");
            cell.textContent = `${firstLetter}`;
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

        const errorEl = document.createElement("p");
        errorEl.classList.add("attack-outcome-overlay");
        errorEl.textContent = ERROR_TEXT[errorMsg] || "";

        compShipsSunk.append(errorEl);

        setTimeout(() => errorEl.remove(), 2500);
    }
    // paint player and computer grids with hits and misses
    if (playerAttackMap && computerAttackMap) {
        for (const key of playerCellMap.keys()) {
          const cell = playerCellMap.get(key);
          const attackData = playerAttackMap.get(key);

          if (attackData) {
            cell.classList.add(attackData.outcome);
          }
        }

        for (const key of computerCellMap.keys()) {
          const cell = computerCellMap.get(key);
          const attackData = computerAttackMap.get(key);

          if (attackData) {
            cell.classList.add(attackData.outcome);

            if (attackData.shipName) {
              cell.classList.add("ship");
              cell.textContent = attackData.shipName[0].toUpperCase();
            }
          }
        }
    }
    
    // add 2 sec outcome message to the area under each grid
    if (playerAttack && playerAttack.outcome) {
        const attackOutcomeMsg = document.createElement("div");
        attackOutcomeMsg.classList.add("attack-outcome-overlay");
        attackOutcomeMsg.innerText = playerAttack.outcome.toUpperCase();

        compShipsSunk.append(attackOutcomeMsg);

        setTimeout(() => attackOutcomeMsg.remove(), 2000);
    }
    
    if (computerAttack && computerAttack.outcome) {
        const attackOutcomeMsg = document.createElement("div");
        attackOutcomeMsg.classList.add("attack-outcome-overlay");
        attackOutcomeMsg.innerText = computerAttack.outcome.toUpperCase();

        playerShipsSunk.append(attackOutcomeMsg);

        setTimeout(() => attackOutcomeMsg.remove(), 2000);
    }
    
    if (currentPhase === 'gameOver') {
        let displayName = winner === 'player' ?
            player.name :
            computer.name;
        
        gameMessage.innerHTML = `${displayName} Wins the Game!!!`;

        const newGameBtn = document.createElement('button');
        newGameBtn.textContent = "New Game";
        newGameBtn.classList.add('new-game-btn');
        newGameBtn.dataset.action = 'startNewGame';

        gameMessage.append(newGameBtn);
    }
}

