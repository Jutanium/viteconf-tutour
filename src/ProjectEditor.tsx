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
import { MarkdownEditor } from "./components/editor/content/MarkdownEditor";
import { ConductorProvider } from "./providers/conductor";
import { Repl } from "./components/eval/Repl";
import { MarkdownPreview } from "./components/editor/content/MarkdownPreview";
import Userbar from "@/components/users/Userbar";

import "@fontsource/open-sans";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/600-italic.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/700-italic.css";
import "@fontsource/open-sans/400-italic.css";
import { useNavigate, useParams, useRouteData } from "solid-app-router";
import { getDegit } from "./data/github";
import { createProject, getProjectById } from "./data/projects";

//Todo: load this from somewhere
export function DefaultProjectData() {
  const project = createProjectState();
  const testSlide = createSlideState();

  testSlide.fileSystem.addFile({
    doc: "beginning\n\n\n<div></div>\n",
    path: "testFile.html",
  });

  testSlide.fileSystem.addFile({
    doc: "\n\n\nconsole.log('hi')\n",
    path: "testScript.js",
  });

  testSlide.setMarkdown(`# Testing
more stuff
## Asdf
etc
### aasdfasdf
asdf
#### asdfasdf
asfasdf
  `);

  const slideTwo = createSlideState();

  slideTwo.fileSystem.addFile({
    doc: "<div>big div</div>",
    path: "another.html",
  });
  slideTwo.setMarkdown(`# Slide Two`);

  project.addSlide(testSlide);
  project.addSlide(slideTwo);

  return createMemo(() => project);
}

async function getInitialProject(id) {
  if (id) {
    const project = await getProjectById(id);
    if (project) return createProjectState(project);
  }
}
export function LoadProjectData({ params }) {
  const [projectState] = createResource(() => params.id, getInitialProject);
  return projectState;
}

const ProjectEditor: Component<{}> = (props) => {
  const prefersDark = usePrefersDark();
  const theme = useTheme();

  const navigate = useNavigate();

  const themeExtension = createMemo(() => {
    if (theme) {
      return prefersDark()
        ? theme.codemirror.darkTheme
        : theme.codemirror.lightTheme;
    }
  });

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
  // const octokit = new Octokit({
  //   // auth: provider_token,
  //   auth: session.provider_token,
  //   userAgent: "tutour server",
  // });

  // const fetchPath = async (path: string) => {
  //   const response = await octokit.rest.repos.getContent({
  //     owner,
  //     repo,
  //     path,
  //   });
  //   const dataArray = response.data as Array<{
  //     url: string;
  //     path: string;
  //     sha: string;
  //     type: string;
  //   }>;

  //   const files = await Promise.all(
  //     dataArray.map(async (fileData) => {
  //       if (fileData.type === "dir") {
  //         return await fetchPath(fileData.path);
  //       }
  //       const { url, path: repoPath, sha } = fileData;
  //       const {
  //         data: { content },
  //       } = await octokit.rest.git.getBlob({
  //         owner,
  //         repo,
  //         file_sha: sha,
  //       });

  //       return { path, content };
  //     })
  //   );

  //   return files.flat();
  // };

  // const files = await fetchPath(path);

  // console.log(files);
  // return files;

  // const project = createMemo(() => createProjectState(projectData));
  // function handleKeyPress(e: KeyboardEvent) {
  //   if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
  //     e.preventDefault();
  //     testSlide.fileSystem.save();
  //     console.log("saving");
  //   }
  // }

  // createResource(() => project.serialized, async (serialized) => {
  // update if there's an existing hash
  // })

  // createEffect(() => {
  //   console.log("serialized", project().serialized);
  // });

  async function initialSave() {
    console.log("initial save");
    const id = await createProject(project().serialized);
    navigate(`/p/${id}`);
  }

  const [slideIndex, setSlideIndex] = createSignal(0);
  const currentSlide = createMemo(() => project()?.slides[slideIndex()]);

  return (
    <ConductorProvider>
      <div class="flex h-screen">
        <div class="w-1/2">
          <Show when={project()}>
            <Userbar
              projectData={project().serialized}
              saveButtonClicked={initialSave}
            />
          </Show>
          <Show when={project()}>
            <div class="h-min flex gap-2">
              <button onClick={() => getDegit("solidjs/templates/js")}>
                GH
              </button>
              <For each={project().slides}>
                {(slide, index) => (
                  <button
                    class="rounded-full"
                    onClick={() => setSlideIndex(index())}
                  >
                    {index() + 1}
                  </button>
                )}
              </For>
            </div>
          </Show>
          <div>
            <Show when={project()?.slides}>
              <For each={project().slides}>
                {(slide, index) => (
                  <Show
                    when={index() === slideIndex()}
                    fallback={<MarkdownPreview markdown={slide.markdown} />}
                  >
                    <MarkdownEditor
                      themeExtension={themeExtension()}
                      startingMarkdown={slide.markdown}
                      updateMarkdown={slide.setMarkdown}
                    />
                  </Show>
                )}
              </For>
            </Show>
          </div>
        </div>
        <div class="w-1/2">
          <Show when={currentSlide()}>
            <TabbedEditor
              fileSystem={currentSlide().fileSystem}
              themeExtension={themeExtension()}
            />
          </Show>
        </div>
        {/* <Repl fileSystem={testSlide.fileSystem} /> */}
      </div>
    </ConductorProvider>
  );
};

export default ProjectEditor;
