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

  const websiteProfile = await service.getWebsiteProfile(input.website);

  // Website => Positioning
  // WerLiefertWas => Supplier Marketplace
  // Instagram => Social Media
  // LinkedIn => Social Media
  // Kununu => Employer Branding
  // Google Jobs => Jobs
  // Google News => Recent Developments
  // Google Search => Search Engine Marketing

  return res.redirect("/");
};

export default { get, post };
