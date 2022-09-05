import { Handler } from "@netlify/functions";
import degit from "degit";
import { readdir, rm, readFile } from "fs/promises";
import { resolve } from "path";

//I get my recursive functions from Stackoverflow https://stackoverflow.com/a/45130990
async function getFiles(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}

// const degitPromise = (arg: string) => {
//   return new Promise((resolve, reject) => {
//     const emitter = degit(arg, {
//       cache: true,
//       force: true,
//       verbose: true,
//     });
//     emitter.on("info", (info) => {
//       resolve(info);
//     });
//   });
// };

export const handler: Handler = async (event, context) => {
  // const envTest = process.env.GITHUB_AUTH;

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 500,
    };
  }

  const { repo } = JSON.parse(event.body);

  console.log(repo);

  if (typeof repo !== "string") {
    return {
      statusCode: 500,
    };
  }

  const temp = resolve(__dirname, "temp");
  console.log(temp);

  await degit(repo, { force: true, cache: true, verbose: true }).clone(temp);
  const filenames = await getFiles(temp);
  const files = await Promise.all(
    filenames.map(async (filename) => ({
      path: filename.split(temp)[1],
      doc: (await readFile(filename)).toString(),
    }))
  );
  // await rm(temp, { recursive: true });

  // console.log(files);

  return {
    statusCode: 200,
    body: JSON.stringify({
      files,
    }),
  };
};
