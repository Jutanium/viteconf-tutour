// import { Octokit } from "octokit";
import { supabase } from "./supabaseClient";

type RepoFile = {
  path: string;
  doc: string;
};
export async function fetchRepo(
  degitString: string
): Promise<{ error: string } | { files: RepoFile[] }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "Must be logged in" };

  const [owner, repo, path] = degitString.split("/");
  if (!owner || !repo) return { error: "Invalid degit string" };

  const requestData: RequestInit = {
    method: "POST",
    body: JSON.stringify({
      provider_token: session.provider_token,
      owner,
      repo,
      path,
    }),
  };
  try {
    const resp = await fetch("/.netlify/functions/fetch-repo", requestData);
    const json = await resp.json();
    if (json.error) {
      return { error: json?.error?.message || json.error.toString() };
    }
    // const json = await import("./dummyGH.json");
    return {
      files: json.files.map(({ path, content }) => ({
        path,
        doc: atob(content),
      })),
    };
  } catch (err) {
    return {
      error: err.toString(),
    };
  }
}
