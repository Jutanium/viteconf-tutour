import { Text } from "@codemirror/state";
import { createSignal } from "solid-js";
import { createStore, Store } from "solid-js/store";
import { FileEditor } from "../components/editor/code/FileEditor";
import {
  CodeLink,
  CodeLinkWithPath,
  ContentData,
  FileData,
  FilePath,
  ProjectData,
  SlideData,
} from "./projectData";

export interface FileState {
  readonly data: Store<FileData>;
  setDoc(doc: Text): void;
  // addCodeLink(from: number, to: number): void;
  // updateCodeLink(id: string, codeLink: CodeLink): void;
  getCodeLinks(): CodeLink[];
  setCodeLink(
    id: string,
    codeLink: { name?: string } & Omit<CodeLink, "id" | "name">
  ): void;
}

function createFileState(
  doc: string,
  pathName: FilePath,
  codeLinks: CodeLink[]
): FileState {
  const [state, setState] = createStore<FileData>({
    doc,
    pathName,
    codeLinks: Object.fromEntries(
      codeLinks.map((codeLink) => [codeLink.id, codeLink])
    ),
  });

  return {
    data: state,

    setDoc(newDoc) {
      const string = newDoc.sliceString(0);
      setState("doc", string);
    },

    getCodeLinks(): CodeLink[] {
      return Object.values(state.codeLinks);
    },

    setCodeLink(id, codeLink) {
      if (state.codeLinks[id]) {
        setState("codeLinks", id, codeLink);
        return;
      }
      setState("codeLinks", id, { id, name: codeLink.name || id, ...codeLink });
    },
  };
}

const mapWithPath = (file: FileState) =>
  file
    .getCodeLinks()
    .map((codeLink) => ({ ...codeLink, pathName: file.data.pathName }));

export function createSlideState() {
  const [files, setFiles] = createStore<FileState[]>([]);
  const [content, setContent] = createStore<ContentData>({ markdown: "" });
  const [saved, setSaved] = createSignal(0);

  const addFile = (...args: Parameters<typeof createFileState>) => {
    setFiles((files) => [...files, createFileState(...args)]);
  };

  const removeFile = (pathName: string) => {
    setFiles((files) =>
      files.filter((file) => file.data.pathName !== pathName)
    );
  };

  const getCodeLinks: (pathName?: string) => CodeLinkWithPath[] = (
    pathName
  ) => {
    if (pathName) {
      const file = files.find((f) => f.data.pathName == pathName);
      if (!file) return [];
      return mapWithPath(file);
    }
    return files.flatMap(mapWithPath);
  };

  const setCodeLink = (codeLink: CodeLinkWithPath) => {
    files
      .find((f) => f.data.pathName == codeLink.pathName)
      .setCodeLink(codeLink.id, codeLink);
  };

  const serialize: () => SlideData = () => ({
    files: files.map((file) => file.data),
    content,
  });

  return {
    files,
    getCodeLinks,
    setCodeLink,
    saved,
    save() {
      setSaved(Date.now());
    },
    getMarkdown() {
      return content.markdown;
    },
    setMarkdown(markdown: Text | string) {
      if (typeof markdown === "string") {
        setContent("markdown", markdown);
        return;
      }
      setContent("markdown", markdown.sliceString(0));
    },
    addFile,
    removeFile,
    serialize,
  };
}

export function createProjectState() {}

export type SlideState = ReturnType<typeof createSlideState>;
