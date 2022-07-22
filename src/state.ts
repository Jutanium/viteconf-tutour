import { createStore, Store } from "solid-js/store";
import {
  CodeLink,
  ContentNodeData,
  FileData,
  FilePath,
  ProjectData,
  SlideData,
} from "./projectData";

export interface ContentNodeState {
  readonly data: Store<ContentNodeData>;
  setData(string): void;
}

export interface SlideState {
  readonly files: Store<FileState[]>;
  addFile(file: FileData): void;
  removeFile(pathName: string): void;
  serialize(): SlideData;
}

export interface ProjectState {
  readonly slides: Store<SlideState[]>;
  addSlide(insertAfter?: number): void;
  serialize(): ProjectData;
}

export interface FileState {
  readonly data: Store<FileData>;
  setDoc(string): void;
  // addCodeLink(from: number, to: number): void;
  // updateCodeLink(id: string, codeLink: CodeLink): void;
  getCodeLinks(): CodeLink[];
  setCodeLink(id: string, codeLink: Omit<CodeLink, "id">): void;
}

export function createFileState(
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
      setState("doc", newDoc);
    },

    getCodeLinks(): CodeLink[] {
      return Object.values(state.codeLinks);
    },

    setCodeLink(id, codeLink) {
      setState("codeLinks", id, codeLink);
    },
  };
}
