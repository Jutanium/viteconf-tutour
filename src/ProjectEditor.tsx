import { usePrefersDark } from "@solid-primitives/media";
import {
  Accessor,
  batch,
  Component,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  ErrorBoundary,
} from "solid-js";
import { createStore } from "solid-js/store";
import {
  createFileSystem,
  createProjectState,
  createSlideState,
  ProjectData,
  ProjectState,
} from "@/state";
import { ThemeProvider, useTheme } from "./providers/theme";
import { TabbedEditor } from "./components/editor/code/TabbedEditor";
import { ConductorProvider } from "./providers/conductor";
import { Repl } from "./components/eval/Repl";
import Userbar from "@/components/users/Userbar";

import "@fontsource/open-sans";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/600-italic.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/700-italic.css";
import "@fontsource/open-sans/400-italic.css";
import { useNavigate, useParams, useRouteData } from "solid-app-router";
import { fetchRepo } from "./data/github";
import { createProject, getProjectById } from "./data/projects";
import Slides from "./components/editor/slides/Slides";
import SlideStart from "./components/editor/slides/SlideStart";

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

export function LoadProjectData({ params }) {
  const [projectData] = createResource(() => params.id, getProjectById);
  return createMemo(() => {
    const data = projectData();
    if (data) {
      return createProjectState(data);
    }
  });
}

const ProjectEditor: Component<{}> = (props) => {
  const prefersDark = usePrefersDark();
  const theme = useTheme();

  const navigate = useNavigate();

  createEffect(() => {
    console.log("dark mode", prefersDark());
    if (prefersDark()) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  });

  const project = useRouteData<Accessor<ProjectState>>();
  async function initialSave() {
    console.log("initial save");
    const id = await createProject(project().serialized);
    navigate(`/p/${id}`);
  }

  return (
    // <ConductorProvider>
    <Show when={project()}>
      <div class="flex h-screen">
        <div class="w-1/3">
          <Userbar
            projectData={project().serialized}
            saveButtonClicked={initialSave}
          />
          <Slides project={project()} />
        </div>
        <div class="flex-grow">
          <Show when={project().currentSlide}>
            <Show
              when={project().currentSlide.fileSystem.fileList.length > 0}
              fallback={<SlideStart project={project()} />}
            >
              <TabbedEditor fileSystem={project().currentSlide.fileSystem} />
            </Show>
          </Show>
        </div>
        {/* <Repl fileSystem={currentSlide().fileSystem} /> */}
      </div>
    </Show>
    // </ConductorProvider>
  );
};

export default ProjectEditor;
