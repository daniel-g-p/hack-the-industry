import validateUrl from "../utilities/validate-url.js";

const validateInput = (reqBody) => {
  const data = {
    name:
      reqBody && typeof reqBody.name === "string" ? reqBody.name.trim() : "",
    website:
      reqBody &&
      typeof reqBody.website === "string" &&
      validateUrl(reqBody.website.trim())
        ? reqBody.website.trim()
        : "",
  };
  return data.name && data.website ? data : null;
};

export default { validateInput };
