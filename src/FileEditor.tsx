import { Component, createEffect, on, onCleanup, onMount } from "solid-js";
import { createFileState, FileState } from "./state";
import baseExtensions from "./codemirror/baseExtensions";
import { EditorView } from "codemirror";
import {
  Compartment,
  EditorState,
  Extension,
  Range,
  RangeSet,
  RangeSetBuilder,
  RangeValue,
  StateEffect,
  StateField,
} from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { FileType, FileData, getFileType, CodeLink } from "./projectData";
import {
  DecorationSet,
  Decoration,
  showTooltip,
  Tooltip,
} from "@codemirror/view";

import { injectExtensions } from "./codemirror/codeLinks";

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

  const view = new EditorView({
    extensions: [
      baseExtensions,
      languageExtensions[getFileType(props.fileState.data.pathName)](),
      themeExtension.of(props.theme),
    ],
    doc: props.fileState.data.doc,
    dispatch: (transaction) => {
      view.update([transaction]);
      props.fileState.setDoc(view.state.doc);
    },
  });

  const tooltipButton = (addCodeLink: () => void) =>
    (
      <div class="dark:text-black text-white p-1">
        <button onClick={addCodeLink}>Link</button>
      </div>
    ) as HTMLElement;

  const widget = (codeLinkId: string) => {
    const clicked = () => {
      console.log(codeLinkId);
    };
    return (<button onClick={clicked}>💬</button>) as Node;
  };

  injectExtensions({ view, tooltipButton, fileState: props.fileState, widget });

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

  return <div class={rootClass(props.fileState.data)}>{view.dom}</div>;
};
