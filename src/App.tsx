import { Route, Routes } from "solid-app-router";
import { Component, createEffect, createMemo } from "solid-js";
import ProjectEditor from "./components/editor/ProjectEditor";
import { ThemeProvider } from "./providers/theme";

const App: Component = () => (
  <>
    <ThemeProvider>
      <Routes>
        <Route path="/" component={ProjectEditor} />
      </Routes>
    </ThemeProvider>
  </>
);

export default App;
