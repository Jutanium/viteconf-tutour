import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { ChangeSet, Compartment, Extension } from "@codemirror/state";
import { languages } from "@codemirror/language-data";
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
  md: () =>
    markdown({
      codeLanguages: languages,
      defaultCodeLanguage: languageExtensions.tsx(),
      base: markdownLanguage,
    }),
};

interface Options {
  language: FileType;
  rootClass?: string;
  staticExtension?: Extension;
  reactiveExtension?: Accessor<Extension>;
  startingDoc: string;
  onUpdate?: (changes: ChangeSet, view: EditorView) => void;
}

const createCodemirror = (options: Options) => {
  const languageExtension = languageExtensions[options.language]();
  const reactiveCompartment = new Compartment();

  const ifOption = <T extends keyof Options>(
    optionName: T,
    extensionFromOption: (option: Options[T]) => Extension
  ): Extension[] =>
    options[optionName] ? [extensionFromOption(options[optionName])] : [];

  const extensions = [
    baseExtensions,
    languageExtension,
    ...ifOption("staticExtension", (value) => value),
    ...ifOption("reactiveExtension", (value) =>
      reactiveCompartment.of(value())
    ),
    ...ifOption("rootClass", (value) =>
      EditorView.editorAttributes.of({
        class: value,
      })
    ),
    ...ifOption("onUpdate", (value) =>
      EditorView.updateListener.of((update) => {
        if (update.changes) {
          value(update.changes, view);
        }
      })
    ),
  ];

  const view = new EditorView({
    extensions,
    doc: options.startingDoc,
    // dispatch: (transaction) => {
    //   view.update([transaction]);
    //   if (options.onUpdate) {
    //     options.onUpdate(transaction, view);
    //   }
    // },
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
