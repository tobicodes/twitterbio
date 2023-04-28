import Iron from "@hapi/iron";
import { parse, serialize } from "cookie";
const TOKEN_SECRET = process.env.TOKEN_SECRET!;
const TOKEN_NAME = "token";

function getTokenCookie(req) {
  const cookies = parseCookies(req);
  return cookies[TOKEN_NAME];
}

function parseCookies(req) {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies;

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie;
  return parse(cookie || "");
}

export async function getLoginSession(req) {
  const token = getTokenCookie(req);
  if (!token) return null;

  const session = await Iron.unseal(token, TOKEN_SECRET, Iron.defaults);
  const expiresAt = session.createdAt + session.maxAge * 1000;

  // Validate the expiration date of the session
  if (Date.now() > expiresAt) {
    throw new Error("Session expired");
  }

  return session;
}

// write a function that logs a user out
// by removing the token cookie
export async function logout(req, res) {
  removeTokenCookie(res);
}

function removeTokenCookie(res) {
  const cookie = serialize(TOKEN_NAME, "", {
    maxAge: -1,
    path: "/",
  });

  res.setHeader("Set-Cookie", cookie);
}
