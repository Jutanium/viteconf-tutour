import { ProjectData } from "@/state";
import { supabase } from "./supabaseClient";

const table = import.meta.env.VITE_SUPABASE_TABLE;
export const getProjectById = async (id: string) => {
  const {
    data: [created],
    error,
  } = await supabase.from(table).select("*").eq("id", id);

  if (error) {
    console.error(error);
    return { error };
  }

  if (!created) return { error: "Project not found" };

  return {
    id: created.id,
    userId: created.user_id,
    projectData: JSON.parse(created.data) as ProjectData,
  };
};

export const getProjects = async () => {
  const { data, error } = await supabase.from(table).select("*");

  if (error) {
    console.error(error);
  }

  return data;
};

export const saveProject = async (project: ProjectData, projectId?: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return false;
  }

  const stringified = JSON.stringify(project);

  const { data, error } = await supabase
    .from(table)
    .upsert({
      ...(projectId && { id: projectId }),
      data: stringified,
      user_id: user.id,
    })
    .select();

  if (error) {
    console.error(error);
    return false;
  }

  const created = data?.[0];
  return {
    id: created.id as string,
    updated_at: new Date(created.updated_at),
  };
};
