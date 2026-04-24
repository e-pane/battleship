function createHandlers(engine) {
  return {
    startGame: (payload) => handleStartGame(engine, payload),
    //more registry handlers with engine as a DI
  };
}

function handleStartGame(engine, payload) {
  engine.start(payload.name);
  //more start up code
}

module.exports = { createHandlers };