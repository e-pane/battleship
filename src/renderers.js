const cellMap = new Map();

export function initRenderers(controller) {
  let selectedShip = null;

  document.addEventListener("click", (e) => {
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

    const action = e.target.dataset.action;
    if (!action) return;

    const actions = {
      startGame: () => {
        const nameInput = document.querySelector("#player-name");
        const playerName = nameInput.value.trim();

        controller.dispatch("startGame", { playerName: playerName || "Guest" });
      },
      placeShip: () => {
        if (!selectedShip) {
          console.warn("No ship selected");
          return;
        }
        const xInput = document.querySelector("#ship-x");
        const x = xInput.value.trim();
        const yInput = document.querySelector("#ship-y");
        const y = yInput.value.trim();
        const orientInput = document.querySelector(
          "input[name=orientation]:checked",
        );
        const orient = orientInput.value;

        controller.dispatch("placeShip", {
          shipType: selectedShip,
          x,
          y,
          orient,
        });
      },
    };

    const handler = actions[action];
    if (handler) {
      handler();
    }
  });
}

export function renderGrid(container) {
    container.innerHTML = "";
    cellMap.clear();

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
                    then click PLACE SHIP.  The cell you choose will be the starting cell for that ship.
                    To reposition any ship, click on the ship inside the grid.  You can also drag and drop
                    any ship into position.
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
  renderGrid(grid);

  const top = document.querySelector(".top-labels");
  const left = document.querySelector(".left-labels");

  top.innerHTML = "";
  left.innerHTML = "";

  for (let i = 1; i <= 10; i++) {
    const topCell = document.createElement("div");
    topCell.textContent = i;
    top.appendChild(topCell);

    const left = document.querySelector(".left-labels");

    left.innerHTML = "";

    const letters = "ABCDEFGHIJ";

    for (let i = 0; i < 10; i++) {
      const cell = document.createElement("div");
      cell.textContent = letters[i];
      left.appendChild(cell);
    }
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
                cell.innerText = `${firstLetter}`;
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

    errorBox.innerText = ERROR_TEXT[uiState.errorMsg] || "";

    setTimeout(() => {
      errorBox.innerText = "";
    }, 5000);
  }
    // sync the UI to all ships being successfully placed
    if (!state.ships) return;
    if (state.ships.length === 5) {
        const errorBox = document.querySelector('.ship-error-msg');
        errorBox.innerText = "All ships have been placed!!"

        const uiMessage = document.querySelector('.ui-messages');
        uiMessage.innerHTML = "";
        const startAttackBtn = document.createElement('button');
        startAttackBtn.innerText = "Enter Attack Mode";
        startAttackBtn.classList.add('start-attack-btn');
        uiMessage.append(startAttackBtn);
    }
}
