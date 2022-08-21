import { Navigate } from "solid-app-router";
import { createContext, useContext, ParentComponent, batch } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import { CodeLinkWithPath, FilePath } from "../state/projectData";

interface ConductorState {
  currentFile: FilePath | "";
  currentSelection: { from: number | false; to: number | false };
  currentCodeLink: string | false;
  updated: number;
}

const defaultState: ConductorState = {
  currentFile: "",
  currentSelection: { from: false, to: false },
  currentCodeLink: false,
  updated: 0,
};

type Actions = {
  navigate: (id: FilePath, from?: number, to?: number) => void;
  gotoCodeLink(codeLink: CodeLinkWithPath);
  // setCodeLink: (id: string) => void;
  // clearCodeLink: () => void;
};

const ConductorContext =
  createContext<[state: ConductorState, actions: Actions]>();

export const ConductorProvider: ParentComponent = (props) => {
  const [state, setState] = createStore(defaultState);

  const actions: Actions = {
    navigate(id: FilePath, from?: number, to?: number) {
      batch(() => {
        setState("currentFile", id);
        setState("currentSelection", { from, to });
        setState("updated", (u) => u + 1);
      });
    },
    gotoCodeLink(codeLink: CodeLinkWithPath) {
      actions.navigate(codeLink.pathName, codeLink.from, codeLink.to);
    },
  };

  return (
    <ConductorContext.Provider value={[state, actions]}>
      {props.children}
    </ConductorContext.Provider>
  );
};

export const useConductor = () => useContext(ConductorContext);
