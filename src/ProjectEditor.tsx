import { usePrefersDark } from "@solid-primitives/media";
import {
  Accessor,
  batch,
  Component,
  createEffect,
  createMemo,
  createResource,
  on,
  createSignal,
  ErrorBoundary,
  onMount,
} from "solid-js";
import { createStore } from "solid-js/store";
import {
  createFileSystem,
  createProjectState,
  createSlideState,
  ProjectData,
  ProjectState,
} from "@/state/state";
import { ThemeProvider, useTheme } from "./providers/theme";
import { TabbedEditor } from "./components/editor/code/TabbedEditor";
import { ConductorProvider } from "./providers/conductor";
import { Repl } from "./components/eval/Repl";
import Userbar from "@/components/userbar/Userbar";

import "@fontsource/open-sans";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/600-italic.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/700-italic.css";
import "@fontsource/open-sans/400-italic.css";
import { useNavigate, useParams, useRouteData } from "solid-app-router";
import { fetchRepo } from "./data/github";
import { saveProject, getProjectById } from "./data/projects";
import Slides from "./components/editor/slides/Slides";
import SlideStart from "./components/editor/slides/SlideStart";
import { supabase } from "@/data/supabaseClient";
import { useAuth } from "./providers/auth";

//Todo: load this from somewhere
export function DefaultProjectData() {
  const project = createProjectState();
  const testSlide = createSlideState();

  const testFS = createFileSystem();
  testFS.addFile({
    doc: "beginning\n\n\n<div></div>\n",
    path: "testFile.html",
  });

  testFS.addFile({
    doc: "\n\n\nconsole.log('hi')\n",
    path: "testScript.js",
  });

  const fs2 = createFileSystem();
  fs2.addFile({
    doc: "<div>big div</div>",
    path: "another.html",
  });

  project.addSlide({
    fs: testFS.serialized,
    md: `# Testing
more stuff
## Asdf
etc
### aasdfasdf
asdf
#### asdfasdf
asfasdf
  `,
  });
  project.addSlide({ fs: fs2.serialized, md: `# Slide Two` });

  console.log(project);
  return createMemo(() => project);
}

export function LoadProjectData({ params, navigate }) {
  const [result] = createResource(() => params.id, getProjectById);
  const [auth] = useAuth();
  console.log("does this work yet", auth.session);
  return createMemo(() => {
    const data = result();
    if (data) {
      if (data.error) {
        navigate("/");
      }
      const { projectData, id, userId } = data;
      return createProjectState(projectData, id, userId);
    }
  });
}

const ProjectEditor: Component = () => {
  const theme = useTheme();

  const project = useRouteData<Accessor<ProjectState>>();
  const [auth] = useAuth();
  const navigate = useNavigate();

  const saveable = createMemo(
    () => project()?.savedId && project().createdBy === auth.session?.user.id
  );

  const [saveData, setSaveData] = createSignal<ProjectData>();
  const [saved] = createResource(saveData, async function (data) {
    if (saveable()) {
      const id = await saveProject(data, project().savedId);
      return id;
    }
  });

  const lastSavedAt = createMemo(() => {
    const savedResult = saved();
    if (savedResult) {
      return savedResult.updated_at;
    }
  });

  async function saveButtonClicked() {
    if (saveable()) {
      setSaveData(project().serialized);
      return;
    }
    const result = await saveProject(project().serialized);
    if (result) {
      navigate(`/p/${result?.id}`);
    }
  }

  createEffect(
    on(project, () => {
      if (project() && auth.session) {
        if (project().createdBy === auth.session.user.id) {
          project().setPreviewMode(false);
          return;
        }
        project().setPreviewMode(true);
      }
    })
  );

  return (
    <Show when={project()}>
      <div class="dark flex h-screen w-full bg-oneDark-background">
        <div class="w-1/3 flex flex-col border-r-1 border-oneDark-selection">
          <Userbar
            project={project()}
            saveable={saveable()}
            saving={saved.loading}
            lastSavedAt={lastSavedAt()}
            saveButtonClicked={saveButtonClicked}
          />
          <Slides project={project()} />
        </div>
        <div class="w-2/3 flex flex-col lg:flex-row">
          <Show when={project().currentSlide}>
            <div class="w-full h-1/2 flex-grow lg:w-1/2 lg:h-full border-b-1 lg:border-r-1 lg:border-b-0 border-oneDark-selection">
              <Show
                when={project().currentSlide.fileSystem.fileList.length > 0}
                fallback={<SlideStart project={project()} />}
              >
                <TabbedEditor fileSystem={project().currentSlide.fileSystem} />
              </Show>
            </div>
            <Repl fileSystem={project().currentSlide.fileSystem} />
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default ProjectEditor;
