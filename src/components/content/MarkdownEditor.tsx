import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Extension, Text } from "@codemirror/state";
import { tags } from "@lezer/highlight";
import { Component } from "solid-js";
import createCodemirror from "../../codemirror/createCodemirror";
import { useTheme } from "../../providers/theme";

const markdownHighlighting = HighlightStyle.define([
  {
    tag: tags.heading1,
    fontSize: "1.6em",
    fontWeight: "bold",
  },
  {
    tag: tags.heading2,
    fontSize: "1.4em",
    fontWeight: "bold",
  },
  { tag: tags.heading3, fontSize: "1.2em", fontWeight: "bold" },
]);

export const MarkdownEditor: Component<{
  themeExtension: Extension;
  startingMarkdown: string;
  updateMarkdown: (markdown: Text) => void;
}> = (props) => {
  const theme = useTheme();

  const { view } = createCodemirror({
    language: "md",
    rootClass: theme.codemirror.root("content"),
    staticExtension: [syntaxHighlighting(markdownHighlighting)],
    reactiveExtension: () => props.themeExtension,
    startingDoc: props.startingMarkdown,
    onUpdate: (transaction, view) => props.updateMarkdown(view.state.doc),
  });

  return view.dom;
};
