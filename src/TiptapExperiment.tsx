import { Component } from "solid-js";
import StarterKit from "@tiptap/starter-kit";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import { createEditorTransaction, createTiptapEditor } from "solid-tiptap";
import { Editor } from "@tiptap/core";

const TiptapExperiment: Component<{}> = (props) => {
  const element: HTMLElement = (<div></div>) as HTMLElement;

  const initialContent = `
    <h1>header</h1>
    <p>
      inner paragraph
    </p>
  `;

  const editor: () => Editor = createTiptapEditor({
    get element() {
      return element;
    },
    get extensions() {
      return [
        StarterKit.configure({
          heading: {
            // levels: [2, 3, 4, 5, 6],
          },
        }),
        BubbleMenu.configure({
          element: bubbleMenuElement(),
        }),
      ];
    },
    editorProps: {
      attributes: {
        class: "prose",
      },
    },
    content: initialContent,
    autofocus: true,
    editable: true,
    injectCSS: false,
  });

  const isBold = createEditorTransaction(editor, (editor) =>
    editor?.isActive("bold")
  );

  function bubbleMenuElement() {
    return (
      <div>
        <button
          class={`${isBold() ? "bg-gray-200" : "bg-white"}`}
          onClick={boldText}
        >
          Bold
        </button>
      </div>
    ) as HTMLElement;
  }

  function boldText() {
    editor().chain().focus().toggleBold().run();
  }

  return <div>{element}</div>;
};

export default TiptapExperiment;
