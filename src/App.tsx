import { Route, Routes } from "solid-app-router";
import { Component, createEffect, createMemo, ErrorBoundary } from "solid-js";
import ProjectEditor from "./ProjectEditor";
import { AuthProvider } from "./providers/auth";
import { ThemeProvider } from "./providers/theme";

const App: Component = () => (
  <>
    <AuthProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/" component={ProjectEditor} />
          <Route path="/:id" component={ProjectEditor} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  </>
);

export default App;
