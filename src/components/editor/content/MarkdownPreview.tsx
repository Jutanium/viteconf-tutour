import { Component } from "solid-js";
import { Portal } from "solid-js/web";
import SolidMarkdown from "solid-markdown";

export const MarkdownPreview: Component<{ markdown: string }> = (props) => {
  return (
    <SolidMarkdown class="markdown h-full text-sm font-sans px-3 py-2 dark:(bg-oneDark-background text-white)">
      {props.markdown}
    </SolidMarkdown>
  );
};
