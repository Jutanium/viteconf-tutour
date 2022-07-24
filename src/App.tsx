import { Route, Routes } from "solid-app-router";
import { Component, createEffect, createMemo } from "solid-js";
import ProjectEditor from "./ProjectEditor";
import TiptapExperiment from "./TiptapExperiment";

const App: Component = () => (
  <Routes>
    <Route path="/editor" component={ProjectEditor} />
    <Route path="/tiptap" component={TiptapExperiment} />
  </Routes>
);

export default App;
