import { useTheme } from "@/providers/theme";
import { FileState, FileSystemState, isFilePath } from "@/state";
import { Component, createMemo } from "solid-js";

const FolderTree: Component<{
  folderPath?: string;
  list: FileState[];
  fileSystem: FileSystemState;
}> = (props) => {
  const theme = useTheme();
  type Folder = {
    folderPath: string;
    files: FileState[];
  };

  const folderName = () => {
    if (props.folderPath) {
      const pieces = props.folderPath.split("/");
      return pieces[pieces.length - 1];
    }
  };

  // This is what happens when I try to write recursion
  const list = createMemo<Array<FileState | Folder>>(() => {
    const folders: {
      [folderPath: string]: FileState[];
    } = {};
    const fileList: FileState[] = [];
    for (const file of props.list) {
      const subpath = props.folderPath
        ? file.pathName.replace(props.folderPath + "/", "")
        : file.pathName;

      const firstSlash = subpath.indexOf("/");
      if (firstSlash === -1) {
        fileList.push(file);
      } else {
        const subfolder = subpath.substring(0, firstSlash);
        const folderPath = props.folderPath
          ? `${props.folderPath}/${subfolder}`
          : subfolder;
        folders[folderPath] = folders[folderPath]
          ? [...folders[folderPath], file]
          : [file];
      }
    }
    const folderList: Folder[] = Object.keys(folders).map((path) => ({
      folderPath: path,
      files: folders[path],
    }));
    return [...folderList, ...fileList];
  });

  const fileClicked = (file: FileState) => {
    if (isFilePath(file.pathName)) {
      file.open();
      props.fileSystem.setCurrentFileId(file.id);
    }
  };

  return (
    <>
      <div class={theme.treeViewRow()}>
        <img class="i-mdi-folder text-sm"></img>
        <span>{folderName()}</span>
        <button
          class={theme.treeViewDelete()}
          onClick={(e) => {
            props.list.forEach(({ id }) => props.fileSystem.removeFile(id));
          }}
        ></button>
      </div>
      <ul class={theme.treeViewIndent()}>
        <For each={list()}>
          {(item) =>
            "pathName" in item ? (
              <li onClick={() => fileClicked(item)} class={theme.treeViewRow()}>
                <button
                  class={theme.treeViewFilename(
                    props.fileSystem.currentFileId === item.id,
                    item.opened,
                    isFilePath(item.pathName)
                  )}
                >
                  {item.pathName.replace(props.folderPath + "/", "")}
                </button>
                <button
                  class={theme.treeViewDelete()}
                  onClick={(e) => {
                    props.fileSystem.removeFile(item.id);
                  }}
                ></button>
                <button></button>
              </li>
            ) : (
              <FolderTree
                folderPath={item.folderPath}
                list={item.files}
                fileSystem={props.fileSystem}
              ></FolderTree>
            )
          }
        </For>
      </ul>
    </>
  );
};

const TreeView: Component<{ fileSystem: FileSystemState }> = (props) => {
  const theme = useTheme();
  return (
    <div class={theme.treeViewRoot()}>
      <FolderTree
        list={props.fileSystem.fileList}
        fileSystem={props.fileSystem}
      />
    </div>
  );
};

export default TreeView;
