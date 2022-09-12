import { Component } from "solid-js";
import { Portal } from "solid-js/web";
import SolidMarkdown from "solid-markdown";

export const MarkdownPreview: Component<{ markdown: string }> = (props) => {
  return (
    <SolidMarkdown class="markdown markdown-neutral dark:markdown-invert max-w-full h-full w-full min-h-8 text-sm font-sans px-3 py-2 dark:(bg-oneDark-background)">
      {props.markdown}
    </SolidMarkdown>
  );
};
