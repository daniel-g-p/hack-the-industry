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
  // console.log(websiteProfile);

  const jobsProfile = await service.getJobsProfile(input.name);
  // console.log(jobsProfile);

  const wlwProfile = await service.getWlwProfile(input.name);
  // console.log(wlwProfile);

  const newsProfile = await service.getNewsProfile(input.name);
  // console.log(newsProfile);

  const profile = {
    keywords: websiteProfile.slice(0, 25).map((keyword) => {
      return { keyword: keyword.word, count: keyword.count };
    }),
    jobs: jobsProfile,
    address: wlwProfile.address || "",
    facts: wlwProfile.facts || [],
    news: newsProfile,
  };

  // WerLiefertWas => Supplier Marketplace
  // Instagram => Social Media
  // LinkedIn => Social Media
  // Kununu => Employer Branding
  // Google News => Recent Developments
  // Google Search => Search Engine Marketing

  return res.render("profile", { profile });
};

export default { get, post };
