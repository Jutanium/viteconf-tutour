import { createStore, Store } from "solid-js/store";
import { FileData } from "./projectData";

export interface FileState {
  readonly file: Store<FileData>;
  setDoc(string): void;
}

export function createFileState(fileData: FileData): FileState {
  const [state, setState] = createStore<FileData>(fileData);

  return {
    file: state,
    setDoc(newDoc: string) {
      setState("doc", newDoc);
    },
  };
}
