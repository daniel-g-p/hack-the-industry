import puppeteer from "../utilities/puppeteer.js";
import validateUrl from "../utilities/validate-url.js";
import wait from "../utilities/wait.js";
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
  const browser = await puppeteer(false);
  const page = await browser.newPage();
  await page.goto(website);

  const container = await page
    .$("main")
    .then((res) => (res ? res : page.$("body")))
    .catch(() => null);
  const elements = container
    ? await container.$$("h1, h2, h3, h4, div, p, span, strong, button, a")
    : [];

  const paragraphs = [];
  for (const element of elements) {
    const elementText = await element
      .evaluate((el) => el.innerText)
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

  const keywords = sortedWords
    .filter((keyword) => {
      return keyword.word.length > 4 &&
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

  await browser.close();

  return keywords;
};

const getJobsProfile = async (name) => {
  const browser = await puppeteer(false);
  const page = await browser.newPage();
  const url = encodeURI("https://www.google.com/search?ibp=htl;jobs&q=" + name);
  await page.goto(url);

  const button = await page.$(
    ".VfPpkd-LgbsSe.VfPpkd-LgbsSe-OWXEXe-k8QpJ.VfPpkd-LgbsSe-OWXEXe-dgl2Hf.nCP5yc.AjY5Oe.DuMIQc.LQeN7.Nc7WLe"
  );
  await button.evaluate((el) => el.click());

  await wait(3000);
  const elements = await page.$$(".iFjolb.gws-plugins-horizon-jobs__li-ed");

  const jobPostings = [];

  for (const element of elements) {
    const role = await element
      .$(".BjJfJf.PUpOsf")
      .then((res) => (res ? res.evaluate((el) => el.textContent) : null))
      .then((res) => (typeof res === "string" ? res.trim() : ""))
      .catch(() => "");
    const company = await element
      .$(".oNwCmf .vNEEBe")
      .then((res) => (res ? res.evaluate((el) => el.textContent) : null))
      .then((res) => (typeof res === "string" ? res.trim() : ""))
      .catch(() => "");
    const location = await element
      .$(".oNwCmf .Qk80Jf:nth-of-type(2)")
      .then((res) => (res ? res.evaluate((el) => el.textContent) : null))
      .then((res) => (typeof res === "string" ? res.trim() : ""))
      .catch(() => "");
    const source = await element
      .$(".oNwCmf .Qk80Jf:nth-of-type(3)")
      .then((res) => (res ? res.evaluate((el) => el.textContent) : null))
      .then((res) => (typeof res === "string" ? res.trim() : ""))
      .catch(() => "");
    const jobPosting = { role, company, location, source };
    if (company.toLowerCase().includes(name.toLowerCase())) {
      jobPostings.push(jobPosting);
    }
  }

  await browser.close();

  return jobPostings;
};

const getWlwProfile = async (name) => {
  const browser = await puppeteer(false);
  const page = await browser.newPage();
  const url = encodeURI("https://www.wlw.de/de/suche?q=" + name);
  await page.goto(url);

  const elements = await page.$$("a.company-title-link");

  const companies = [];
  for (const element of elements) {
    const elementName = await element
      .evaluate((el) => el.textContent)
      .then((res) => (typeof res === "string" ? res.trim() : ""))
      .catch(() => "");
    const elementLink = await element
      .evaluate((el) => el.getAttribute("href"))
      .then((res) => {
        return typeof res === "string" ? "https://www.wlw.de" + res.trim() : "";
      })
      .catch(() => "");
    const item = { name: elementName, link: elementLink };
    companies.push(item);
  }

  const company = companies.find((company) => {
    return company.name.toLowerCase().includes(name.toLowerCase());
  });

  if (company) {
    await page.goto(company.link);
    await wait(3000);

    const address = await page
      .$("div.business-card__address")
      .then((res) => (res ? res.evaluate((el) => el.textContent) : ""))
      .then((res) => (res && typeof res === "string" ? res.trim() : ""))
      .catch(() => "");

    const factsElements = await page.$$("#facts-and-figures .flex.gap-1");
    const facts = [];
    for (const factsElement of factsElements) {
      const fact = await factsElement
        .evaluate((el) => el.textContent)
        .then((res) =>
          res && typeof res === "string"
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
            : ""
        );
      if (fact) {
        facts.push(fact);
      }
    }

    await browser.close();
    return { address, facts };
  } else {
    await browser.close();
    return { address: "", facts: [] };
  }
};

const getNewsProfile = async (name) => {
  const browser = await puppeteer(false);
  const page = await browser.newPage();
  const url = encodeURI("https://www.google.com/search?tbm=nws&q=" + name);
  await page.goto(url);

  const button = await page.$(
    "button.VfPpkd-LgbsSe.VfPpkd-LgbsSe-OWXEXe-k8QpJ.VfPpkd-LgbsSe-OWXEXe-dgl2Hf.nCP5yc.AjY5Oe.DuMIQc.LQeN7.Nc7WLe"
  );
  await button.evaluate((el) => el.click());

  await wait(3000);

  const newsElements = await page.$$("div.vJOb1e.aIfcHf.qlOiDc");

  const news = [];

  for (const newsElement of newsElements) {
    const author = await newsElement
      .$("div.CEMjEf.NUnG9d")
      .then((res) => (res ? res.evaluate((el) => el.textContent) : ""))
      .then((res) => (typeof res === "string" ? res.trim() : ""))
      .catch(() => "");
    const title = await newsElement
      .$("div.mCBkyc.ynAwRc.MBeuO.nDgy9d")
      .then((res) => (res ? res.evaluate((el) => el.textContent) : ""))
      .then((res) => (typeof res === "string" ? res.trim() : ""))
      .catch(() => "");
    const date = await newsElement
      .$("div.OSrXXb.ZE0LJd.YsWzw")
      .then((res) => (res ? res.evaluate((el) => el.textContent) : ""))
      .then((res) => (typeof res === "string" ? res.trim() : ""))
      .catch(() => "");
    const newsItem = { author, title, date };
    news.push(newsItem);
  }

  await browser.close();

  return news;
};

export default {
  validateInput,
  getWebsiteProfile,
  getJobsProfile,
  getWlwProfile,
  getNewsProfile,
};
