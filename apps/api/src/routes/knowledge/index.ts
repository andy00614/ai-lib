import { OpenAPIHono } from "@hono/zod-openapi";
import { outlineRouter } from "./outline.js";
import { questionRouter } from "./question.js";
import type { Context } from "../../types.js";

const router = new OpenAPIHono<Context>();

// Mount knowledge sub-routes
router.route("/", outlineRouter);
router.route("/", questionRouter);

export { router as knowledgeRouter };