import { Component, createMemo } from "solid-js";
import { FileEditor } from "./FileEditor";
import { basicDark } from "cm6-theme-basic-dark";
import { basicLight } from "cm6-theme-basic-light";
import { usePrefersDark } from "@solid-primitives/media";

import { createFileState, FileState } from "./state";
import { TabbedEditor } from "./TabbedEditor";
import { createStore } from "solid-js/store";
const App: Component = () => {
  const testState = createFileState({
    doc: "\n\n\n<div></div>\n",
    pathName: "testFile.html",
    codeLinks: [],
  });

  const jsState = createFileState({
    doc: "\n\n\nconsole.log('hi')\n",
    pathName: "testScript.js",
    codeLinks: [],
  });

  const prefersDark = usePrefersDark();
  const theme = createMemo(() => {
    return prefersDark() ? basicDark : basicLight;
  });

  const [fileStates, setFileStates] = createStore([testState, jsState]);

  function buttonClick() {
    // const fileState = createFileState({})
    setFileStates([
      ...fileStates,
      createFileState(
        Object.assign({}, jsState.file, {
          pathName: `${fileStates.length + 1}.js`,
        })
      ),
    ]);
  }

  return (
    <>
      <button onClick={buttonClick}>add file</button>
      <div>
        <TabbedEditor fileStates={fileStates} theme={theme()} />
      </div>
    </>
  );
};

export default App;
