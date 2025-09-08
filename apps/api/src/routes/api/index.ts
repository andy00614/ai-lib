import { OpenAPIHono } from "@hono/zod-openapi";
import { usersRouter } from "./users";
import type { Context } from "../../types";

const router = new OpenAPIHono<Context>();

router.route("/", usersRouter);

export { router as apiRouter };