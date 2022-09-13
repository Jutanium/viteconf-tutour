import { ProjectData } from "@/state/state";
import { supabase } from "./supabaseClient";

export const getProjectById = async (id: string) => {
  const {
    data: [created],
    error,
  } = await supabase.from("projects").select("*").eq("id", id);

  if (error) {
    console.error(error);
    return false;
  }
  return JSON.parse(atob(created.data)) as ProjectData;
};

export const getProjects = async () => {
  const { data, error } = await supabase.from("projects").select("*");

  if (error) {
    console.error(error);
  }

  return data;
};

// export const insertProject = async (project: any) => {
//   const { data, error } = await supabase.from("project").upsert(project);

//   if (error) {
//     console.error(error);
//   }

//   return data;
// };

export const createProject = async (
  project: ProjectData,
  projectId?: string
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return false;
  }

  //Gets around weird unicode stuff that seeps in when importing files from GitHub
  const stringified = btoa(JSON.stringify(project));

  const { data, error } = await supabase
    .from("projects")
    .upsert({
      ...(projectId && { id: projectId }),
      data: stringified,
      title: project.title,
      user_id: user.id,
    })
    .select();

  if (error) {
    console.error(error);
    return false;
  }

  const created = data?.[0];
  return created.id;
};
