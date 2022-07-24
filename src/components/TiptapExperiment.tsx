import { Component, createSignal } from "solid-js";
import StarterKit from "@tiptap/starter-kit";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import { createEditorTransaction, createTiptapEditor } from "solid-tiptap";
import { Editor, Node, mergeAttributes } from "@tiptap/core";

const [count, setCount] = createSignal(0);

const nodeExtension = Node.create({
  name: "codeLinkBlock",
  group: "block",
  atom: true,
  parseHTML() {
    return [{ tag: "code-link" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["code-link", mergeAttributes(HTMLAttributes)];
  },
  addAttributes() {
    return {
      multiplier: {
        default: 1,
      },
    };
  },
  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      function incMultiplier() {
        if (typeof getPos === "function") {
          console.log("here");
          editor
            .chain()
            .command(({ tr }) => {
              const position = getPos();
              const currentNode = tr.doc.nodeAt(position);

              tr.setNodeMarkup(position, undefined, {
                ...currentNode?.attrs,
                multiplier: currentNode?.attrs?.multiplier + 1 || 1,
              });

              return true;
            })
            .run();
        }
      }
      return {
        dom: (
          <div class="border border-blue-500 gap-4">
            <button onClick={() => setCount((c) => c + 1)}>
              {count() * node.attrs.multiplier}
            </button>
            <button onClick={incMultiplier}>Mult</button>
          </div>
        ),
      };
    };
  },
});

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
        nodeExtension,
        StarterKit.configure({
          heading: {
            // levels: [2, 3, 4, 5, 6],
          },
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

  function boldText() {
    editor().chain().focus().toggleBold().run();
  }

  return (
    <div class="flex flex-col">
      <div class="flex w-full gap-2">
        <button
          class={`${isBold() ? "bg-gray-200" : "bg-white"}`}
          onClick={boldText}
        >
          Bold
        </button>
        <button
          onClick={() =>
            editor().commands.insertContent(
              "<code-link multiplier=2></code-link>"
            )
          }
        >
          Insert
        </button>
        <button onClick={() => console.log(editor().getHTML())}>Print</button>
      </div>
      {element}
    </div>
  );
};

export default TiptapExperiment;
