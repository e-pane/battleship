export function createController(engine, handlers) {
    const controller = Object.create(null);

    const uiState = {
      orientation: "horizontal",
      errorMsg: null,
    };

    controller.dispatch = (intent, payload) => {
            if (typeof intent !== 'string') {
                throw new Error(`unknown action: ${intent}`);
            }
        
            const handler = handlers[intent];
            
            if (!handler) {
                throw new Error(`unknown action: ${intent}`);
            }
        
            handler(payload, uiState);
    };

    controller.getPhase = () => engine.state.phase;

    return controller;
}

