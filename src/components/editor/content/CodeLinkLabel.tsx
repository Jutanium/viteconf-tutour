import { Component } from "solid-js";
import { useConductor } from "../../../providers/conductor";
import { CodeLinkWithPath } from "../../../state/projectData";

const CodeLinkLabel: Component<{ codeLink: CodeLinkWithPath }> = (props) => {
  const [_, actions] = useConductor();

  function navigate() {
    actions.gotoCodeLink(props.codeLink);
    // actions.setFile(props.codeLink.pathName);
    // actions.setCodeLink(props.codeLink.id);
  }

  return (
    <div class="border rounded space-x-1">
      <span class="text-sm">{props.codeLink.name}</span>
      <button class="hover:underline decoration-blue-400" onClick={navigate}>
        {" "}
        ⮕
      </button>
    </div>
  );
};

export default CodeLinkLabel;
