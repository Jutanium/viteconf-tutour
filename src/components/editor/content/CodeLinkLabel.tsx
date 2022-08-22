import { Component } from "solid-js";
import { useConductor } from "../../../providers/conductor";
import { CodeLinkWithPath } from "../../../state/projectData";

const CodeLinkLabel: Component<{ codeLink: CodeLinkWithPath }> = (props) => {
  const [_, { gotoCodeLink }] = useConductor();

  function navigate() {
    gotoCodeLink(props.codeLink);
  }

  return (
    <div class="border rounded space-x-1 h-6">
      <span class="text-sm">{props.codeLink.name}</span>
      <button class="hover:underline decoration-blue-400" onClick={navigate}>
        {" "}
        ⮕
      </button>
    </div>
  );
};

export default CodeLinkLabel;
