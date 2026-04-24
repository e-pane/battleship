const { createEngine } = require("../src/engine");


test("engine is created properly", () => {
    const engine = createEngine();

    engine.start('Harry');

    expect(engine.state.player).toBeDefined();
    expect(engine.state.computer).toBeDefined();
    expect(engine).toHaveProperty("placeShip");
    expect(engine).toHaveProperty("start");
    expect(engine.state.player.name).toBe('Harry');
    expect(engine.state.computer.name).toBe('computer');
    expect(engine.state.phase).toBe('shipPlacement');
    expect(engine.state.turn).toBe('player');
    expect(engine.state.gameOver).toBe(false);
    //write a mock gameboard.placeShip(
    
    engine.state.player.gameboard.placeShip = jest.fn();
    engine.placeShip('cruiser', 3, 5, 'vert');
    expect(engine.state.player.gameboard.placeShip).toHaveBeenCalled();
    expect(engine.state.player.gameboard.placeShip).toHaveBeenCalledTimes(1);
    expect(engine.state.player.gameboard.placeShip).toHaveBeenCalledWith(
      expect.any(Object), // ship from createShip
      3,
      5,
      'vert',
    );
});
