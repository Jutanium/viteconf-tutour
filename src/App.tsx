import { Component, createEffect, createMemo } from "solid-js";
import { FileEditor } from "./FileEditor";
import { usePrefersDark } from "@solid-primitives/media";
import { defaultDark } from "./codemirror/defaultDark";
import { defaultLight } from "./codemirror/defaultLight";

import { createFileState, FileState } from "./state";
import { TabbedEditor } from "./TabbedEditor";
import { createStore } from "solid-js/store";
const App: Component = () => {
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

  const theme = createMemo(() => {
    return prefersDark() ? defaultDark : defaultLight;
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

  function addFile() {
    // const fileState = createFileState({})
    setFileStates([
      ...fileStates,
      createFileState(jsState.data.doc, `${fileStates.length + 1}.js`, []),
    ]);
  }

  function printData() {
    console.log(fileStates[0].getCodeLinks());
  }

  return (
    <>
      <button onClick={addFile}>add file</button>
      <button onClick={printData}>data</button>
      <div>
        <TabbedEditor fileStates={fileStates} theme={theme()} />
      </div>
    </>
  );
};

export default App;
