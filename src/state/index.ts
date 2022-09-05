import { Text } from "@codemirror/state";
import { createMemo, createSignal, createUniqueId } from "solid-js";
import { createStore, Store } from "solid-js/store";

/* Each state factory exposes a serialized getter that returns
 * a corresponding data type. This in turn can be passed as an argument
 * to the state factory to deserialize it.
 */

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

export type FileData = Readonly<{
  id: string;
  doc: string;
  path: string;
}>;

type FileStateArgs = Omit<FileData, "id"> & { id?: string };

function createFileState({ id: _id, doc, path }: FileStateArgs) {
  const [getDocument, setDocument] = createSignal(doc);
  const [getPath, setPath] = createSignal(path);
  const id = _id || createUniqueId();

  const serialized = createMemo<FileData>(() => {
    return {
      id,
      doc: getDocument(),
      path: getPath(),
    };
  });
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
    get serialized() {
      return serialized();
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

export type FileSystemData = Readonly<{
  files: FileData[];
}>;
export function createFileSystem(data?: FileSystemData) {
  const [files, setFiles] = createStore<{ [id: string]: FileState }>(
    data
      ? Object.fromEntries(
          data.files.map((file) => [file.id, createFileState(file)])
        )
      : {}
  );
  const [getSaved, setSaved] = createSignal(0);

  const serialized = createMemo<FileSystemData>(() => {
    return {
      files: Object.values(files).map((file) => file.serialized),
    };
  });

  const save = () => setSaved(Date.now());

  const addFile = (args: FileStateArgs) => {
    const newFile = createFileState(args);
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

  //serialized memo

  return {
    get fileList() {
      return Object.values(files);
    },
    get saved() {
      return getSaved();
    },
    get serialized() {
      return serialized();
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

export type SlideData = Readonly<{
  fs: FileSystemData;
  md: string;
}>;
export function createSlideState(data?: SlideData) {
  //Setter will be used when importing file system from GitHub
  const [getFileSystem, setFileSystem] = createSignal(
    createFileSystem(data?.fs)
  );
  const [getMarkdown, setMarkdown] = createSignal(data?.md || "");

  const serialized = createMemo<SlideData>(() => {
    return {
      fs: getFileSystem().serialized,
      md: getMarkdown(),
    };
  });

  return {
    get fileSystem() {
      return getFileSystem();
    },
    get markdown() {
      return getMarkdown();
    },
    get serialized() {
      return serialized();
    },
    setMarkdown(markdown: Text | string) {
      setMarkdown(
        typeof markdown === "string" ? markdown : markdown.sliceString(0)
      );
    },
  };
}

export type SlideState = ReturnType<typeof createSlideState>;

export type ProjectData = Readonly<{
  title: string;
  slides: SlideData[];
}>;

export function createProjectState(data?: ProjectData) {
  const [getTitle, setTitle] = createSignal(data?.title || "");
  const [slides, setSlides] = createStore<SlideState[]>(
    data?.slides.map(createSlideState) || []
  );

  const serialized = createMemo<ProjectData>(() => {
    return {
      title: getTitle(),
      slides: slides.map((slide) => slide.serialized),
    };
  });

  return {
    get title() {
      return getTitle();
    },
    slides,
    get serialized() {
      return serialized();
    },
    setTitle,
    addSlide(newSlide: SlideState) {
      setSlides((slides) => [...slides, newSlide]);
    },
    removeSlide(index: number) {
      setSlides((slides) => slides.filter((_, i) => i !== index));
    },
  };
}

export type ProjectState = ReturnType<typeof createProjectState>;
