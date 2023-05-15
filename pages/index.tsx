import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState, useEffect, useMemo, MouseEventHandler } from "react";
import { toast } from "react-hot-toast";
import DropDown, { VibeType } from "../components/DropDown";
import LoadingDots from "../components/LoadingDots";
import { TwitterShareButton } from "react-twitter-embed";
import debounce from "lodash.debounce";

import { postAPI } from "../utils/fetch";
import { streamingAPI } from "../utils/streaming";
import { isURL, isSubstackDraft } from "../utils/utils";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [vibe, setVibe] = useState<VibeType>("twitter");
  const [wantsHashtags, setWantsHashtags] = useState(false);
  const [rawStreamingResult, setRawStreamingResult] = useState<string>("");

  // ESSENCE state
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [streamingError, setStreamingError] = useState<string>("");

  const [essay, setEssay] = useState({ content: "", heading: "" });
  const [tweets, setTweets] = useState<string[]>([]);

  const postsRef = useRef<null | HTMLDivElement>(null);

  const scrollToPosts = () => {
    if (postsRef.current !== null) {
      const lastPost = postsRef?.current?.lastChild as HTMLElement;
      lastPost?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleHashTagChange = (e: any) => {
    setWantsHashtags(e.target.checked);
  };

  const isValidURL = (url: string) => {
    if (!isURL(url)) {
      setError("Please enter a valid Substack URL.");
      return false;
    } else if (isSubstackDraft(url)) {
      setError("Please enter a published post. We don't work with drafts yet.");
      return false;
    } else {
      setError("");
      return true;
    }
  };

  const fetchEssay = async (e: any) => {
    // Clear existing tweets and rawStreamingResult
    setRawStreamingResult("");
    setTweets([]);

    if (!isValidURL(url)) {
      return;
    }

    e.preventDefault();
    setLoading(true);

    const { data, error } = await postAPI({
      url: "/api/essayfetcher",
      data: { url },
    });

    if (error) {
      console.error(error);
      setError(error);
    }

    const newEssay = {
      ...essay,
      content: data?.content,
      heading: data?.heading,
    };

    setEssay(newEssay);
    setLoading(false);
  };

  useEffect(() => {
    callStreamingAPI();
  }, [essay.content, essay.heading]);

  const callStreamingAPI = () => {
    if (essay.content) {
      streamingAPI({
        url: "/api/generate",
        onDataChunk: (chunk) => {
          setRawStreamingResult((prev) => prev + chunk);
        },
        onDataEnd: () => {
          setLoading(false);
          scrollToPosts();
        },
        onError: (error: any) => {
          console.error("Streaming API error:", error);
          setStreamingError(error);
        },
        options: {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vibe,
            essay: essay.content,
            url,
            wantsHashtags,
          }),
        },
      });
    }
  };

  // TODO might be irrelevant
  useEffect(() => {
    const tweets = createTweets(rawStreamingResult);
    setTweets(tweets);
  }, [rawStreamingResult]);

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Essence - we capture the essence of your essays</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
          Share your insights with the world
        </h1>
        <p className="text-slate-500 mt-5">
          Spend your time writing banger essays...we'll handle the tweets.
        </p>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfa8iIXrSaMAyZ1GX-duI7Yt7a4JutFC_GTB8FevkHaCgQJmw/viewform?vc=0&c=0&w=1&flr=0"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-900 underline hover:text-purple-600 mt-3"
        >
          Give us feedback
        </a>
        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />
            <p className="text-left font-medium">
              Paste your essay link here — Substack only pls!
            </p>
          </div>
          <div className="flex flex-col">
            <input
              className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-4 pr-3 py-2 my-5 border border-gray-300 rounded-md leading-5 bg-white text-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 sm:text-sm transition duration-150 ease-in-out"
              type="search"
              name="url"
              autoComplete="url"
              value={url}
              placeholder="Paste your essay link here"
              onChange={(e) => setUrl(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {streamingError && (
              <p className="text-red-500 text-sm mt-1">{streamingError}</p>
            )}
          </div>

          <div className="flex mb-5 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">Select your vibe.</p>
          </div>
          <div className="block ">
            <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />
          </div>
          <div className="flex items-center mt-5">
            <input
              id="hashtag-checkbox"
              name={"hashtags"}
              type="checkbox"
              className="w-4 h-4 text-purple-600 bg-gray-100 border-purple-600 rounded focus:ring-purple-500 focus:border-purple-500 focus:ring-offset-gray-100"
              checked={wantsHashtags}
              onChange={handleHashTagChange}
            />
            <label
              htmlFor={"Enable hashtags"}
              className="ml-2 block font-medium text-sm text-gray-900"
            >
              Enable hashtags
            </label>
          </div>

          {!loading && (
            <button
              className="bg-purple-700 rounded-xl text-white text-slate font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-purple-700/80 w-full"
              onClick={debounce((e: any) => fetchEssay(e), 1000)}
            >
              Generate posts &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-purple-900 rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-purple-700/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>

        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10">
          {rawStreamingResult && (
            <>
              <div>
                <h2 className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto">
                  Your generated posts
                </h2>
                {essay?.heading && (
                  <h3 className="sm:text-2xl text-lg mt-2">
                    Essay: {essay.heading}
                  </h3>
                )}
              </div>

              <div
                className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto"
                ref={postsRef}
              >
                {tweets.map((generatedPost: string, index: number) => {
                  if (index < 3) {
                    return (
                      <GeneratedPost
                        key={`${generatedPost}-${index}`}
                        index={index}
                        generatedPost={generatedPost}
                      />
                    );
                  }
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const GeneratedPost = ({
  generatedPost,
  index,
}: {
  generatedPost: string;
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current !== null) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [generatedPost]);

  return (
    <div
      className="bg-white rounded-xl shadow-md p-8 transition ccursor-default border text-center"
      ref={ref}
      key={`${generatedPost}-${index}`}
    >
      <p>{generatedPost}</p>
      <div className="flex justify-between mt-4">
        <div className="flex justify-center">
          <button
            className=" text-gray-400 rounded-lg px-2 py-1 -mr-2"
            onClick={(e) => {
              e.stopPropagation();
              console.log("upvote");
              toast.success("Upvote counted");
            }}
          >
            <svg
              className="w-7 h-7 hover:bg-gray-200 hover:text-gray-700 p-1 rounded "
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </button>
          <button
            className="border-gray-600 text-gray-400 rounded-lg px-2 py-1"
            onClick={(e) => {
              e.stopPropagation();
              toast.success("Downvote counted");
            }}
          >
            <svg
              className=" w-7 h-7 hover:bg-gray-200 hover:text-gray-700 p-1 rounded"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </button>
        </div>
        <button
          className="bg-purple-700 text-white font-medium rounded-lg px-4 py-1 hover:bg-purple-700/80"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(generatedPost);
            toast("Post copied to clipboard", {
              icon: "✂️",
            });
          }}
        >
          Copy
        </button>
      </div>
    </div>
  );
};

function createTweets(stream: string) {
  const tweetRegex = /(\d+\.\s)([^]*?)(?=\s\d+\.|$)/g;
  const tweets = [];
  let match;

  while ((match = tweetRegex.exec(stream)) !== null) {
    const tweet = match[2].trim();
    tweets.push(tweet);
  }

  return tweets;
}

export default Home;
