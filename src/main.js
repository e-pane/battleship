import "./css/base.css";
import "./css/layout.css";
import "./css/components.css";
import "./css/forms.css";

import {
  renderStartScreen,
  renderShipPlacementScreen,
  initRenderers,
} from "./renderers.js";

import { createEngine } from "./engine";
import { createHandlers } from "./handlers";
import { createController } from "./controller";

const engine = createEngine();

const handlers = createHandlers(engine);
const controller = createController(engine, handlers);
initRenderers(controller);

renderStartScreen();
