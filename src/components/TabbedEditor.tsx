import { Extension } from "@codemirror/state";
import { Component, createMemo, createSignal, For, mapArray } from "solid-js";
import { Dynamic } from "solid-js/web";
import { FileEditor } from "./FileEditor";
import { FileData } from "../state/projectData";
import { FileState } from "../state/state";
import { useTheme } from "../state/theme";

interface Props {
  fileStates: FileState[];
  themeExtension: Extension;
}

export const TabbedEditor: Component<Props> = (props) => {
  const theme = useTheme();
  const [getSelectedTab, setSelectedTab] = createSignal(
    props.fileStates[0].data.pathName
  );

  const editorEntries = mapArray(
    () => props.fileStates,
    (fileState) => [
      fileState.data.pathName,
      <FileEditor
        fileState={fileState}
        themeExtension={props.themeExtension}
      />,
    ]
  );

  const editors = createMemo(() => Object.fromEntries(editorEntries()));

  return (
    <div class={theme.tabbedEditorRoot()}>
      <div role="tablist" class={theme.tablist()}>
        <For each={props.fileStates}>
          {(fileState, i) => {
            const file = fileState.data;
            const selected = () => file.pathName === getSelectedTab();
            return (
              <button
                class={theme.tablistItem(selected(), file, i())}
                role="tab"
                aria-selected={selected()}
                onClick={() => setSelectedTab(file.pathName)}
              >
                {file.pathName}
              </button>
            );
          }}
        </For>
      </div>
      <Dynamic component={editors()[getSelectedTab()]} />
    </div>
  );
};
