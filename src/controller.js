function createController(handlers) {
    const controller = Object.create(null);

    controller.dispatch = (intent, payload) => {
            if (typeof intent !== 'string') {
                throw new Error(`unknown action: ${intent}`);
            }
        
            const handler = handlers[intent];
            
            if (!handler) {
                throw new Error(`unknown action: ${intent}`);
            }
        
            handler(payload);
    };

    return controller;
}

module.exports = { createController }; 
