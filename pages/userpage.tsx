import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useAuth } from "../context/auth";

export default function UserHomePage() {
  const [essaysData, setEssaysData] = useState([
    {
      id: 1,
      title: "yam",
      posts: [{ id: 1, type: "twittter", content: "stuff go dey here sha" }],
    },
  ]);
  //   const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [userData, setUserData] = useState(user);

  if (!isLoggedIn) {
    return <p>bros you go log in first na</p>;
  }

  return (
    <div className="max-w-md w-full mt-10 mx-auto">
      <h1 className="text-3xl font-bold mb-8">Welcome, {userData.email}!</h1>
      {essaysData && essaysData.length > 0 ? (
        <ul className="list-none space-y-4">
          {essaysData.map((essay) => (
            <li key={essay.id} className="border-b pb-4">
              <h2 className="text-2xl font-bold">{essay.title}</h2>
              <ul className="list-none space-y-2 mt-4">
                {essay.posts.map((post) => (
                  <li key={post.id} className="flex space-x-2">
                    <span className="font-bold">{post.type}:</span>
                    <span>{post.content}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't generated any posts yet.</p>
      )}
    </div>
  );
}
