import { Component } from "solid-js";
import { Portal } from "solid-js/web";
import { micromark } from "micromark";

export const MarkdownPreview: Component<{ markdown: string }> = (props) => {

  const result = micromark(props.markdown);

  return (
    <div
      class="markdown dark:bg-editorblack dark:text-white"
      innerHTML={result}
    ></div>
  );
};
