import { Text } from "@codemirror/state";
import { createSignal, createUniqueId } from "solid-js";
import { createStore, Store } from "solid-js/store";

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
// TODO: reimplement CodeLinks. They probably make more sense being stored in the SlideState, and use a Context to interact them beneath.
export interface CodeLink {
  from: number;
  to?: number;
  startLine?: number;
  endLine?: number;
  id: string;
  name: string;
}

export interface CodeLinkWithPath extends CodeLink {
  pathName: FilePath;
}

function createFileState(doc: string, path: FilePath, codeLinks?: CodeLink[]) {
  const [getDocument, setDocument] = createSignal(doc);
  const [getPath, setPath] = createSignal(path);
  const id = createUniqueId();
  // const [state, setState] = createStore<FileData>({
  //   doc,
  //   pathName,
  //   codeLinks: Object.fromEntries(
  //     codeLinks.map((codeLink) => [codeLink.id, codeLink])
  //   ),
  // });
  return {
    get doc() {
      return getDocument();
    },
    get pathName() {
      return getPath();
    },
    id,
    setDoc(newDoc: Text) {
      const string = newDoc.sliceString(0);
      setDocument(string);
    },
    setPathName(newPath: FilePath) {
      if (getPath() === newPath) return false;
      setPath(newPath);
      return true;
    },
  };
}

export type FileState = ReturnType<typeof createFileState>;

export function createFileSystem(initialFiles?: FileState[]) {
  const [files, setFiles] = createStore<{ [id: string]: FileState }>(
    initialFiles
      ? Object.fromEntries(initialFiles.map((file) => [file.id, file]))
      : {}
  );
  const [getSaved, setSaved] = createSignal(0);

  const save = () => setSaved(Date.now());

  const addFile = (...args: Parameters<typeof createFileState>) => {
    const newFile = createFileState(...args);
    setFiles(newFile.id, newFile);
    save();
    return newFile;
  };

  const removeFile = (id: string) => {
    setFiles(id, undefined);
    save();
  };

  const renameFile = (id: string, newPathName: FilePath) => {
    const nameChanged = files[id].setPathName(newPathName);
    if (nameChanged) {
      save();
    }
  };

  return {
    get fileList() {
      return Object.values(files);
    },
    get saved() {
      return getSaved();
    },
    save,
    addFile,
    removeFile,
    renameFile,
  };
}

export type FileSystemState = ReturnType<typeof createFileSystem>;
// const mapWithPath = (file: FileState) =>
//   file.codeLinks.map((codeLink) => ({ ...codeLink, pathName: file.pathName }));

export function createSlideState(cloneFiles?: FileState[]) {
  //Setter will be used when importing file system from GitHub
  const [getFS, setFS] = createSignal(createFileSystem(cloneFiles));
  const [getMD, setMD] = createSignal("");

  return {
    get fileSystem() {
      return getFS();
    },
    get markdown() {
      return getMD();
    },
    setMarkdown(markdown: Text | string) {
      setMD(typeof markdown === "string" ? markdown : markdown.sliceString(0));
    },
  };
}

export type SlideState = ReturnType<typeof createSlideState>;

export function createProjectState() {
  const [getTitle, setTitle] = createSignal("");
  const [slides, setSlides] = createStore<SlideState[]>([]);

  return {
    get title() {
      return getTitle();
    },
    slides,
    setTitle,
    addSlide(newSlide: SlideState) {
      setSlides((slides) => [...slides, newSlide]);
    },
    removeSlide(index: number) {
      setSlides((slides) => slides.filter((_, i) => i !== index));
    },
  };
}
