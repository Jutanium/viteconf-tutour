import { usePrefersDark } from "@solid-primitives/media";
import { Component, createEffect, createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import {
  createFileSystem,
  createProjectState,
  createSlideState,
} from "@/state";
import { ThemeProvider, useTheme } from "../../providers/theme";
import { TabbedEditor } from "./code/TabbedEditor";
import { MarkdownEditor } from "./content/MarkdownEditor";
import { ConductorProvider } from "../../providers/conductor";
import { Repl } from "../eval/Repl";

const ProjectEditor: Component<{}> = (props) => {
  const prefersDark = usePrefersDark();
  const theme = useTheme();

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

  testSlide.fileSystem.addFile(
    "beginning\n\n\n<div></div>\n",
    "testFile.html",
    [{ from: 1, to: 4, id: "test", name: "test" }]
  );

  testSlide.fileSystem.addFile(
    "\n\n\nconsole.log('hi')\n",
    "testScript.js",
    []
  );

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
  slideTwo.fileSystem.addFile("<div>big div</div>", "another.html");

  project.addSlide(testSlide);
  project.addSlide(slideTwo);

  const [slideIndex, setSlideIndex] = createSignal(0);
  const currentSlide = createMemo(() => project.slides[slideIndex()]);

  return (
    <ConductorProvider>
      <div class="flex h-screen" onKeyDown={handleKeyPress}>
        <div class="w-1/2">
          <div class="h-min flex gap-2">
            {/* <For each={project.slides}>
              {(slide, index) => (
                <button
                  class="rounded-full"
                  onClick={() => setSlideIndex(index())}
                >
                  {index() + 1}
                </button>
              )}
            </For> */}
          </div>
        </div>
        <TabbedEditor
          fileSystem={currentSlide().fileSystem}
          themeExtension={themeExtension()}
        />
        {/* <Repl fileSystem={testSlide.fileSystem} /> */}
      </div>
    </ConductorProvider>
  );
};

export default ProjectEditor;
