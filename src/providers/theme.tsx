import { FileState } from "@/state";
import {
  createContext,
  useContext,
  ParentComponent,
  createMemo,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Extension } from "@codemirror/state";
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

const baseButton =
  "px-2 py-1 border-1 border-rounded transition dark:(border-oneDark-selection bg-oneDark-background hover:bg-oneDark-selection text-oneDark-ivory)";

export const defaultTheme = {
  fileEditorRoot: () => "w-full h-full overflow-y-scroll max-h-95vh",
  fileUnsupported: () =>
    "w-full p-4 dark:text-white dark:bg-oneDark-background",
  tabbedEditorRoot: () => "w-full h-full flex-shrink flex flex-col",
  tablist: () =>
    "w-full pb-1 flex items-center dark:bg-oneDark-background overflow-x-scroll",
  tablistItem: (selected: boolean, index: number) => {
    const base = `shrink-0 mt-1.5 font-semibold border-b-1 font-sans px-2 py-1 text-sm border-oneDark-selection transition`;
    const highlighted = selected
      ? ` border-b-oneDark-chalky dark:bg-oneDark-highlightBackground`
      : `dark:(bg-oneDark-background hover:bg-oneDark-highlightBackground)`;
    const dark = `dark:text-oneDark-ivory`;
    return `${base} ${dark} ${highlighted}`;
  },
  tablistFolder: (selected: boolean) =>
    `mt-1.5 p-1 border-oneDark-selection ${
      selected ? "border-b-1 mr-50" : "border-b-0"
    } text-oneDark-ivory text-xl rounded-t-md hover:bg-oneDark-selection transition`,
  tablistItemClose: () => "pl-1.5 hover:text-yellow-500 h-full",
  tablistAdd: () =>
    "w-6 mt-1 dark:text-white hover:(font-bold text-yellow-500)",
  editPath: () => "text-sm bg-transparent outline-none h-0",
  treeViewRoot: () =>
    "mt-1 px-1 w-60 text-oneDark-ivory font-sans text-sm border-oneDark-selection border-r-1",
  treeViewIndent: () => "px-4",
  treeViewRow: () => "flex w-full gap-1 items-center group",
  treeViewFilename: (current, opened, supported) => {
    let classes = "border-l-1 pl-1 transition ";
    if (opened) {
      classes += `font-semibold hover:bg-oneDark-highlightBackground ${
        current ? "border-oneDark-chalky " : "border-oneDark-selection "
      }`;
    } else classes += "border-transparent ";
    if (!supported) {
      classes += "line-through ";
    }
    return classes;
  },
  treeViewDelete: () => "i-mdi-delete ml-a hidden group-hover:display-block",
  userbar: () =>
    "w-full font-sans text-sm flex justify-end items-center gap-1 border-b-1 dark:(border-oneDark-selection  bg-oneDark-background text-oneDark-ivory)",
  userbarButton: () => baseButton + "font-bold my-0.5 mx-1",
  userbarPreviewForm: () =>
    "flex justify-center items-center gap-1 mr-2 font-bold",
  userbarPreviewToggle: () =>
    "w-4 h-4 text-oneDark-coral focus:ring-0 rounded-md",
  slidesRoot: () =>
    "w-full h-full dark:(bg-oneDark-background border-oneDark-selection)",
  slidesBar: () =>
    "w-full h-min py-2 px-2 flex gap-2 dark:bg-oneDark-background",
  slidesBarButton: (current?: boolean) =>
    `rounded-full w-8 h-8   ${
      current
        ? "bg-oneDark-coral dark:text-white"
        : "border-1 dark:text-oneDark-ivory dark:(border-oneDark-selection bg-oneDark-background hover:bg-oneDark-selection) hover:(font-bold text-oneDark-coral)"
    }`,
  slidesBarButtonAdd: () => "ml-a " + defaultTheme.slidesBarButton(),
  slideStartRoot: () =>
    "w-full h-full flex justify-center font-sans dark:(bg-oneDark-background text-oneDark-ivory)",
  slideStartBody: () => "h-90 flex flex-col gap-2 items-start justify-center",
  slideStartForm: () => "mx-2 space-x-2",
  slideStartInput: () =>
    "bg-oneDark-selection h-8 text-oneDark-chalky px-2 outline-oneDark-ivory outline-1",
  slideStartButton: () => baseButton,
  mdContainer: (selected?: boolean) =>
    `ml-2 border-l-4 ${
      selected
        ? "border-oneDark-coral"
        : "border-oneDark-selection hover:border-gray-500"
    }`,
  mdPreview: () =>
    "markdown text-oneDark-ivory markdown-invert max-w-full h-full w-full min-h-8 font-sans px-3 dark:(bg-oneDark-background)",
  mdPreviewCode: () => "border-l-2 pl-1 border-oneDark-selection",
  codemirror: {
    root: (file: FileState | "content") => "w-full h-full outline-none",
    baseTheme: [
      EditorView.theme({
        "&": {
          fontSize: "0.9rem",
        },
      }),
    ],
    darkTheme: cmDarkTheme,
    lightTheme: cmLightTheme,
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

export const useThemeExtension = () => {
  const theme = useTheme();

  return createMemo(() => {
    //TODO: properly implement light mode by matching tailwind styles to codemirror styles
    // const prefersDark = usePrefersDark();
    // return prefersDark()
    //   ? theme.codemirror.darkTheme
    //   : theme.codemirror.lightTheme;
    return theme.codemirror.darkTheme;
  });
};
