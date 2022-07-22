import { EditorState, StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  showTooltip,
  Tooltip,
} from "@codemirror/view";
import { createEffect, on } from "solid-js";
import { CodeLink } from "../projectData";
import { FileState } from "../state";

export const newCodeLinkEffect = StateEffect.define<CodeLink>();

const codeLinkMark = (id) =>
  Decoration.mark({
    class: "cm-t-link",
    id,
  });

const codeLinkFirstLineMark = (id) =>
  Decoration.mark({
    class: "cm-t-link cm-t-link-first-line",
    id,
  });

const codeLinkLastLineMark = (id) =>
  Decoration.mark({
    class: "cm-t-link cm-t-link-last-line",
  });

const codeLinkBetweenLine = (id) =>
  Decoration.line({
    class: "cm-t-link",
  });

export function injectExtensions(
  view: EditorView,
  tooltipButton: (clickHandler: () => void) => HTMLElement,
  fileState: FileState
) {
  let latestDoc = null;

  const codeLinkField = StateField.define<DecorationSet>({
    create() {
      return Decoration.none;
    },

    update(decorationSet, transaction) {
      decorationSet = decorationSet.map(transaction.changes);
      latestDoc = transaction.newDoc;

      for (const effect of transaction.effects) {
        if (effect.is(newCodeLinkEffect)) {
          const {
            selection: { from, to },
            id,
          } = effect.value;

          const startLine = transaction.newDoc.lineAt(from);
          const endLine = transaction.newDoc.lineAt(to);

          let marks = [];
          marks.push(codeLinkMark("test id").range(from, to));

          decorationSet = decorationSet.update({
            add: [...marks],
          });
        }
      }
      return decorationSet;
    },
    provide: (field) =>
      EditorView.decorations.from(field, (value) => {
        let allDecorations = Decoration.set([]);
        const iter = value.iter();

        while (iter.value) {
          const { from, to } = iter;
          const id = iter.value.spec.id;

          let marks = [];

          console.log("provide runs", view.state.doc, latestDoc);
          const startLine = latestDoc.lineAt(from);
          const endLine = latestDoc.lineAt(to);

          const createMarkOrLine = (mark: Decoration, from, to) =>
            from - to === 0
              ? codeLinkBetweenLine(id).range(from)
              : mark.range(from, to);

          // marks.push(codeLinkBetweenMark.range(startLine.from));
          if (startLine.number - endLine.number == 0) {
            marks.push(codeLinkMark("test id").range(from, to));
          } else {
            marks.push(
              createMarkOrLine(codeLinkFirstLineMark(id), from, startLine.to)
            );
            if (endLine.number - startLine.number > 1) {
              for (let i = startLine.number + 1; i < endLine.number; i++) {
                marks.push(
                  codeLinkBetweenLine(id).range(latestDoc.line(i).from)
                );
              }
            }
            if (to - endLine.from > 0) {
              marks.push(codeLinkLastLineMark(id).range(endLine.from, to));
            }
          }

          marks.sort((a, b) => a.from - b.from);

          allDecorations = allDecorations.update({
            add: marks,
          });

          iter.next();
        }
        return allDecorations;
      }),
  });

  const cursorTooltipField = StateField.define<readonly Tooltip[]>({
    create: getCursorTooltips,

    update(tooltips, tr) {
      if (!tr.docChanged && !tr.selection) return tooltips;
      return getCursorTooltips(tr.state);
    },

    provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
  });

  function getCursorTooltips(state: EditorState): readonly Tooltip[] {
    return state.selection.ranges
      .filter((range) => !range.empty)
      .map((range) => {
        const text = state.doc.slice(range.from, range.to);
        const nonEmptyLine = [...text.iterLines()].findIndex(
          (line) => line.length > 0
        );
        let from, to;
        if (nonEmptyLine === -1) {
          from = range.from;
          to = range.to;
        } else {
          const line = text.lineAt(nonEmptyLine + 1);
          from = range.from + line.from;
          to = range.from + line.to;
        }

        // console.log(state.field(codeLinkField));

        return {
          pos: from + Math.round((to - from) / 2),
          above: true,
          arrow: true,
          create: () => {
            const clickHandler = () =>
              fileState.addCodeLink(range.from, range.to);
            return { dom: tooltipButton(clickHandler) };
          },
        };
      });
  }

  const codeLinkTheme = EditorView.theme({
    // ".cm-t-link:last-child": {
    //   paddingRight: "100%",
    // },
    ".cm-t-link-first-line": {
      paddingRight: "100%",
      paddingBottom: "2px",
    },
    ".cm-t-link-last-line": {
      paddingLeft: "1em",
      marginLeft: "-1em",
      paddingTop: "2px",
    },
  });

  view.dispatch({
    effects: StateEffect.appendConfig.of([
      codeLinkField,
      cursorTooltipField,
      codeLinkTheme,
    ]),
  });

  createEffect(
    on(
      () => fileState.getCodeLinks(),
      (codeLinks) => {
        console.log("code link effect", codeLinks);
        codeLinks.forEach((codeLink) =>
          view.dispatch({
            effects: [newCodeLinkEffect.of(codeLink)],
          })
        );
      }
    )
  );
}
