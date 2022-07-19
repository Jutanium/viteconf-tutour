import { Component, createEffect, on, onCleanup, onMount } from "solid-js";
import { FileState } from "./state";
import baseExtensions from "./codemirror/baseExtensions";
import { EditorView } from "codemirror";
import {
  Compartment,
  EditorState,
  Extension,
  Range,
  RangeSet,
  RangeSetBuilder,
  RangeValue,
  StateEffect,
  StateField,
} from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { FileType, FileData, getFileType, CodeLink } from "./projectData";
import {
  DecorationSet,
  Decoration,
  showTooltip,
  Tooltip,
} from "@codemirror/view";

const languageExtensions: { [Language in FileType]: () => Extension } = {
  js: () => javascript(),
  ts: () => javascript({ typescript: true }),
  jsx: () => javascript({ jsx: true }),
  tsx: () => javascript({ jsx: true, typescript: true }),
  css: () => css(),
  json: () => json(),
  html: () => html(),
};

interface Props {
  fileState: FileState;
  theme: Extension;
  rootClass?: (file: FileData) => string;
}

export const FileEditor: Component<Props> = (props) => {
  const rootClass = props.rootClass || (() => "w-full h-full");

  const themeExtension = new Compartment();

  const newCodeLinkEffect = StateEffect.define<{ from: number; to: number }>();

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
  // const codeLinkBetweenMark = Decoration.mark({
  //   class: "cm-t-link pr-full",
  // });

  class CodeLinkRangeValue extends RangeValue {
    decorations: DecorationSet;

    constructor(decorations: DecorationSet) {
      super();
      this.decorations = decorations;
    }
  }

  const codeLinkField = StateField.define<RangeSet<CodeLinkRangeValue>>({
    create() {
      const rangeSet: RangeSet<CodeLinkRangeValue> = RangeSet.empty;
      return rangeSet;
    },

    update(rangeSet, transaction) {
      // codeLinkSet = codeLinkSet.map(transaction.changes);
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
          console.log(marks.map((m) => m.from));

          const decorations = Decoration.set(marks);

          const range = new CodeLinkRangeValue(decorations).range(from, to);

          rangeSet = rangeSet.update({
            add: [range],
          });
        }
      }
      return rangeSet;
    },
    provide: (field) =>
      EditorView.decorations.from(field, (value) => {
        let allDecorationsSet: DecorationSet = Decoration.set([]);
        const iter = value.iter();
        while (iter.value) {
          const linkDecorationsIterator = iter.value.decorations.iter();
          const linkDecorations: Range<Decoration>[] = [];
          while (linkDecorationsIterator.value) {
            const { value, from, to } = linkDecorationsIterator;
            linkDecorations.push(value.range(from, to));
            linkDecorationsIterator.next();
          }
          allDecorationsSet = allDecorationsSet.update({
            add: linkDecorations,
          });
          iter.next();
        }
        return allDecorationsSet;
      }),
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
            const dom = (
              <div class="dark:text-black text-white p-1">
                <button onClick={() => addCodeLink(range.from, range.to)}>
                  Link
                </button>
              </div>
            ) as HTMLElement;
            return { dom };
          },
        };
      });
  }

  const view = new EditorView({
    extensions: [
      baseExtensions,
      cursorTooltipField,
      codeLinkField,
      languageExtensions[getFileType(props.fileState.data.pathName)](),
      themeExtension.of(props.theme),
    ],
    doc: props.fileState.data.doc,
    dispatch: (transaction) => {
      view.update([transaction]);
      props.fileState.setDoc(doc);
    },
  });

  const doc = view.state.doc;

  onMount(() => {
    console.log("mounted", props.fileState.data.pathName);
  });

  onCleanup(() => {
    view.destroy();
    console.log("cleaned up", props.fileState.data.pathName);
  });

  createEffect(
    on(
      () => props.theme,
      (newTheme) => {
        view.dispatch({
          effects: themeExtension.reconfigure(newTheme),
        });
      },
      { defer: true }
    )
  );

  return <div class={rootClass(props.fileState.data)}>{view.dom}</div>;
};
