import type { RepoFile } from "@/fetch/github";
import { Text } from "@codemirror/state";
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import {
  createFileState,
  FileData,
  FilePath,
  FileState,
  FileType,
  getFileType,
  isFilePath,
} from "./fileState";

export { isFilePath, getFileType };
export type { FileState, FilePath, FileData, FileType };

/* Each state factory exposes a serialized getter that returns
 * a corresponding data type. This in turn can be passed as an argument
 * to the state factory to deserialize it.
 */

// TODO: reimplement CodeLinks. They probably make more sense being stored in the SlideState, and use a Context to interact them beneath.
// export interface CodeLink {
//   from: number;
//   to?: number;
//   startLine?: number;
//   endLine?: number;
//   id: string;
//   name: string;
// }

// export interface CodeLinkWithPath extends CodeLink {
//   pathName: FilePath;
// }

export type FileSystemData = Readonly<{
  currentFileId?: string;
  files: FileData[];
}>;

export function createFileSystem(data?: FileSystemData) {
  //TODO: this will cause conflicts if you deserialize e.g. [{id: 1, id: 3, id: 4}]
  let idCounter = data?.files.length || 0;

  const fromData = (data: FileSystemData) =>
    Object.fromEntries(
      data.files.map((f) => {
        return [f.id, createFileState(f)];
      })
    );

  const [files, setFiles] = createStore<{ [id: string]: FileState }>(
    data ? fromData(data) : {}
  );

  const [currentFileId, setCurrentFileId] = createSignal<string>(
    data?.currentFileId || data?.files?.find((f) => f.opened)?.id
  );

  const serialize = (): FileSystemData => ({
    currentFileId: currentFileId(),
    files: Object.values(files).map((file) => file.serialized),
  });

  const addFile = (args: Omit<FileData, "id" | "opened">) => {
    const newFile = createFileState({
      id: (++idCounter).toString(),
      opened: isFilePath(args.path),
      ...args,
    });
    setFiles(newFile.id, newFile);
    return newFile;
  };

  const removeFile = (id: string) => {
    setFiles(id, undefined);
  };

  const renameFile = (id: string, newPathName: FilePath) => {
    files[id]?.setPathName(newPathName);
  };

  return {
    get fileList(): FileState[] {
      return Object.values(files);
    },
    get isEmpty() {
      return Object.values(files).length === 0;
    },
    serialize,
    get currentFileId() {
      return currentFileId();
    },
    setCurrentFileId,
    addFile,
    removeFile,
    renameFile,
  };
}

export type FileSystemState = ReturnType<typeof createFileSystem>;

export type SlideData = Readonly<{
  fs: FileSystemData;
  md: string;
}>;
export function createSlideState(data?: Partial<SlideData>) {
  const [getFileSystem, setFileSystem] = createSignal(
    createFileSystem(data?.fs)
  );

  const [getMarkdown, setMarkdown] = createSignal(data?.md || "");

  const [frozenData, setFrozenData] = createSignal<FileSystemData>(data?.fs);

  const serialize = (): SlideData => ({
    fs: getFileSystem().serialize(),
    md: getMarkdown(),
  });

  return {
    get fileSystem() {
      return getFileSystem();
    },
    get markdown() {
      return getMarkdown();
    },
    serialize,
    freeze() {
      setFrozenData(getFileSystem().serialize());
    },
    reset() {
      if (frozenData()) {
        setFileSystem(createFileSystem(frozenData()));
      }
    },
    setFilesFromSlide(slide: SlideData) {
      const newFS = createFileSystem(slide.fs);
      setFileSystem(newFS);
    },
    setFilesFromGitHub(repoFiles: RepoFile[]) {
      const files = repoFiles.map((f, i) => ({
        ...f,
        id: `gh${i.toString()}`,
        opened: isFilePath(f.path),
      }));
      const newFS = createFileSystem({ files });
      setFileSystem(newFS);
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

export function createProjectState(
  data: ProjectData,
  savedId?: string,
  createdBy?: string,
  mode: "preview" | "edit" = "preview"
) {
  // We don't actually use this yet
  const [title, setTitle] = createSignal(data?.title || "");

  const [slides, setSlides] = createStore<SlideState[]>(
    data.slides.map(createSlideState) || []
  );

  const [slideIndex, setSlideIndex] = createSignal(0);

  const [preview, setPreview] = createSignal(mode === "preview");

  const serialize = (): ProjectData => {
    return {
      title: title(),
      slides: slides.map((slide) => slide.serialize()),
    };
  };

  return {
    get title() {
      return title();
    },
    slides,
    get slideIndex() {
      return slideIndex();
    },
    get currentSlide() {
      return slides[slideIndex()];
    },
    get previewMode() {
      return preview();
    },
    serialize,
    savedId,
    createdBy,
    setTitle,
    addSlide(slideData: Partial<SlideData>) {
      const newSlide = createSlideState(slideData);
      setSlides((slides) => [...slides, newSlide]);
      return slides.length - 1;
    },
    removeSlide(index: number) {
      setSlides((slides) => slides.filter((_, i) => i !== index));
    },
    setSlide(index: number) {
      if (index < 0 || index >= slides.length) return;
      setSlideIndex(index);
      if (preview()) {
        slides[index].reset();
      }
    },
    setPreviewMode(isPreview: boolean) {
      if (isPreview) {
        slides.forEach((slide) => slide.freeze());
        setPreview(true);
        return;
      }
      slides.forEach((slide) => slide.reset());
      setPreview(false);
    },
  };
}

export type ProjectState = ReturnType<typeof createProjectState>;
