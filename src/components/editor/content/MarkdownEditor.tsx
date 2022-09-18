import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Extension, Text } from "@codemirror/state";
import { tags } from "@lezer/highlight";
import { EditorView } from "codemirror";
import { Component, onMount } from "solid-js";
import createCodemirror from "../../../codemirror/createCodemirror";
import { useTheme, useThemeExtension } from "../../../providers/theme";

const markdownHighlighting = HighlightStyle.define([
  {
    tag: tags.heading1,
    fontSize: "1.75rem",
    fontWeight: "bold",
    fontFamily: "Open Sans, sans-serif",
  },
  {
    tag: tags.heading2,
    fontSize: "1.4rem",
    fontWeight: "bold",
    fontFamily: "Open Sans, sans-serif",
  },
  {
    tag: tags.heading3,
    fontSize: "1.2rem",
    fontWeight: "bold",
    fontFamily: "Open Sans, sans-serif",
  },
  {
    tag: tags.content,
    fontSize: "0.875rem",
    fontFamily: "Open Sans, sans-serif",
  },
]);

export const MarkdownEditor: Component<{
  startingMarkdown: string;
  updateMarkdown: (markdown: Text) => void;
}> = (props) => {
  const theme = useTheme();

  const { view } = createCodemirror({
    language: "md",
    rootClass: theme.codemirror.root("content"),
    staticExtension: [syntaxHighlighting(markdownHighlighting)],
    reactiveExtension: useThemeExtension(),
    startingDoc: props.startingMarkdown,
    onUpdate: (transaction, view) => props.updateMarkdown(view.state.doc),
  });

  onMount(() => {
    view.focus();
  });

  return view.dom;
};
