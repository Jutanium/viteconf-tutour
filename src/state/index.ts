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

  // const filesSaved = createMemo(() => {
  //   const mappedEntries = Object.entries(files).map(([id, file]) => [
  //     id,
  //     file.saved,
  //   ]);
  //   return Object.fromEntries(mappedEntries);
  // });

  const serialized = (): FileSystemData => ({
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
    get serialized() {
      return serialized();
    },
    get currentFileId() {
      return currentFileId();
    },
    reset() {
      setFiles(fromData(data));
      setCurrentFileId(data.currentFileId);
    },
    setCurrentFileId,
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
export function createSlideState(data?: Partial<SlideData>) {
  const [getFileSystem, setFileSystem] = createSignal(
    createFileSystem(data?.fs)
  );

  const [getMarkdown, setMarkdown] = createSignal(data?.md || "");

  // const [getSaved, setSaved] = createSignal(0);

  // const save = () => setSaved(Date.now());

  const serialized = (): SlideData => ({
    fs: getFileSystem().serialized,
    md: getMarkdown(),
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
      console.log(getFileSystem());
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
  const [frozenData, setFrozenData] = createSignal<SlideData[]>(data.slides);

  const serialized = (): ProjectData => {
    return {
      title: title(),
      slides: slides.map((slide) => slide.serialized),
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
    get serialized() {
      return serialized();
    },
    get previewMode() {
      return preview();
    },
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
    },
    setPreviewMode(isPreview: boolean) {
      if (isPreview) {
        setFrozenData(serialized().slides);
        setPreview(true);
        return;
      }
      setSlides(frozenData().map(createSlideState));
      setPreview(false);
    },
  };
}

export type ProjectState = ReturnType<typeof createProjectState>;
