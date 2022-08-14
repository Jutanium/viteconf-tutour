import { Extension } from "@codemirror/state";
import { Component, createEffect, createSignal } from "solid-js";
import { SlideState } from "../state/state";

import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownPreview } from "./MarkdownPreview";

export const ContentEditor: Component<{
  themeExtension: Extension;
  slideState: SlideState;
}> = (props) => {
  const [previewMode, setPreviewMode] = createSignal(false);
  const togglePreviewMode = () => setPreviewMode((mode) => !mode);

  createEffect(() => {
    console.log(props.slideState.getCodeLinks());
  })

  const Preview = () => (
    <MarkdownPreview
      markdown={props.slideState.getMarkdown()}
    ></MarkdownPreview>
  );

  return (
    <div class="w-full h-full flex flex-col">
      <div class="dark:bg-gray-600 dark:text-white">
        <button onClick={togglePreviewMode} class="px-1">
          Preview
        </button>
      </div>
      <Show when={!previewMode()} fallback={Preview}>
        <MarkdownEditor
          themeExtension={props.themeExtension}
          startingMarkdown={props.slideState.getMarkdown()}
          updateMarkdown={props.slideState.setMarkdown}
        />
      </Show>
    </div>
  );
};
