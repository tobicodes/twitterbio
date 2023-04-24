import { NextApiRequest, NextApiResponse } from "next";
import Iron from "@hapi/iron";
import { serialize, parse } from "cookie";
import { Magic } from "magic-sdk";

const getMagic = () => {
  let magic: any;
  if (typeof window !== "undefined") {
    magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "");
  }
  return magic;
};

// const magic1 = new Magic(process.env.MAGIC_TOKEN_SECRET!);
// const magic2 = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!);

const TOKEN_SECRET = process.env.MAGIC_TOKEN_SECRET;
const TOKEN_NAME = "token";

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Missing email parameter" });
  }

  try {
    // Authenticate the user and get their metadata

    // const magic = getMagic();
    const magic = getMagic();
    const metadata = await magic.user.getMetadata();
    const session = { ...metadata };
    // Store the metadata in a cookie and return a success response
    await setLoginSession(res, session);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging in" });
  }
}

// HELPFUL NONSENSE

async function setLoginSession(res, session) {
  const createdAt = Date.now();
  // Create a session object with a max age that we can validate later
  //   const obj = { ...session, createdAt, maxAge: MAX_AGE };
  //   const token = await Iron.seal(obj, TOKEN_SECRET, Iron.defaults);

  console.log("hi");
  //   setTokenCookie(res, token);
}

async function getLoginSession(req) {
  const token = getTokenCookie(req);

  if (!token) return;

  const session = await Iron.unseal(token, TOKEN_SECRET, Iron.defaults);
  const expiresAt = session.createdAt + session.maxAge * 1000;

  // Validate the expiration date of the session
  if (Date.now() > expiresAt) {
    throw new Error("Session expired");
  }

  return session;
}

const MAX_AGE = 60 * 60 * 8; // 8 hours

function setTokenCookie(res, token) {
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  res.setHeader("Set-Cookie", cookie);
}

function removeTokenCookie(res) {
  const cookie = serialize(TOKEN_NAME, "", {
    maxAge: -1,
    path: "/",
  });

  res.setHeader("Set-Cookie", cookie);
}

function parseCookies(req) {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies;

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie;
  return parse(cookie || "");
}

function getTokenCookie(req) {
  const cookies = parseCookies(req);
  return cookies[TOKEN_NAME];
}
