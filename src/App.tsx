import { Route, Routes } from "solid-app-router";
import { Component, createEffect, createMemo } from "solid-js";
import ProjectEditor from "./components/editor/ProjectEditor";
import TiptapExperiment from "./components/TiptapExperiment";
import { ThemeProvider } from "./providers/theme";

const App: Component = () => (
  <>
    <ThemeProvider>
      <Routes>
        <Route path="/" component={ProjectEditor} />
        <Route path="/tiptap" component={TiptapExperiment} />
      </Routes>
    </ThemeProvider>
  </>
);

export default App;
