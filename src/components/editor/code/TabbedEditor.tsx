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
import { FilePath, FileState, FileSystemState, isFilePath } from "@/state";
import { useTheme } from "@/providers/theme";
import { ConductorProvider, useConductor } from "@/providers/conductor";

interface Props {
  fileSystem: FileSystemState;
  themeExtension: Extension;
}

const EditPath: Component<{
  initial?: FilePath;
  onSubmit: (validPath: FilePath | false) => void;
}> = (props) => {
  let ref!: HTMLInputElement;

  const [inputPath, setInputPath] = createSignal<string>(
    props.initial || "new.js"
  );

  function submit(e) {
    console.log("blur", e);
    const newPath = inputPath();
    props.onSubmit(isFilePath(newPath) ? newPath : false);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      ref.blur();
    }
  }

  onMount(() => {
    ref.focus();
    if (!props.initial) {
      ref.select();
      return;
    }
    ref.setSelectionRange(0, inputPath().indexOf("."));
  });

  return (
    <input
      ref={ref}
      class="bg-transparent outline-none"
      size={inputPath().length}
      onBlur={submit}
      onKeyDown={onKeyDown}
      onInput={(e) => setInputPath(e.currentTarget.value)}
      type="text"
      value={inputPath()}
    />
  );
};

const TabListItem: Component<{
  index: number;
  pathName?: FilePath;
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

export const TabbedEditor: Component<Props> = (props) => {
  const theme = useTheme();

  const [conductor, { navigate }] = useConductor();

  const [renaming, setRenaming] = createSignal("");
  const [isAdding, setAdding] = createSignal(false);

  navigate(props.fileSystem.fileList[0].id);

  const editorEntries = mapArray(
    () => props.fileSystem.fileList,
    (fileState) => [
      fileState.id,
      <FileEditor
        fileState={fileState}
        themeExtension={props.themeExtension}
      />,
    ]
  );

  const editors = createMemo(() => Object.fromEntries(editorEntries()));

  function tabClicked(fileId: string) {
    if (conductor.file.currentFileId === fileId) {
      setRenaming(fileId);
      return;
    }
    navigate(fileId);
  }

  function renamed(newPath: FilePath | false) {
    if (!renaming()) return;
    if (newPath) {
      props.fileSystem.renameFile(renaming(), newPath);
    }
    setRenaming("");
  }

  function closeFile(id: string, index: number) {
    // TODO: when we have a file system browser, we should just close, not delete.
    setRenaming("");
    if (conductor.file.currentFileId === id) {
      navigate(props.fileSystem.fileList[index - 1]?.id);
    }
    props.fileSystem.removeFile(id);
  }

  function addFile(newPath: FilePath | false) {
    if (!isAdding()) return;
    if (newPath) {
      const newFile = props.fileSystem.addFile("", newPath);
      navigate(newFile.id);
    }
    setAdding(false);
  }

  return (
    <div class={theme.tabbedEditorRoot()}>
      <div role="tablist" class={theme.tablist()}>
        <For each={props.fileSystem.fileList}>
          {(fileState, i) => (
            <TabListItem
              index={i()}
              pathName={fileState.pathName}
              selected={fileState.id === conductor.file.currentFileId}
              editing={fileState.id === renaming()}
              tabClicked={() => tabClicked(fileState.id)}
              closeClicked={() => closeFile(fileState.id, i())}
              edited={renamed}
            ></TabListItem>
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
      <Dynamic component={editors()[conductor.file.currentFileId]} />
    </div>
  );
};
