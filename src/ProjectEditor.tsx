import { usePrefersDark } from "@solid-primitives/media";
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  ErrorBoundary,
} from "solid-js";
import { createStore } from "solid-js/store";
import {
  createFileSystem,
  createProjectState,
  createSlideState,
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
import { useParams } from "solid-app-router";
import { getDegit } from "./data/github";

const ProjectEditor: Component<{}> = (props) => {
  const prefersDark = usePrefersDark();
  const theme = useTheme();

  const params = useParams();
  console.log(params.id);

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

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      testSlide.fileSystem.save();
      console.log("saving");
    }
  }

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

  const [slideIndex, setSlideIndex] = createSignal(0);
  const currentSlide = createMemo(() => project.slides[slideIndex()]);

  return (
    <ConductorProvider>
      <div class="flex h-screen" onKeyDown={handleKeyPress}>
        <div class="w-1/2">
          <Userbar projectData={project.serialized} />
          <div class="h-min flex gap-2">
            <button onClick={() => getDegit("solidjs/templates/js")}>GH</button>
            <For each={project.slides}>
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
          <div>
            <For each={project.slides}>
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
          </div>
        </div>
        <div class="w-1/2">
          <TabbedEditor
            fileSystem={currentSlide().fileSystem}
            themeExtension={themeExtension()}
          />
        </div>
        {/* <Repl fileSystem={testSlide.fileSystem} /> */}
      </div>
    </ConductorProvider>
  );
};

export default ProjectEditor;
