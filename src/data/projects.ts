import { supabase } from "./supabaseClient";

export const getProjects = async () => {
  const { data, error } = await supabase.from("project").select("*");

  if (error) {
    console.error(error);
  }

  return data;
};

export const insertProject = async (project: any) => {
  const { data, error } = await supabase.from("project").upsert(project);

  if (error) {
    console.error(error);
  }

  return data;
};
