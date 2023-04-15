import { config } from "dotenv";

config();

export default {
  nodeEnv: process.env.NODE_ENV || "production",
  port: process.env.PORT || 3000,
};
