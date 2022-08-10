import { Text } from "@codemirror/state";
import { createStore, Store } from "solid-js/store";
import { FileEditor } from "../components/FileEditor";
import {
  CodeLink,
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
  setCodeLink(id: string, codeLink: Omit<CodeLink, "id">): void;
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
      setState("codeLinks", id, codeLink);
    },
  };
}

export function createSlideState() {
  const [files, setFiles] = createStore<FileState[]>([]);
  const [content, setContent] = createStore<ContentData>({ markdown: "" });

  const addFile = (...args: Parameters<typeof createFileState>) => {
    setFiles((files) => [...files, createFileState(...args)]);
  };

  const removeFile = (pathName: string) => {
    setFiles((files) =>
      files.filter((file) => file.data.pathName !== pathName)
    );
  };

  const serialize: () => SlideData = () => ({
    files: files.map((file) => file.data),
    content,
  });

  return {
    files,
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
