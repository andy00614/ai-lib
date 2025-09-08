import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { protectedMiddleware } from "../../middleware";
import type { Context } from "../../types";

const router = new OpenAPIHono<Context>();

const GetUserParamsSchema = z.object({
  id: z.string().openapi({ example: "123" })
});

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string()
});

const getUserRoute = createRoute({
  method: "get",
  path: "/users/{id}",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    params: GetUserParamsSchema
  },
  responses: {
    200: {
      description: "User found",
      content: {
        "application/json": {
          schema: UserSchema
        }
      }
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string()
          })
        }
      }
    }
  }
});

router.openapi(
  getUserRoute,
  ...protectedMiddleware,
  async (c) => {
    const { id } = c.req.valid("param");

    return c.json({
      id,
      email: "user@example.com",
      name: "John Doe"
    });
  }
);

export { router as usersRouter };