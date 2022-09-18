import { Extension } from "@codemirror/state";
import {
  Component,
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  on,
  mapArray,
  onMount,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { FileEditor } from "./FileEditor";
import {
  FilePath,
  FileState,
  FileSystemState,
  isFilePath,
} from "@/state/state";
import { useTheme } from "@/providers/theme";
import { ConductorProvider, useConductor } from "@/providers/conductor";
import { indentWithTab } from "@codemirror/commands";
import EditPath from "./EditPath";
import TreeView from "./TreeView";

const TabListItem: Component<{
  index: number;
  pathName?: string;
  selected: boolean;
  editing: boolean;
  tabClicked?: () => void;
  closeClicked: () => void;
  edited: (newPath) => void;
}> = (props) => {
  const theme = useTheme();

  function mouseDown(e: MouseEvent) {
    e.preventDefault();
  }

  return (
    <div class={theme.tablistItem(props.selected, props.index)}>
      <button
        role="tab"
        aria-selected={props.selected}
        onClick={props.tabClicked}
      >
        <Show when={props.editing} fallback={props.pathName}>
          <EditPath initial={props.pathName} onSubmit={props.edited} />
        </Show>
      </button>
      <button
        class={theme.tablistItemClose()}
        onClick={props.closeClicked}
        onMouseDown={mouseDown}
      >
        ✕
      </button>
    </div>
  );
};

interface Props {
  fileSystem: FileSystemState;
}

export const TabbedEditor: Component<Props> = (props) => {
  const theme = useTheme();

  const [renaming, setRenaming] = createSignal("");
  const [isAdding, setAdding] = createSignal(false);
  const [treeViewShown, setTreeViewShown] = createSignal(false);

  createEffect(() => {
    console.log(treeViewShown());
  });

  const openedFiles = createMemo<FileState[]>(() =>
    props.fileSystem.fileList.filter((f) => f.opened)
  );

  function tabClicked(fileId: string) {
    if (props.fileSystem.currentFileId === fileId) {
      setRenaming(fileId);
      return;
    }
    props.fileSystem.setCurrentFileId(fileId);
  }

  function renamed(newPath: FilePath | false) {
    if (!renaming()) return;
    if (newPath) {
      props.fileSystem.renameFile(renaming(), newPath);
    }
    setRenaming("");
  }

  function closeFile(id: string, index: number) {
    setRenaming("");
    props.fileSystem.fileList.find((f) => f.id === id).close();
  }

  createEffect(
    on(openedFiles, (files, prevFiles) => {
      if (
        prevFiles &&
        files.length < prevFiles.length &&
        files.length >= 1 &&
        !files.find((f) => f.id === props.fileSystem.currentFileId)
      ) {
        const index = prevFiles.findIndex(
          (f) => f.id === props.fileSystem.currentFileId
        );
        props.fileSystem.setCurrentFileId(files[index > 0 ? index - 1 : 0].id);
      }
    })
  );

  function addFile(newPath: FilePath | false) {
    if (!isAdding()) return;
    if (newPath) {
      const newFile = props.fileSystem.addFile({ doc: "", path: newPath });
      props.fileSystem.setCurrentFileId(newFile.id);
    }
    setAdding(false);
  }

  return (
    <div class={theme.tabbedEditorRoot()}>
      <div role="tablist" class={theme.tablist()}>
        {/* <div class="h-full w-8 flex items-center justify-center hover:bg-oneDark-selection transition transition-colors">
          <button class="i-mdi-folder text-oneDark-ivory" />
        </div> */}
        <button
          class={theme.tablistFolder(treeViewShown())}
          onClick={() => setTreeViewShown((shown) => !shown)}
        >
          <img class="i-mdi-folder"></img>
          <span class="hidden">Open File Tree View</span>
        </button>
        <For each={openedFiles()}>
          {(fileState, i) => (
            <>
              <TabListItem
                index={i()}
                pathName={fileState.pathName}
                selected={fileState.id === props.fileSystem.currentFileId}
                editing={fileState.id === renaming()}
                tabClicked={() => tabClicked(fileState.id)}
                closeClicked={() => closeFile(fileState.id, i())}
                edited={renamed}
              ></TabListItem>
            </>
          )}
        </For>
        <Show when={isAdding()}>
          <TabListItem
            index={props.fileSystem.fileList.length}
            selected={false}
            editing={true}
            closeClicked={() => setAdding(false)}
            edited={addFile}
          />
        </Show>
        <button class={theme.tablistAdd()} onClick={() => setAdding(true)}>
          +
        </button>
      </div>
      <div class="flex flex-row">
        <Show when={treeViewShown()}>
          <TreeView fileSystem={props.fileSystem} />
        </Show>
        <For each={props.fileSystem.fileList}>
          {(fileState, i) => (
            <Show when={fileState.id === props.fileSystem.currentFileId}>
              <FileEditor fileState={fileState} />
            </Show>
          )}
        </For>
      </div>
    </div>
  );
};
