import puppeteer from "../utilities/puppeteer.js";
import validateUrl from "../utilities/validate-url.js";
import wordnet from "../utilities/wordnet.js";

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

const getWebsiteProfile = async (website) => {
  const browser = await puppeteer();
  const page = await browser.newPage();
  await page.goto(website);

  const container = await page
    .$("main")
    .then((res) => (res ? res : page.$("body")))
    .catch(() => null);
  const elements = container ? await container.$$("h1, h2, h3, p") : [];

  const paragraphs = [];
  for (const element of elements) {
    const elementText = await element
      .evaluate((el) => el.textContent)
      .then((res) => {
        return res && typeof res === "string"
          ? res
              .split("")
              .reduce((text, character) => {
                const asciiCode = character.charCodeAt(0);
                text += asciiCode >= 33 && asciiCode <= 126 ? character : " ";
                return text;
              })
              .split(" ")
              .map((word) => word.trim())
              .filter((word) => word)
              .join(" ")
          : "";
      });
    if (elementText) {
      paragraphs.push(elementText);
    }
  }

  const allWords = paragraphs
    .map((paragraph) => {
      return paragraph.split(" ").map((word) => {
        return word
          .split("")
          .filter((character) => {
            const asciiCode = character.charCodeAt(0);
            return (asciiCode >= 65 && asciiCode <= 90) ||
              (asciiCode >= 97 && asciiCode <= 122)
              ? true
              : false;
          })
          .join("");
      });
    })
    .flat();
  const uniqueWords = allWords.reduce((result, word) => {
    if (!result.includes(word)) {
      result.push(word);
    }
    return result;
  }, []);
  const sortedWords = uniqueWords
    .map((word) => {
      return { word, count: allWords.filter((item) => item === word).length };
    })
    .sort((a, b) => b.count - a.count);

  const wordnetData = [];
  for (const word of uniqueWords) {
    const wordnetResult = await wordnet(word).catch(() => null);
    if (wordnetResult) {
      const item = { word, data: wordnetResult };
      wordnetData.push(item);
    }
  }

  console.log();

  const keywords = sortedWords
    .filter((keyword) => {
      return keyword.word.length > 3 &&
        keyword.count > 1 &&
        wordnetData.some((item) => item.word === keyword.word)
        ? true
        : false;
    })
    .map((keyword) => {
      return {
        word: keyword.word,
        count: keyword.count,
        data: wordnetData.find((item) => item.word === keyword.word),
      };
    });

  console.log(keywords.map((keyword) => keyword.word));
  // console.log(keywords.map((keyword) => keyword.data.data[0]));
};

export default { validateInput, getWebsiteProfile };
