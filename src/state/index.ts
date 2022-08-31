import { Text } from "@codemirror/state";
import { createSignal } from "solid-js";
import { createStore, Store } from "solid-js/store";
import { FileEditor } from "../components/editor/code/FileEditor";

export type FileType =
  | "html"
  | "js"
  | "jsx"
  | "tsx"
  | "ts"
  | "css"
  | "json"
  | "md";

export type FilePath = `${string}.${FileType}`;

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

function createFileState(doc: string, path: FilePath, codeLinks: CodeLink[]) {
  const [getDocument, setDocument] = createSignal(doc);
  const [getPath, setPath] = createSignal(path);
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

    setDoc(newDoc: Text) {
      const string = newDoc.sliceString(0);
      setDocument(string);
    },
    setPathName(newPath: FilePath) {
      setPath(newPath);
    },
  };
}

export type FileState = ReturnType<typeof createFileState>;

export function createFileSystem(initialFiles?: FileState[]) {
  const [files, setFiles] = createStore<FileState[]>(initialFiles || []);
  const [getSaved, setSaved] = createSignal(0);

  const addFile = (...args: Parameters<typeof createFileState>) => {
    setFiles((files) => [...files, createFileState(...args)]);
  };

  const removeFile = (pathName: string) => {
    setFiles((files) => files.filter((file) => file.pathName !== pathName));
  };

  const renameFile = (oldPathName: FilePath, newPathName: FilePath) => {
    files
      .find((file) => file.pathName === oldPathName)
      ?.setPathName(newPathName);
  };

  const save = () => setSaved(Date.now());

  return {
    get fileList() {
      return files;
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

export function createSlideState() {
  //Setter will be used when importing file system from GitHub
  const [getFS, setFS] = createSignal(createFileSystem());
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
