import { Extension } from "@codemirror/state";
import { Component, createMemo, createSignal, For, mapArray } from "solid-js";
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
    props.fileStates[0].data.pathName
  );

  const editorEntries = mapArray(
    () => props.fileStates,
    (fileState) => [
      fileState.data.pathName,
      <FileEditor
        fileState={fileState}
        theme={props.theme}
        rootClass={props.editorRootClass}
      />,
    ]
  );

  const editors = createMemo(() => Object.fromEntries(editorEntries()));

  const rootClass = props.rootClass || (() => "w-full h-full flex flex-col");
  const tablistClass = props.tablistClass || (() => "w-full flex px-1");
  const tablistItemClass =
    props.tablistItemClass ||
    ((selected: boolean, file: FileData, index: number) => {
      const base = `border-b-2 font-mono font-semibold px-1 text-sm border-r-0`;
      const highlighted = selected
        ? `bg-gray-200 border-blue-400 dark:bg-black`
        : `dark:bg-gray-500`;
      const dark = `dark:text-white`;
      const alternate =
        !selected && (index % 2 === 0 ? "border-gray-400" : "border-gray-700");
      return `${base} ${dark} ${highlighted} ${alternate}`;
    });

  return (
    <div class={rootClass()}>
      <div role="tablist" class={tablistClass()}>
        <For each={props.fileStates}>
          {(fileState, i) => {
            const file = fileState.data;
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
      <Dynamic component={editors()[getSelectedTab()]} />
    </div>
  );
};
