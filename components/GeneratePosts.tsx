// export const GeneratePosts = () => {
//   return (
//     <>
//       <div className="max-w-xl w-full">
//         <div className="flex mt-10 items-center space-x-3">
//           <Image
//             src="/1-black.png"
//             width={30}
//             height={30}
//             alt="1 icon"
//             className="mb-5 sm:mb-0"
//           />
//           <p className="text-left font-medium">
//             Paste your essay link here — Substack only pls!
//           </p>
//         </div>
//         <div className="flex flex-col">
//           <input
//             className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-4 pr-3 py-2 my-5 border border-gray-300 rounded-md leading-5 bg-white text-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 sm:text-sm transition duration-150 ease-in-out"
//             type="search"
//             name="url"
//             autoComplete="url"
//             value={url}
//             placeholder="Paste your essay link here"
//             onChange={(e) => setUrl(e.target.value)}
//           />
//           {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//           {streamingError && (
//             <p className="text-red-500 text-sm mt-1">{streamingError}</p>
//           )}
//         </div>

//         <div className="flex mb-5 items-center space-x-3">
//           <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
//           <p className="text-left font-medium">Select your vibe.</p>
//         </div>
//         <div className="block">
//           <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />
//         </div>

//         {!loading && (
//           <>
//             <button
//               className="bg-purple-900 rounded-xl text-white text-slate font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-purple-700/80"
//               onClick={debounce((e: any) => fetchEssay(e), 1000)}
//             >
//               Generate posts &rarr;
//             </button>
//             <Link href="/login">
//               <button className="bg-gray-600 rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 ml-8 hover:bg-gray-400">
//                 Log in
//               </button>
//             </Link>
//           </>
//         )}
//         {loading && (
//           <button
//             className="bg-purple-900 rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-purple-700/80 w-full"
//             disabled
//           >
//             <LoadingDots color="white" style="large" />
//           </button>
//         )}
//       </div>

//       <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
//       <div className="space-y-10 my-10">
//         {generatedBios && (
//           <>
//             <div>
//               <h2 className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto">
//                 Your generated posts
//               </h2>
//               {essay?.heading && (
//                 <h3 className="sm:text-2xl text-lg mt-2">
//                   Essay: {essay.heading}
//                 </h3>
//               )}
//             </div>

//             <div
//               className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto"
//               ref={postsRef}
//             >
//               {tweets.map((generatedPost: string, index: number) => {
//                 if (index < 3) {
//                   return (
//                     <GeneratedPost
//                       key={`${generatedPost}-${index}`}
//                       index={index}
//                       generatedPost={generatedPost}
//                     />
//                   );
//                 }
//               })}
//             </div>
//           </>
//         )}
//       </div>
//     </>
//   );
// };
