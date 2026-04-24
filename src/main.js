import "../styles.css";

const { initRenderers } = require("./renderers");
const { createEngine } = require("./engine");
const { createHandlers } = require("./handlers");
const { createController } = require("./controller");

const engine = createEngine();
const handlers = createHandlers(engine);
const controller = createController(handlers);
initRenderers(controller);
