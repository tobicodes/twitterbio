import { NextApiRequest, NextApiResponse } from "next";

import { serialize } from "cookie";

const { Magic } = require("@magic-sdk/admin");
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
    console.log("DATA", metadata);

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
