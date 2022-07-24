import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { Extension, Transaction, Compartment } from "@codemirror/state";
import { EditorView } from "codemirror";
import { Accessor, createEffect, on } from "solid-js";
import { FileType } from "../state/projectData";
import baseExtensions from "./baseExtensions";

const languageExtensions: { [Language in FileType]: () => Extension } = {
  js: () => javascript(),
  ts: () => javascript({ typescript: true }),
  jsx: () => javascript({ jsx: true }),
  tsx: () => javascript({ jsx: true, typescript: true }),
  css: () => css(),
  json: () => json(),
  html: () => html(),
  md: () => markdown(),
};

const createCodemirror = (options: {
  language: FileType;
  rootClass?: string;
  staticExtension?: Extension;
  reactiveExtension?: Accessor<Extension>;
  startingDoc: string;
  onUpdate?: (transaction: Transaction, view: EditorView) => void;
}) => {
  const languageExtension = languageExtensions[options.language]();
  const reactiveCompartment = new Compartment();

  const extensions = [
    baseExtensions,
    languageExtension,
    ...(options.staticExtension ? [options.staticExtension] : []),
    ...(options.reactiveExtension
      ? [reactiveCompartment.of(options.reactiveExtension())]
      : []),
    ...(options.rootClass
      ? [
          EditorView.editorAttributes.of({
            class: options.rootClass,
          }),
        ]
      : []),
  ];

  const view = new EditorView({
    extensions,
    doc: options.startingDoc,
    dispatch: (transaction) => {
      view.update([transaction]);
      if (options.onUpdate) {
        options.onUpdate(transaction, view);
      }
    },
  });

  createEffect(
    on(
      () => options.reactiveExtension(),
      (newExtension) => {
        view.dispatch({
          effects: reactiveCompartment.reconfigure(newExtension),
        });
      },
      { defer: true }
    )
  );

  return { view };
};

export default createCodemirror;
