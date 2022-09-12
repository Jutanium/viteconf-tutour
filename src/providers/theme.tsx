import { FileState } from "@/state";
import {
  createContext,
  useContext,
  ParentComponent,
  createMemo,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Extension } from "@codemirror/state";
import { defaultDark } from "../codemirror/defaultDark";
import { defaultLight } from "../codemirror/defaultLight";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "codemirror";
import { usePrefersDark } from "@solid-primitives/media";

const cmDarkTheme = [
  oneDark,
  EditorView.theme({
    ".cm-t-link": {
      backgroundColor: "#57534e",
    },
  }),
];

const cmLightTheme = defaultLight;

//Made this a function so it can use a memo inside of it, might not be worth it
export const defaultTheme = () => ({
  tabbedEditorRoot: () => "w-full h-full flex flex-col",
  tablist: () => "w-full flex dark:bg-oneDark-background overflow-x-scroll",
  tablistItem: (selected: boolean, index: number) => {
    const base = `shrink-0 font-semibold border-b-1 font-sans px-1 pt-1.5 pb-1.5 text-md border-r-1 border-oneDark-selection`;
    const highlighted = selected
      ? `bg-gray-200 border-b-oneDark-chalky dark:bg-oneDark-highlightBackground`
      : `dark:bg-oneDark-background`;
    const dark = `dark:text-oneDark-ivory`;
    const alternate =
      !selected &&
      (index % 2 === 0
        ? "dark:border-oneDark-selection"
        : "dark:border-oneDark-highlightBackground");
    return `${base} ${dark} ${highlighted}`;
  },
  tablistItemClose: () => "pl-1.5 pr-1 hover:text-yellow-500 h-full",
  tablistAdd: () => "w-6 dark:text-white hover:(font-bold text-yellow-500)",
  editPath: () => "bg-transparent outline-none",
  userbar: () =>
    "w-full font-sans text-sm flex justify-end items-center gap-2 border-b-1 dark:(border-oneDark-selection  bg-oneDark-background text-oneDark-ivory)",
  userbarButton: () =>
    "font-bold my-0.5 mx-1 px-1 pt-1 pb-1.1 border-1 border-rounded dark:(border-oneDark-selection bg-oneDark-background hover:bg-oneDark-selection)",
  fileUnsupported: () =>
    "w-full p-4 dark:text-white dark:bg-oneDark-background",
  slidesRoot: () =>
    "w-full h-full dark:(bg-oneDark-background border-oneDark-selection) border-r-1 ",
  slidesBar: () =>
    "w-full h-min py-2 px-2 flex gap-2 dark:bg-oneDark-background",
  slidesBarButton: (current?: boolean) =>
    `rounded-full w-8 h-8   ${
      current
        ? "bg-oneDark-coral dark:text-white"
        : "border-1 dark:text-oneDark-ivory dark:(border-oneDark-selection bg-oneDark-background hover:bg-oneDark-selection) hover:(font-bold text-oneDark-coral)"
    }`,
  slideStartRoot: () =>
    "w-full h-full flex justify-center font-sans dark:(bg-oneDark-background text-oneDark-ivory)",
  slideStartBody: () => "h-60 flex flex-col gap-2 items-start justify-center",
  slideStartForm: () => "mx-2 space-x-2",
  slideStartInput: () =>
    "bg-oneDark-selection text-oneDark-chalky px-2 outline-oneDark-ivory outline-1",
  slideStartButton: () =>
    "px-2 border-1 border-rounded dark:(border-oneDark-selection bg-oneDark-background hover:bg-oneDark-selection text-oneDark-ivory)",
  mdContainer: (selected?: boolean) =>
    `ml-2 border-l-4 ${
      selected
        ? "border-oneDark-coral"
        : "border-oneDark-selection hover:border-gray-500"
    }`,
  codemirror: {
    root: (file: FileState | "content") => "w-full h-full outline-none",
    baseTheme: [
      EditorView.theme({
        "&": {
          fontSize: "1rem",
        },
      }),
    ],
    darkTheme: cmDarkTheme,
    lightTheme: cmLightTheme,
    themeExtension: createMemo(() => {
      const prefersDark = usePrefersDark();
      return prefersDark() ? cmDarkTheme : cmLightTheme;
    }),
  },
});

export type ThemeConfig = ReturnType<typeof defaultTheme>;

const ThemeContext = createContext<ThemeConfig>();

export const ThemeProvider: ParentComponent<{ theme?: ThemeConfig }> = (
  props
) => {
  const [state, setState] = createStore(props.theme || defaultTheme());

  // Potential for functionality to pick themes at runtime, save and load, etc

  return (
    <ThemeContext.Provider value={state}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
