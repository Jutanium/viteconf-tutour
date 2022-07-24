import { Route, Routes } from "solid-app-router";
import { Component, createEffect, createMemo } from "solid-js";
import ProjectEditor from "./components/ProjectEditor";
import TiptapExperiment from "./components/TiptapExperiment";
import { ThemeProvider } from "./state/theme";

const App: Component = () => (
  <>
    <ThemeProvider>
      <Routes>
        <Route path="/editor" component={ProjectEditor} />
        <Route path="/tiptap" component={TiptapExperiment} />
      </Routes>
    </ThemeProvider>
  </>
);

export default App;
