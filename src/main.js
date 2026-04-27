import "../styles.css";
import { renderStartScreen, renderShipPlacementScreen, initRenderers } from "./renderers.js";


import { createEngine } from "./engine";
import { createHandlers } from "./handlers";
import { createController } from "./controller";

const engine = createEngine();
const handlers = createHandlers(engine);
const controller = createController(handlers);
initRenderers(controller);

renderStartScreen();
