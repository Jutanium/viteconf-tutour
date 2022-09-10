import { Handler } from "@netlify/functions";

import { Octokit } from "@octokit/rest";

export const handler: Handler = async (event, context) => {
  // const envTest = process.env.GITHUB_AUTH;

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 500,
    };
  }

  const { owner, repo, path, provider_token } = JSON.parse(event.body);

  console.log(provider_token);

  if (typeof repo !== "string") {
    return {
      statusCode: 500,
    };
  }

  const octokit = new Octokit({
    auth: provider_token,
    // auth: process.env.JUST_PUBLIC,
  });

  const {
    data: { rate },
  } = await octokit.rateLimit.get();
  console.log(rate);

  const resp = await octokit.request("GET /user");
  console.log(resp.data.login);

  const fetchPath = async (path: string) => {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });
    const dataArray = response.data as Array<{
      url: string;
      path: string;
      sha: string;
      type: string;
    }>;

    const files = await Promise.all(
      dataArray.map(async (fileData) => {
        if (fileData.type === "dir") {
          return await fetchPath(fileData.path);
        }
        const { url, path: repoPath, sha } = fileData;
        const {
          data: { content },
        } = await octokit.rest.git.getBlob({
          owner,
          repo,
          file_sha: sha,
        });

        return { path, content };
      })
    );

    return files.flat();
  };

  const files = await fetchPath(path);

  return {
    statusCode: 200,
    body: JSON.stringify({
      files,
    }),
  };
};
