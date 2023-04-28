import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/auth";

const Login: NextPage = () => {
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>(""); // TODO: add this to the form and the fetch request in handleSubmit [line 54
  const router = useRouter();
  const { logUserIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { isLoggedIn } = await logUserIn(email, firstName);

    // Redirect to the user page after successful login
    if (isLoggedIn) {
      router.push("/userpage");
    }
  };

  // TODO add some email validation to input box

  // write JSX code to render an input box that captures the user's first name and sends that data to the API when the form is submitted (hint: use the useState hook to capture the user's input)  (hint: use the useState hook to capture the user's input)
  function validateEmail(email: string) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Login - Essence</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900 mb-5">
          Log in to Essence
        </h1>
        <div className="max-w-md w-full mt-10">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col mb-5">
              <label className="mb-2 font-bold text-lg text-left text-gray-700">
                First name
              </label>
              <input
                className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-4 pr-3 py-2 my-5 border border-gray-300 rounded-md leading-5 bg-white text-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 sm:text-sm transition duration-150 ease-in-out"
                type="text"
                name="firstName"
                autoComplete="firstName"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="flex flex-col mb-5">
              <label className="mb-2 font-bold text-lg text-left text-gray-700">
                Email address
              </label>
              <input
                className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-4 pr-3 py-2 my-5 border border-gray-300 rounded-md leading-5 bg-white text-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 sm:text-sm transition duration-150 ease-in-out"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button className="bg-purple-900 rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-purple-700/80">
              Send me a link
            </button>
            <Link href="/">
              <button className="bg-gray-600 rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 ml-8 hover:bg-gray-400">
                Back
              </button>
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
