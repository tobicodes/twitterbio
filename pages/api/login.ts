import { NextApiRequest, NextApiResponse } from "next";
import Iron from "@hapi/iron";
import { serialize, parse } from "cookie";
import { cryptoRandomStringAsync } from "crypto-random-string";
import { createUser } from "../../database/users";

const { Magic } = require("@magic-sdk/admin");
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const TOKEN_NAME = "token";
let magic = new Magic(process.env.MAGIC_SECRET_KEY!);

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Missing email parameter" });
  }

  try {
    const didToken = magic.utils.parseAuthorizationHeader(
      req.headers.authorization
    );

    // if validate returns no error, can proceed and set cookies
    await magic.token.validate(didToken);

    const metadata = await magic.users.getMetadataByToken(didToken);
    const session = { ...metadata };

    // Create user and set login session in parallel
    const [userResult, loginResult] = await Promise.all([
      createUser(metadata),
      setLoginSession(res, session),
    ]);

    console.log("USER RESULT", userResult);
    console.log("LOGIN RESULT", loginResult);

    res.status(200).json({ loggedIn: true, metadata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging in" });
  }
}

// metadata looks like : //
// DATA {
//   issuer: 'did:ethr:0x40C2423930ECF78e5b5f09c9d18343B8AeCCd701',
//   publicAddress: '0x40C2423930ECF78e5b5f09c9d18343B8AeCCd701',
//   email: 'oluwatobi.ogunnaike@gmail.com',
//   oauthProvider: null,
//   phoneNumber: null,
//   wallets: []
// }

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
