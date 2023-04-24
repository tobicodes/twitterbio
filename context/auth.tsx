import React, { createContext, useContext, useState } from "react";
import { Magic } from "magic-sdk";
import { useRouter } from "next/router";
import { RPCError, RPCErrorCode } from "magic-sdk";

// to fix window not accessible (Reference error)
const getMagic = () => {
  let magic: any;
  if (typeof window !== "undefined") {
    magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "");
  }
  return magic;
};

const magic = getMagic();

type AuthContextType = {
  isLoggedIn: boolean;
  user: any;
  logUserIn: (email: string) => Promise<{ isLoggedIn: boolean }>;
  logUserOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  logUserIn: async (email: string) => ({ isLoggedIn: false }),
  logUserOut: () => {},
});

type Props = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [didToken, setDidToken] = useState<string | null>("");

  // const logUserOut = () => {
  //   magic.user.logout().then(() => {
  //     setUser(null);
  //     setIsLoggedIn(false);
  //     setDidToken("");
  //   });
  // };

  // call server
  const logUserIn = async (email: string) => {
    // get token client side
    const didToken = await magic.auth.loginWithMagicLink({
      email,
    });

    debugger;

    // use token to call server
    const body = { email };

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + didToken,
      },
      body: JSON.stringify(body),
    });

    // const response = await fetch("/api/login", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email }),
    // });

    if (response.ok) {
      const data = await response.json();
      setUser(data.metadata);
      setIsLoggedIn(true);
      return { isLoggedIn: true };
    }
    return { isLoggedIn: false };
  };

  const logUserOut = async () => {
    const response = await fetch("/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ didToken: user.didToken }),
    });

    if (response.ok) {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  // const logUserIn = async (email: string): Promise<{ isLoggedIn: boolean }> => {
  //   try {
  //     const didToken = await magic.auth.loginWithMagicLink({
  //       email,
  //       showUI: true,
  //     });
  //     const metadata = await magic.user.getMetadata();
  //     setUser(metadata);
  //     setIsLoggedIn(true);
  //     setDidToken(didToken);
  //     return { isLoggedIn: true };
  //   } catch (err) {
  //     if (err instanceof RPCError) {
  //       switch (err.code) {
  //         case RPCErrorCode.MagicLinkFailedVerification:
  //           console.log(err.message);
  //           break;
  //         case RPCErrorCode.MagicLinkExpired:
  //           console.log(err.message);
  //           break;
  //         case RPCErrorCode.MagicLinkRateLimited:
  //           console.log(err.message);
  //           break;
  //         case RPCErrorCode.UserAlreadyLoggedIn:
  //           console.log(err.message);
  //           break;
  //       }
  //     }
  //     setIsLoggedIn(false);
  //     return { isLoggedIn: false };
  //   }
  // };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, logUserIn, logUserOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
