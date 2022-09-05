export async function getDegit(repo: string) {
  const requestData: RequestInit = {
    method: "POST",
    body: JSON.stringify({
      repo,
    }),
  };
  try {
    const resp = await fetch("./.netlify/functions/fetch-repo", requestData);
    const json = await resp.json();
    console.log(json);
    return json;
  } catch (err) {
    console.log(err);
  }
}
