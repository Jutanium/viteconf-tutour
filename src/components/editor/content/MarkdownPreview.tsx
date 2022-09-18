import createCodemirror from "@/codemirror/createCodemirror";
import { useTheme } from "@/providers/theme";
import { FileType, fileTypes } from "@/state/fileState";
import remarkGfm from "remark-gfm";
import { Component } from "solid-js";
import { Portal } from "solid-js/web";
import SolidMarkdown from "solid-markdown";

export const MarkdownPreview: Component<{ markdown: string }> = (props) => {
  const theme = useTheme();
  return (
    <SolidMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          // Follows https://github.com/remarkjs/react-markdown#use-custom-components-syntax-highlight
          const match = /language-(\w+)/.exec(className || "");
          const supported =
            match?.[1] && (fileTypes as readonly string[]).includes(match[1]);
          if (!inline && supported) {
            console.log(String(children));
            const codemirror = createCodemirror({
              language: match[1] as FileType,
              startingDoc: String(children).replace(/\n$/, ""),
              staticExtension: theme.codemirror.darkTheme,
              readonly: true,
              rootClass: theme.mdPreviewCode(),
            });
            return codemirror.view.dom;
          }
          return (
            <code class={className} {...props}>
              {children}
            </code>
          );
        },
      }}
      class={theme.mdPreview()}
    >
      {props.markdown}
    </SolidMarkdown>
  );
};
