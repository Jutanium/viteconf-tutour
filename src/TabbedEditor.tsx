import { Extension } from "@codemirror/state";
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  mapArray,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { FileEditor } from "./FileEditor";
import { FileData } from "./projectData";
import { FileState } from "./state";

interface Props {
  fileStates: FileState[];
  theme: Extension;
  editorRootClass?: (file: FileData) => string;
  rootClass?: () => string;
  tablistClass?: () => string;
  tablistItemClass?: (
    selected: boolean,
    file: FileData,
    index: number
  ) => string;
}

export const TabbedEditor: Component<Props> = (props) => {
  const [getSelectedTab, setSelectedTab] = createSignal(
    props.fileStates[0].file.pathName
  );

  createEffect(() => {
    console.log(entries());
  });

  const entries = mapArray(
    () => props.fileStates,
    (fileState) => [
      fileState.file.pathName,
      <FileEditor
        fileState={fileState}
        theme={props.theme}
        rootClass={props.editorRootClass}
      />,
    ]
  );

  const editors = createMemo(() => Object.fromEntries(entries()));

  const rootClass = props.rootClass || (() => "w-full h-full flex flex-col");
  const tablistClass = props.tablistClass || (() => "w-full flex px-1");
  const tablistItemClass =
    props.tablistItemClass ||
    ((selected: boolean, file: FileData, index: number) => {
      const base = `border-b font-mono font-semibold px-1 text-sm border-r-0`;
      const highlighted = selected && `bg-gray-200 border-b-2`;
      return `${base} ${highlighted}`;
    });

  return (
    <div class={rootClass()}>
      <div role="tablist" class={tablistClass()}>
        <For each={props.fileStates}>
          {(fileState, i) => {
            const file = fileState.file;
            const selected = () => file.pathName === getSelectedTab();
            return (
              <button
                class={tablistItemClass(selected(), file, i())}
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
      {editors()[getSelectedTab()]}
    </div>
  );
};
