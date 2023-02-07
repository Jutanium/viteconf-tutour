// import { Octokit } from "octokit";
import { supabase } from "./supabaseClient";

export type RepoFile = {
  path: string;
  doc: string;
};
export async function fetchRepo(
  degitString: string
): Promise<{ files: RepoFile[] }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Must be logged in");

  const split = degitString.split("/");
  const owner = split[0];
  const repo = split[1];
  const path = split.slice(2).join("/");

  if (!owner || !repo) throw new Error("Invalid degit string");

  const requestData: RequestInit = {
    method: "POST",
    body: JSON.stringify({
      provider_token: session.provider_token,
      owner,
      repo,
      path,
    }),
  };
  const resp = await fetch("/.netlify/functions/fetch-repo", requestData);
  const json = await resp.json();
  if (json.error) {
    throw new Error(json?.error?.message || json.error);
  }
  // const json = await import("./dummyGH.json");
  return {
    files: json.files.map(({ path, content }) => ({
      path,
      doc: atob(content).replaceAll("\\u0000", ""),
    })),
  };
}
