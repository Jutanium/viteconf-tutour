import { getProjectById } from "@/fetch/projects";
import {
  createFileSystem,
  createSlideState,
  createProjectState,
} from "@/state";
import { createMemo, createResource } from "solid-js";

//Todo: load this from somewhere
//Todo: use localstorage to save data between logging in
export function DefaultProjectData() {
  const testFS = createFileSystem();
  testFS.addFile({
    doc: "beginning\n\n\n<div></div>\n",
    path: "testFile.html",
  });

  testFS.addFile({
    doc: "\n\n\nconsole.log('hi')\n",
    path: "testScript.js",
  });

  const fs2 = createFileSystem();
  fs2.addFile({
    doc: "<div>big div</div>",
    path: "another.html",
  });

  const slideOne = createSlideState({
    fs: testFS.serialized,
    md: `# Testing
more stuff
## Asdf
etc
### aasdfasdf
asdf
#### asdfasdf
asfasdf
  `,
  });

  const slideTwo = createSlideState({ fs: fs2.serialized, md: `# Slide Two` });

  const project = createProjectState({
    slides: [slideOne.serialized, slideTwo.serialized],
    title: "Test Project",
  });

  console.log(project);
  return createMemo(() => project);
}

export function LoadProjectData({ params, navigate }) {
  const [result] = createResource(() => params.id, getProjectById);
  return createMemo(() => {
    const data = result();
    if (data) {
      if (data.error) {
        navigate("/");
      }
      const { projectData, id, userId } = data;
      return createProjectState(projectData, id, userId);
    }
  });
}
