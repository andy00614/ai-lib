import { OpenAPIHono } from "@hono/zod-openapi";
import { healthRouter } from "./health";
import { apiRouter } from "./api";
import { chatRoutes } from "./chat";
import { knowledgeRouter } from "./knowledge";
import { voiceCloneRouter } from "./voice-clone";
import { textToImageRouter } from "./text-to-image.js";
import type { Context } from "../types";

const router = new OpenAPIHono<Context>();

router.route("/", healthRouter);
router.route("/", apiRouter);
router.route("/chat", chatRoutes);
router.route("/knowledge", knowledgeRouter);
router.route("/voice-clone", voiceCloneRouter);
router.route("/text-to-image", textToImageRouter);

export { router as routers };
