import { ENV } from "./src/config/env";
import { db } from "./src/database/db";

export default {
  schema: "./src/database/schema.js",
  out: "./src/database/migrations",
  dialect: "postgresql",
  dbCredentials: { url: ENV.DATABASE_URL },
};
