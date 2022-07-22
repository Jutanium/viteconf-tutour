import { createStore, Store } from "solid-js/store";
import {
  CodeLink,
  ContentNodeData,
  FileData,
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
  addCodeLink(from: number, to: number): void;
  getCodeLinks(): CodeLink[];
}

export function createFileState(fileData: FileData): FileState {
  const [state, setState] = createStore<FileData>(fileData);

  return {
    data: state,

    setDoc(newDoc: string) {
      setState("doc", newDoc);
    },

    getCodeLinks(): CodeLink[] {
      return state.codeLinks;
    },

    addCodeLink(from, to) {
      setState("codeLinks", (links) => [
        ...links,
        { selection: { from, to }, id: `${from}-${to}` },
      ]);
    },
  };
}
