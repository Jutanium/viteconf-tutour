import {
  EditorState,
  RangeSet,
  StateEffect,
  StateField,
} from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  gutter,
  GutterMarker,
  showTooltip,
  Tooltip,
  WidgetType,
} from "@codemirror/view";
import { createEffect, on } from "solid-js";
import { CodeLink } from "../state/projectData";
import { FileState } from "../state/state";

export const newCodeLinkEffect = StateEffect.define<{
  from: number;
  to: number;
  id: string;
  replace?: boolean;
}>();

interface Args {
  view: EditorView;
  tooltipButton: (clickHandler: () => void) => HTMLElement;
  widget: (codeLinkId: string) => HTMLElement;
  fileState: FileState;
}

export function injectExtensions({
  view,
  tooltipButton,
  fileState,
  widget,
}: Args) {
  class CodeLinkWidget extends WidgetType {
    id: string;

    constructor(id: string) {
      super();
      this.id = id;
    }

    toDOM(view: EditorView): HTMLElement {
      return widget(this.id);
    }

    destroy(dom) {
      console.log("destroyed");
    }
  }

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

  const codeLinkReplace = (id) =>
    Decoration.replace({
      widget: new CodeLinkWidget(id),
      id,
    });

  let markIds = [];

  const codeLinkField = StateField.define<{
    marks: DecorationSet;
    inserts: DecorationSet;
    allDecorations: DecorationSet;
  }>({
    create() {
      return {
        marks: Decoration.none,
        allDecorations: Decoration.none,
        inserts: Decoration.none,
      };
    },

    update({ marks, inserts, allDecorations }, transaction) {
      marks = marks.map(transaction.changes);
      inserts = inserts.map(transaction.changes);

      for (const effect of transaction.effects) {
        if (effect.is(newCodeLinkEffect)) {
          const { from, to, id, replace } = effect.value;

          if (replace) {
            inserts = inserts.update({
              add: [codeLinkReplace(id).range(from, to)],
            });
            continue;
          }

          if (from - to) {
            marks = marks.update({
              add: [codeLinkMark(id).range(from, to)],
            });
          }
          continue;
        }
      }

      allDecorations = Decoration.none;

      const decorations = [];

      let iter = marks.iter();

      let stillPresentIds: string[] = [];

      while (iter.value) {
        const { from, to } = iter;
        const id = iter.value.spec.id;
        stillPresentIds.push(id);
        fileState.setCodeLink(id, { from, to });

        const startLine = transaction.newDoc.lineAt(from);
        const endLine = transaction.newDoc.lineAt(to);

        const createMarkOrLine = (mark: Decoration, from, to) =>
          from - to === 0
            ? codeLinkBetweenLine(id).range(from)
            : mark.range(from, to);

        // marks.push(codeLinkBetweenMark.range(startLine.from));
        if (startLine.number - endLine.number == 0) {
          decorations.push(codeLinkMark(id).range(from, to));
        } else {
          decorations.push(
            createMarkOrLine(codeLinkFirstLineMark(id), from, startLine.to)
          );
          if (endLine.number - startLine.number > 1) {
            for (let i = startLine.number + 1; i < endLine.number; i++) {
              decorations.push(
                codeLinkBetweenLine(id).range(transaction.newDoc.line(i).from)
              );
            }
          }
          if (to - endLine.from > 0) {
            decorations.push(codeLinkLastLineMark(id).range(endLine.from, to));
          }
        }

        iter.next();
      }

      const iiter = inserts.iter();
      while (iiter.value) {
        const { from, to } = iiter;
        const id = iiter.value.spec.id;
        stillPresentIds.push(id);
        fileState.setCodeLink(id, { from });
        console.log(stillPresentIds);
        decorations.push(codeLinkReplace(id).range(from, to));
        iiter.next();
      }

      decorations.sort((a, b) => a.from - b.from);

      allDecorations = allDecorations.update({
        add: decorations,
      });

      markIds
        .filter((id) => !stillPresentIds.includes(id))
        .forEach((id) => {
          fileState.setCodeLink(id, undefined);
        });

      markIds = stillPresentIds;

      return {
        marks,
        inserts,
        allDecorations,
      };
    },
    provide: (field) =>
      EditorView.decorations.from(field, (field) => field.allDecorations),
  });

  function addCodeLink(codeLink: CodeLink) {
    const inserting =
      !Number.isInteger(codeLink.to) || codeLink.from - codeLink.to === 0;
    const effect = newCodeLinkEffect.of({
      from: codeLink.from,
      to: inserting ? codeLink.from + 1 : codeLink.to,
      id: codeLink.id,
      replace: inserting,
    });
    view.dispatch({
      ...(inserting && { changes: { from: codeLink.from, insert: " " } }),
      effects: effect,
    });
  }

  const cursorTooltipField = StateField.define<readonly Tooltip[]>({
    create: getCursorTooltips,

    update(tooltips, tr) {
      if (!tr.docChanged && !tr.selection) return tooltips;
      return getCursorTooltips(tr.state);
    },

    provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
  });

  function getCursorTooltips(state: EditorState): readonly Tooltip[] {
    return state.selection.ranges.map((range) => {
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
          const clickHandler = () => {
            addCodeLink({
              from: range.from,
              to: range.to,
              id: `${fileState.data.pathName}-${range.from}-${range.to}`,
            });
          };
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

  class CodeLinkMarker extends GutterMarker {
    codeLinkId: string;

    constructor(codeLinkId: string) {
      super();
      this.codeLinkId = codeLinkId;
    }

    toDOM() {
      return widget(this.codeLinkId);
    }
  }

  const codeLinkGutter = gutter({
    markers: (view) => {
      const ranges = view.state.field(codeLinkField).marks;
      let gutterSet: RangeSet<GutterMarker> = RangeSet.empty;
      const iter = ranges.iter();

      while (iter.value) {
        const { from, to, value } = iter;
        const line = view.state.doc.lineAt(from);
        gutterSet = gutterSet.update({
          add: [new CodeLinkMarker(value.spec.id).range(line.from)],
        });
        iter.next();
      }

      return gutterSet;
    },
  });

  view.dispatch({
    effects: [
      StateEffect.appendConfig.of([
        codeLinkField,
        cursorTooltipField,
        codeLinkTheme,
        codeLinkGutter,
      ]),
    ],
  });

  fileState.getCodeLinks().forEach(addCodeLink);
}
