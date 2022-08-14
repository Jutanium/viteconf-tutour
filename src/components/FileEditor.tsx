import { Extension } from "@codemirror/state";
import { lineNumbers } from "@codemirror/view";
import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { getFileType } from "../state/projectData";
import { FileState } from "../state/state";

import { injectExtensions } from "../codemirror/codeLinks";
import createCodemirror from "../codemirror/createCodemirror";
import { useTheme } from "../state/theme";

interface Props {
  fileState: FileState;
  themeExtension: Extension;
}

export const FileEditor: Component<Props> = (props) => {
  const theme = useTheme();

  const { view } = createCodemirror({
    language: getFileType(props.fileState.data.pathName),
    rootClass: theme.codemirror.root(props.fileState.data),
    staticExtension: [lineNumbers()],
    reactiveExtension: () => props.themeExtension,
    startingDoc: props.fileState.data.doc,
    onUpdate: (changeSet, view) => props.fileState.setDoc(view.state.doc),
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

  injectExtensions({ view, tooltipButton, fileState: props.fileState, widget });

  onMount(() => {
    console.log("mounted", props.fileState.data.pathName);
  });

  onCleanup(() => {
    view.destroy();
    console.log("cleaned up", props.fileState.data.pathName);
  });

  return view.dom;
};
