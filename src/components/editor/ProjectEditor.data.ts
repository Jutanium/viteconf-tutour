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
  const slideOne = createSlideState({});

  const project = createProjectState({
    slides: [slideOne.serialize()],
    title: "Test Project",
  });

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
