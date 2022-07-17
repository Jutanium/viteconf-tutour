import { Component, createEffect, on, onCleanup, onMount } from "solid-js";
import { FileState } from "./state";
import baseExtensions from "./codemirror/baseExtensions";
import { EditorView } from "codemirror";
import {
  Compartment,
  EditorState,
  Extension,
  StateEffect,
  StateField,
} from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { FileType, FileData, getFileType } from "./projectData";
import {
  DecorationSet,
  Decoration,
  showTooltip,
  Tooltip,
} from "@codemirror/view";

const languageExtensions: { [Language in FileType]: () => Extension } = {
  js: () => javascript(),
  ts: () => javascript({ typescript: true }),
  jsx: () => javascript({ jsx: true }),
  tsx: () => javascript({ jsx: true, typescript: true }),
  css: () => css(),
  json: () => json(),
  html: () => html(),
};

interface Props {
  fileState: FileState;
  theme: Extension;
  rootClass?: (file: FileData) => string;
}

export const FileEditor: Component<Props> = (props) => {
  const rootClass = props.rootClass || (() => "w-full h-full");

  const themeExtension = new Compartment();

  const cursorTooltipField = StateField.define<readonly Tooltip[]>({
    create: getCursorTooltips,

    update(tooltips, tr) {
      if (!tr.docChanged && !tr.selection) return tooltips;
      return getCursorTooltips(tr.state);
    },

    provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
  });

  function getCursorTooltips(state: EditorState): readonly Tooltip[] {
    return state.selection.ranges
      .filter((range) => range.empty)
      .map((range) => {
        let line = state.doc.lineAt(range.head);
        let text = line.number + ":" + (range.head - line.from);
        return {
          pos: range.head,
          above: true,
          strictSide: true,
          arrow: true,
          create: () => {
            let dom = document.createElement("div");
            dom.className = "dark:text-black text-white p-1";
            dom.textContent = text;
            return { dom };
          },
        };
      });
  }

  const view = new EditorView({
    extensions: [
      baseExtensions,
      cursorTooltipField,
      languageExtensions[getFileType(props.fileState.data.pathName)](),
      themeExtension.of(props.theme),
    ],
    doc: props.fileState.data.doc,
    dispatch: (transaction) => {
      view.update([transaction]);
      props.fileState.setDoc(view.state.doc);
    },
  });

  onMount(() => {
    console.log("mounted", props.fileState.data.pathName);
  });

  onCleanup(() => {
    view.destroy();
    console.log("cleaned up", props.fileState.data.pathName);
  });

  createEffect(
    on(
      () => props.theme,
      (newTheme) => {
        view.dispatch({
          effects: themeExtension.reconfigure(newTheme),
        });
      },
      { defer: true }
    )
  );

  function testButtonClicked() {
    // underlineSelection(view);
  }

  return (
    <div class={rootClass(props.fileState.data)}>
      <button onClick={testButtonClicked}>Test button</button>
      {view.dom}
    </div>
  );
};
