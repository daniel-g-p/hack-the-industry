import puppeteer from "puppeteer";

export default async (isHeadless) => {
  const options = { headless: isHeadless === true || false };
  const browser = await puppeteer.launch(options);
  return browser;
};
