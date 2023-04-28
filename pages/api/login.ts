import { NextApiRequest, NextApiResponse } from "next";
import Iron from "@hapi/iron";
import { serialize, parse } from "cookie";
import { createUser, deleteUser } from "../../database/db";

const { Magic } = require("@magic-sdk/admin");
const TOKEN_SECRET = process.env.TOKEN_SECRET!;
const TOKEN_NAME = "token";
const magic = new Magic(process.env.MAGIC_SECRET_KEY!);

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  const { email, firstName } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Missing email parameter" });
  } else if (!firstName) {
    return res.status(400).json({ error: "Missing firstName parameter" });
  }

  try {
    const didToken = magic.utils.parseAuthorizationHeader(
      req.headers.authorization
    );

    // if validate returns no error, can proceed and set cookies
    await magic.token.validate(didToken);

    const metadata = await magic.users.getMetadataByToken(didToken);

    const user = { ...metadata, firstName, createdAt: new Date() };
    const session = user;
    // const session = { ...metadata };
    // const { publicAddress, issuer, email } = metadata;

    // Create user and set login session in parallel

    const p = await deleteUser("oluwatobi.ogunnaike@gmail.com");
    console.log("P", p);

    const [userResult, loginResult] = await Promise.all([
      createUser(user),
      setLoginSession(res, session),
    ]);

    console.log("USER RESULT", userResult);
    console.log("LOGIN RESULT", loginResult);

    res.status(200).json({ loggedIn: true, metadata });
  } catch (error) {
    // TODO log error to server
    // TODO catch error and send to client
    // TODO find out typical errors and handle them accordingly
    console.error(error);
    res.status(500).json({ error: "Error logging in" });
  }
}

async function setLoginSession(res, session) {
  const createdAt = Date.now();
  //   Create a session object with a max age that we can validate later
  const obj = { ...session, createdAt, maxAge: MAX_AGE };
  const token = await Iron.seal(obj, TOKEN_SECRET, Iron.defaults);

  console.log("hi");
  setTokenCookie(res, token);
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
