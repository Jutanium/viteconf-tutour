import { usePrefersDark } from "@solid-primitives/media";
import { Component, createEffect, createMemo } from "solid-js";
import { createStore } from "solid-js/store";
import { createFileState, createSlideState } from "../../state/state";
import { ThemeProvider, useTheme } from "../../providers/theme";
import { TabbedEditor } from "./code/TabbedEditor";
import { MarkdownEditor } from "./content/MarkdownEditor";
import { ContentEditor } from "./content/ContentEditor";
import { ConductorProvider } from "../../providers/conductor";

const ProjectEditor: Component<{}> = (props) => {
  const testSlide = createSlideState();

  testSlide.addFile("beginning\n\n\n<div></div>\n", "testFile.html", [
    { from: 1, to: 4, id: "test" },
  ]);

  testSlide.addFile("\n\n\nconsole.log('hi')\n", "testScript.js", []);

  testSlide.setMarkdown(`# Testing
more stuff
## Asdf
etc
### aasdfasdf
asdf
#### asdfasdf
asfasdf
  `);

  const prefersDark = usePrefersDark();

  const themeExtension = createMemo(() => {
    const theme = useTheme();
    return prefersDark()
      ? theme.codemirror.darkTheme
      : theme.codemirror.lightTheme;
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

  return (
    <ConductorProvider>
      <div class="flex h-96">
        <div class="w-1/2">
          <ContentEditor
            themeExtension={themeExtension()}
            slideState={testSlide}
          />
        </div>
        <TabbedEditor
          fileStates={testSlide.files}
          themeExtension={themeExtension()}
        />
      </div>
    </ConductorProvider>
  );
};

export default ProjectEditor;
