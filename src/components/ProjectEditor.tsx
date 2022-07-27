import { usePrefersDark } from "@solid-primitives/media";
import { Component, createEffect, createMemo } from "solid-js";
import { createStore } from "solid-js/store";
import { createFileState } from "../state/state";
import { ThemeProvider, useTheme } from "../state/theme";
import { TabbedEditor } from "./TabbedEditor";
import { MarkdownEditor } from "./MarkdownEditor";

const ProjectEditor: Component<{}> = (props) => {
  const testState = createFileState(
    "beginning\n\n\n<div></div>\n",
    "testFile.html",
    [{ from: 1, to: 4, id: "test" }]
  );

  const jsState = createFileState(
    "\n\n\nconsole.log('hi')\n",
    "testScript.js",
    []
  );

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

  const [fileStates, setFileStates] = createStore([testState, jsState]);

  return (
    <div class="flex h-96">
      <div class="w-1/2">
        <MarkdownEditor themeExtension={themeExtension()} />
      </div>
      <TabbedEditor fileStates={fileStates} themeExtension={themeExtension()} />
    </div>
  );
};

export default ProjectEditor;
