import { DirectoryEntry, FileSystemTree } from "@webcontainer/api";
import { createSignal } from "solid-js";

const fileTypes = ["ts", "js", "tsx", "jsx", "json", "md", "html", "css"];
export type FileType = typeof fileTypes[number];

export type FilePath = `${string}.${FileType}`;

export function isFilePath(path: string): path is FilePath {
  return fileTypes.some((type) => path.endsWith(`.${type}`));
}

export function getFileType(path: FilePath): FileType {
  const parts = path.split(".");
  return parts[parts.length - 1] as FileType;
}

export type FileData = Readonly<{
  id: string;
  doc: string;
  path: string;
  opened: boolean;
}>;

export function createFileState({ id, doc, path, opened }: FileData) {
  const [getDocument, setDocument] = createSignal(doc);
  const [getPath, setPath] = createSignal(path);
  const [getOpened, setOpened] = createSignal(opened);

  const serialized = () => {
    return {
      id,
      opened: getOpened(),
      doc: getDocument(),
      path: getPath(),
    };
  };

  const [saved, setSaved] = createSignal(0);
  const save = () => setSaved(Date.now());
  save();

  return {
    get doc() {
      return getDocument();
    },
    get pathName() {
      return getPath();
    },
    get serialized() {
      return serialized();
    },
    get opened() {
      return getOpened();
    },
    get saved() {
      return saved();
    },
    id,
    save,
    close() {
      setOpened(false);
    },
    open() {
      setOpened(true);
    },
    setDoc(newDoc: Text) {
      const string = newDoc.sliceString(0);
      setDocument(string);
    },
    setPathName(newPath: FilePath) {
      if (getPath() === newPath) return false;
      setPath(newPath);
      save();
    },
  };
}

export type FileState = ReturnType<typeof createFileState>;
