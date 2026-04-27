import { createHandlers } from "../src/handlers.js";

test('handleStartGame starts game with payload name', () => {
    const mockEngine = {
        start: jest.fn(),
    }

    const handler = createHandlers(mockEngine);
    handler.startGame({ name: 'Harry' });

    expect(mockEngine.start).toHaveBeenCalledTimes(1);
    expect(mockEngine.start).toHaveBeenCalledWith('Harry');
});
