import {
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  EditorView,
} from "@codemirror/view";
export { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
} from "@codemirror/language";
import { history } from "@codemirror/commands";
import { highlightSelectionMatches } from "@codemirror/search";
import { closeBrackets, autocompletion } from "@codemirror/autocomplete";

export default [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  // EditorView.theme({
  //   ".cm-selectionBackground": {
  //     borderStyle: "solid",
  //     borderColor: "#60a5fa",
  //     borderLeftWidth: "1px",
  //     borderRightWidth: "1px",
  //   },
  //   ".cm-selectionBackground:first-of-type": {
  //     borderTopWidth: "1px",
  //   },
  //   ".cm-selectionBackground:last-of-type": {
  //     borderBottomWidth: "1px",
  //   },
  // }),
];
