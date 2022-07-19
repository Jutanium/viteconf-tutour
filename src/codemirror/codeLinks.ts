import { EditorState, StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  showTooltip,
  Tooltip,
} from "@codemirror/view";

export const newCodeLinkEffect = StateEffect.define<{
  from: number;
  to: number;
}>();

const codeLinkMark = Decoration.mark({
  class: "cm-t-link",
});

const codeLinkFirstLineMark = Decoration.mark({
  class: "cm-t-link cm-t-link-first-line pb-1 pr-full",
});

const codeLinkLastLineMark = Decoration.mark({
  class: "cm-t-link cm-t-link-last-line pt-1 -ml-1 pl-1",
});

const codeLinkBetweenLine = Decoration.line({
  class: "cm-t-link",
});

export function injectExtensions(
  view: EditorView,
  tooltipButton: (clickHandler: () => void) => HTMLElement
) {
  const codeLinkField = StateField.define<DecorationSet>({
    create() {
      return Decoration.none;
    },

    update(decorationSet, transaction) {
      decorationSet = decorationSet.map(transaction.changes);
      for (const effect of transaction.effects) {
        if (effect.is(newCodeLinkEffect)) {
          const { from, to } = effect.value;
          const startLine = transaction.newDoc.lineAt(from);
          const endLine = transaction.newDoc.lineAt(to);

          const marks = [];

          const createMarkOrLine = (mark: Decoration, from, to) =>
            from - to === 0
              ? codeLinkBetweenLine.range(from)
              : mark.range(from, to);

          // marks.push(codeLinkBetweenMark.range(startLine.from));
          if (startLine.number - endLine.number == 0) {
            marks.push(codeLinkMark.range(from, to));
          } else {
            marks.push(
              createMarkOrLine(codeLinkFirstLineMark, from, startLine.to)
            );
            if (endLine.number - startLine.number > 1) {
              for (let i = startLine.number + 1; i < endLine.number; i++) {
                marks.push(
                  codeLinkBetweenLine.range(transaction.newDoc.line(i).from)
                );
              }
            }
            if (to - endLine.from > 0) {
              marks.push(codeLinkLastLineMark.range(endLine.from, to));
            }
          }

          marks.sort((a, b) => a.from - b.from);

          decorationSet = decorationSet.update({
            add: [...marks],
          });
        }
      }
      return decorationSet;
    },
    provide: (field) => EditorView.decorations.from(field),
  });

  const cursorTooltipField = StateField.define<readonly Tooltip[]>({
    create: getCursorTooltips,

    update(tooltips, tr) {
      if (!tr.docChanged && !tr.selection) return tooltips;
      return getCursorTooltips(tr.state);
    },

    provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
  });

  function addCodeLink(from, to) {
    view.dispatch({
      effects: [
        newCodeLinkEffect.of({
          from,
          to,
        }),
      ],
    });
  }

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
            const clickHandler = () => addCodeLink(range.from, range.to);
            return { dom: tooltipButton(clickHandler) };
          },
        };
      });
  }

  view.dispatch({
    effects: StateEffect.appendConfig.of([codeLinkField, cursorTooltipField]),
  });
}
