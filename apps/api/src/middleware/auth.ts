import type { Context, Next } from "hono";
import { jwtVerify } from "jose";
import { createSecretKey } from "crypto";

export async function authMiddleware(c: Context, next: Next) {
  try {
    const authorization = c.req.header("Authorization");

    if (!authorization) {
      return c.json({ error: "Missing authorization header" }, 401);
    }

    const token = authorization.replace("Bearer ", "");

    if (token.startsWith("sk-")) {
      const isValid = await validateApiKey(token);
      if (!isValid) {
        return c.json({ error: "Invalid API key" }, 401);
      }
      c.set("userId", "api-user");
    } else {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
      const { payload } = await jwtVerify(token, secret);
      c.set("userId", payload.sub as string);
      c.set("session", { 
        user: { 
          id: payload.sub as string, 
          email: payload.email as string 
        } 
      });
    }

    await next();
  } catch (error) {
    return c.json({ error: "Unauthorized" }, 401);
  }
}

async function validateApiKey(apiKey: string): Promise<boolean> {
  return apiKey === process.env.API_KEY;
}