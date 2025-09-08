import { OpenAPIHono } from "@hono/zod-openapi";
import { healthRouter } from "./health";
import { apiRouter } from "./api";
import { chatRoutes } from "./chat";
import type { Context } from "../types";

const router = new OpenAPIHono<Context>();

router.route("/", healthRouter);
router.route("/", apiRouter);
router.route("/chat", chatRoutes);

export { router as routers };