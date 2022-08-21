import { Extension } from "@codemirror/state";
import {
  Component,
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  on,
  mapArray,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { FileEditor } from "./FileEditor";
import { FileData } from "../../../state/projectData";
import { FileState } from "../../../state/state";
import { useTheme } from "../../../providers/theme";
import { ConductorProvider, useConductor } from "../../../providers/conductor";

interface Props {
  fileStates: FileState[];
  themeExtension: Extension;
}

export const TabbedEditor: Component<Props> = (props) => {
  const theme = useTheme();

  const [conductor, actions] = useConductor();

  actions.navigate(props.fileStates[0].data.pathName);

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
            const selected = () => file.pathName === conductor.currentFile;
            return (
              <button
                class={theme.tablistItem(selected(), file, i())}
                role="tab"
                aria-selected={selected()}
                onClick={() => actions.navigate(file.pathName)}
              >
                {file.pathName}
              </button>
            );
          }}
        </For>
      </div>
      <Dynamic component={editors()[conductor.currentFile]} />
    </div>
  );
};
