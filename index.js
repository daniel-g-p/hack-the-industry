import express from "express";

import config from "./config.js";

import router from "./routes/index.js";

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(router);

const start = () => {
  app.listen(config.port, () => {
    if (config.nodeEnv === "development") {
      console.log("Server running on http://localhost:" + config.port);
    }
  });
};

start();
