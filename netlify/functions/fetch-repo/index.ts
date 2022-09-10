import { Handler } from "@netlify/functions";

import { Octokit } from "@octokit/rest";

export const handler: Handler = async (event, context) => {
  console.log("got to function 2");
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 500,
    };
  }

  const { owner, repo, path, provider_token } = JSON.parse(event.body);

  if (typeof repo !== "string") {
    return {
      statusCode: 500,
    };
  }

  const octokit = new Octokit({
    auth: provider_token,
  });

  const {
    data: { rate },
  } = await octokit.rateLimit.get();
  console.log(rate);

  const fetchPath = async (_path: string) => {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: _path,
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

        return { path: repoPath.replace(`${path}/`, ""), content };
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
