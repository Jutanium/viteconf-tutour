import { EditorSelection, Extension } from "@codemirror/state";
import { lineNumbers } from "@codemirror/view";
import {
  Component,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
} from "solid-js";
import { getFileType } from "../../../state/projectData";
import { FileState } from "../../../state/state";

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
    language: getFileType(props.fileState.data.pathName),
    rootClass: theme.codemirror.root(props.fileState.data),
    staticExtension: [lineNumbers()],
    reactiveExtension: () => props.themeExtension,
    startingDoc: props.fileState.data.doc,
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
        if (conductor.file.currentFile == props.fileState.data.pathName) {
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
    console.log("mounted", props.fileState.data.pathName);
  });

  onCleanup(() => {
    view.destroy();
    console.log("cleaned up", props.fileState.data.pathName);
  });

  return view.dom;
};
