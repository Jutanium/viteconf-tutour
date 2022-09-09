import { supabase } from "./supabaseClient";

export async function getDegit(degitString: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return false;

  const [owner, repo, path] = degitString.split("/");
  if (!owner || !repo) return false;

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
    console.log(json);
    return json;
  } catch (err) {
    console.log(err);
  }
}
