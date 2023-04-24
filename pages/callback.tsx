// pages/callback.js

import { useEffect } from "react";
import { useRouter } from "next/router";
import { Magic } from "magic-sdk";

const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!);

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const didToken = await magic.auth.loginWithCredential();
      const user = await magic.user;
      console.log(user, "USER");

      console.log(didToken);
      // do something with the `didToken`
      router.push("/");
    }

    handleCallback();
  }, [router]);

  return <div>Logging you in...</div>;
}
