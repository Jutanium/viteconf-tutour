export const testFunction = async () => {
  const requestData: RequestInit = {
    method: "POST",
    body: JSON.stringify({
      test: "hi",
    }),
  };
  const resp = await fetch(
    "./.netlify/functions/fetch-repo?name=world",
    requestData
  );
  const json = await resp.json();
  console.log(json);
};
