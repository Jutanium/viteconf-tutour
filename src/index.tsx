import "uno.css";
import "@unocss/reset/tailwind.css";

import { render } from "solid-js/web";

import App from "./App";
import { Router } from "solid-app-router";

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
