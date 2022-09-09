import { Route, Routes } from "solid-app-router";
import { Component, createEffect, createMemo, ErrorBoundary } from "solid-js";
import ProjectEditor, {
  DefaultProjectData,
  LoadProjectData,
} from "./ProjectEditor";
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
