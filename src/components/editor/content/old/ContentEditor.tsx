import { Extension } from "@codemirror/state";
import { Component, createEffect, createSignal } from "solid-js";
import { SlideState } from "../../../../state";

import { MarkdownEditor } from "../MarkdownEditor";
import { MarkdownPreview } from "../MarkdownPreview";

import { useConductor } from "../../../../providers/conductor";
import CodeLinkLabel from "../CodeLinkLabel";
import { CodeLinkWithPath } from "../../../state/projectData";

const CodeLinksList: Component<{
  title: string;
  codeLinks: CodeLinkWithPath[];
}> = (props) => {
  return (
    <div>
      <div class="text-sm">{props.title}</div>
      <div class="flex shrink gap-2">
        <For each={props.codeLinks}>
          {(codeLink, i) => <CodeLinkLabel codeLink={codeLink} />}
        </For>
      </div>
    </div>
  );
};

export const ContentEditor: Component<{
  themeExtension: Extension;
  slideState: SlideState;
}> = (props) => {
  const [previewMode, setPreviewMode] = createSignal(false);
  const togglePreviewMode = () => setPreviewMode((mode) => !mode);

  const Preview = () => (
    <MarkdownPreview
      markdown={props.slideState.getMarkdown()}
    ></MarkdownPreview>
  );

  return (
    <div class="flex h-full w-full flex-col">
      <div class="flex gap-2">
        <For
          each={props.slideState.files
            .filter((f) => f.getCodeLinks().length)
            .map((f) => f.data.pathName)}
        >
          {(pathName) => (
            <CodeLinksList
              title={pathName}
              codeLinks={props.slideState.getCodeLinks(pathName)}
            />
          )}
        </For>
      </div>
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
