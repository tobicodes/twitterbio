const {Sequelize, Dialect} = im
import { Sequelize, Dialect } from "sequelize";

const env =
  (process.env.NODE_ENV as "development" | "production" | "test") ||
  "development";

const config: Record<typeof env, { dialect: Dialect; storage: string }> = {
  development: {
    dialect: "sqlite",
    storage: "./db.development.sqlite",
  },
  production: {
    dialect: "sqlite",
    storage: "./db.production.sqlite",
  },
  test: {
    dialect: "sqlite",
    storage: "",
  },
};

const dbConfig = config[env];
export const db = new Sequelize(dbConfig);

console.log(db, "DBB");

db.authenticate()
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });
