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
import { FileState, FileSystemState } from "@/state";
import { useTheme } from "@/providers/theme";
import { ConductorProvider, useConductor } from "@/providers/conductor";

interface Props {
  fileSystem: FileSystemState;
  themeExtension: Extension;
}

export const TabbedEditor: Component<Props> = (props) => {
  const theme = useTheme();

  const [conductor, { navigate }] = useConductor();

  navigate(props.fileSystem.fileList[0].pathName);

  const editorEntries = mapArray(
    () => props.fileSystem.fileList,
    (fileState) => [
      fileState.pathName,
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
        <For each={props.fileSystem.fileList}>
          {(fileState, i) => {
            const selected = () =>
              fileState.pathName === conductor.file.currentFile;
            return (
              <button
                class={theme.tablistItem(selected(), fileState, i())}
                role="tab"
                aria-selected={selected()}
                onClick={() => navigate(fileState.pathName)}
              >
                {fileState.pathName}
              </button>
            );
          }}
        </For>
      </div>
      <Dynamic component={editors()[conductor.file.currentFile]} />
    </div>
  );
};
