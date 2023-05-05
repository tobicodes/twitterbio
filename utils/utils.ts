export function isURL(url: string) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

// TODO these should move to UTILS
export function isSubstackDraft(url: string) {
  const pattern = /^https:\/\/[\w.-]+\/publish\/post\/\d+$/;
  return pattern.test(url);
}

// not used atm

//  const checkAndStreamBabe = async () => {
//    const { content, heading } = essay;
//    if (content && heading) {
//      await streamBabe(); // generate posts
//    }
//  };

//   const streamBabe = async () => {
//     setGeneratedBios("");
//     setLoading(true);

//     const { data, error } = await postAPI({
//       url: "/api/generate",
//       data: {
//         vibe,
//         essay: essay?.content,
//         url,
//       },
//       timeout: Infinity,
//     });

//     if (error) {
//       setLoading(false);
//       console.error("Error:", error);
//       return;
//     }

//     const responseBody = data;
//     if (!responseBody) {
//       return;
//     }

//     const reader = responseBody.getReader();
//     const decoder = new TextDecoder("utf-8");

//     reader
//       .read()
//       .then(function process({ done, value }: { done: boolean; value: any }) {
//         if (done) {
//           setLoading(false);
//           scrollToPosts();
//           return;
//         }

//         if (value) {
//           const decodedValue = decoder.decode(value, { stream: !done });
//           setGeneratedBios((prev) => prev + decodedValue);
//           // scrollToPosts();
//         }
//         reader.read().then(process);
//       });
//   };
