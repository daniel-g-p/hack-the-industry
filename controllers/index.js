import puppeteer from "../utilities/puppeteer.js";

import service from "../services/index.js";

const get = (req, res) => {
  return res.render("index");
};

const post = async (req, res) => {
  const input = service.validateInput(req.body);
  if (!input) {
    console.error("Invalid input");
    return res.redirect("/");
  }
  const browser = await puppeteer();
  const page = await browser.newPage();
  return res.redirect("/");
};

export default { get, post };
