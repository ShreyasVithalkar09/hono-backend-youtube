import { Hono } from "hono";
import connectDB from "./db/connect";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { HTTPException } from "hono/http-exception";
import videoAppRouter from "./routes/video";

const app = new Hono().basePath("/api");

// middlewares
app.use(logger());
app.use(poweredBy());

connectDB()
  .then(() => {
    app.route("/videos", videoAppRouter);
  })
  .catch((err) => {
    app.get("/*", (c) => {
      throw new HTTPException(500, {
        message: `MONGODB CONNECTION FAILED:: ${err.message}`,
      });
    });
  });

app.onError((err, c) => {
  throw new HTTPException(500, { message: `APP ERROR:: ${err.message}` });
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default {
  port: process.env.PORT || 4001,
  fetch: app.fetch,
};
