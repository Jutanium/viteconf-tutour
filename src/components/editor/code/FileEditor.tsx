import { EditorSelection, Extension } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import {
  Component,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
} from "solid-js";
import { FileState, getFileType } from "@/state";

import { injectExtensions } from "../../../codemirror/codeLinks";
import createCodemirror from "../../../codemirror/createCodemirror";
import { useTheme } from "../../../providers/theme";
import { useConductor } from "../../../providers/conductor";

interface Props {
  fileState: FileState;
  themeExtension: Extension;
}

export const FileEditor: Component<Props> = (props) => {
  const theme = useTheme();
  const [conductor] = useConductor();

  const { view } = createCodemirror({
    language: getFileType(props.fileState.pathName),
    rootClass: theme?.codemirror.root(props.fileState),
    staticExtension: [lineNumbers(), theme.codemirror.baseTheme],
    reactiveExtension: () => props.themeExtension,
    startingDoc: props.fileState.doc,
    onUpdate: (updates, view) => {
      // console.log("updating", updates);
      props.fileState.setDoc(view.state.doc);
    },
  });

  // createEffect(() => {
  //   console.log(props.fileState.data.doc);
  // });

  const tooltipButton = (addCodeLink: () => void) =>
    (
      <div class="p-1 text-white ">
        <button onClick={addCodeLink}>Link</button>
      </div>
    ) as HTMLElement;

  const widget = (codeLinkId: string) => {
    const clicked = () => {
      console.log(codeLinkId);
    };
    return (<button onClick={clicked}>💬</button>) as HTMLElement;
  };

  // injectExtensions({ view, tooltipButton, fileState: props.fileState, widget });

  createEffect(
    on(
      () => conductor.file.updated,
      () => {
        if (conductor.file.currentFileId == props.fileState.pathName) {
          const { from, to } = conductor.file.currentSelection;
          if (typeof from === "number") {
            const selection =
              typeof to === "number"
                ? EditorSelection.range(from, to)
                : EditorSelection.cursor(from);
            view.dispatch({
              selection,
            });
          }
        }
      }
    )
  );

  onMount(() => {
    console.log("mounted", props.fileState.pathName);
  });

  onCleanup(() => {
    view.destroy();
    console.log("cleaned up", props.fileState.pathName);
  });

  return view.dom;
};
