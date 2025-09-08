import { OpenAPIHono } from "@hono/zod-openapi";
import { healthRouter } from "./health";
import { apiRouter } from "./api";
import type { Context } from "../types";

const router = new OpenAPIHono<Context>();

router.route("/", healthRouter);
router.route("/", apiRouter);

export { router as routers };