function initRenderers(controller) {
    document.addEventListener("click", (e) => {
        const action = e.target.dataset.action;
        if (!action) return;

        const actions = {
            startGame: () => {
                const nameInput = document.querySelector('#player-name');
                const playerName = nameInput.value.trim();

                controller.dispatch("startGame", { playerName: playerName || 'Guest', });
            },
            //placeShip: 
        };

        const handler = actions[action];
        if (handler) {
            handler();
        }
    });
}

module.exports = { initRenderers };
