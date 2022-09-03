import { FileState } from "@/state";
import { createContext, useContext, ParentComponent } from "solid-js";
import { createStore } from "solid-js/store";
import { Extension } from "@codemirror/state";
import { defaultDark } from "../codemirror/defaultDark";
import { defaultLight } from "../codemirror/defaultLight";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "codemirror";

export const defaultTheme = {
  tabbedEditorRoot: () => "w-full h-full flex flex-col",
  tablist: () => "w-full flex dark:bg-oneDark-background",
  tablistItem: (selected: boolean, index: number) => {
    const base = `border-b-1 font-semibold font-mono px-1 text-sm border-r-0 h-full`;
    const highlighted = selected
      ? `bg-gray-200 border-oneDark-chalky dark:bg-oneDark-highlightBackground`
      : `dark:bg-oneDark-background`;
    const dark = `dark:text-oneDark-ivory`;
    const alternate =
      !selected && (index % 2 === 0 ? "border-gray-400" : "border-gray-700");
    return `${base} ${dark} ${highlighted} ${alternate}`;
  },
  tablistItemClose: () => "px-1 hover:text-yellow-500 h-full",
  tablistAdd: () =>
    "w-6 text-sm dark:text-white hover:(font-bold text-yellow-500)",
  codemirror: {
    root: (file: FileState | "content") => "w-full h-full outline-none",
    darkTheme: [
      oneDark,
      EditorView.theme({
        ".cm-t-link": {
          backgroundColor: "#57534e",
        },
      }),
    ],
    lightTheme: defaultLight,
  },
};

export type ThemeConfig = typeof defaultTheme;

const ThemeContext = createContext<ThemeConfig>();

export const ThemeProvider: ParentComponent<{ theme?: ThemeConfig }> = (
  props
) => {
  const [state, setState] = createStore(props.theme || defaultTheme);

  // Potential for functionality to pick themes at runtime, save and load, etc

  return (
    <ThemeContext.Provider value={state}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
