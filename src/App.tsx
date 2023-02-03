import { Route, Routes } from "@solidjs/router";
import { Component, createEffect, createMemo, ErrorBoundary } from "solid-js";
import ProjectEditor from "./components/editor/ProjectEditor";
import {
  DefaultProjectData,
  LoadProjectData,
} from "./components/editor/ProjectEditor.data";
import { AuthProvider } from "./providers/auth";
import { ThemeProvider } from "./providers/theme";

const App: Component = () => (
  <>
    <AuthProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/" component={ProjectEditor} data={DefaultProjectData} />
          <Route
            path="/p/:id"
            component={ProjectEditor}
            data={LoadProjectData}
          />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  </>
);

export default App;
