import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";
import { VibeType } from "../../components/DropDown";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

const handler = async (req: Request, res: Response) => {
  const { url, essay, vibe, wantsHashtags } = (await req.json()) as {
    essay?: string;
    url?: string;
    vibe?: VibeType;
    wantsHashtags: boolean;
  };

  if (!essay) {
    return new Response("No essay in the request", { status: 400 });
  }

  const vibeType = vibe || "twitter";
  const { temperature, max_tokens, message } = getPlatformSettings(
    vibeType,
    essay,
    wantsHashtags
  );

  const essayPayload: OpenAIStreamPayload = {
    model: "gpt-4",
    messages: [{ role: "user", content: message }],
    temperature,
    top_p: 1,
    max_tokens,
    stream: true,
    n: 1, // should always be 1. You can ask for more posts in the prompt itself. Just multiply the max_tokens so that you have num_posts * tokens_per_post === max_tokens
  };

  console.log("PAYLOAD", essayPayload);

  const stream = await OpenAIStream(essayPayload);
  return new Response(stream);
};

export default handler;

function getPlatformSettings(
  platform: VibeType,
  essayBody: string,
  wantsHashtags: boolean
) {
  const numPosts = 3;
  const platformConfigs = {
    professional: {
      temperature: 0.5,
      max_tokens: 250,
      message: wantsHashtags
        ? `Create ${numPosts} short and snappy LinkedIn posts that capture the essence of the author's essay. Use the author's voice and keep each post length to a maximum of 1300 characters. Incorporate relevant keywords and hashtags to increase visibility. Do this three times and clearly label each post with "1.", "2." and "3.":`
        : `Create ${numPosts} short and snappy LinkedIn posts that capture the essence of the author's essay. Use the author's voice and keep each post length to a maximum of 1300 characters. Hashtags are not allowed. Do this three times and clearly label each post with "1.", "2." and "3.":`,
      // message: `Create ${numPosts} short and snappy LinkedIn posts in the first-person perspective about this essay, as if the author is speaking. Main the author's voice and style. Aim for virality.  Do this three times and clearly label each tweet with "1.", "2." and "3." :`,
    },
    twitter: {
      temperature: 0.9, // used to be 0.7
      max_tokens: 60 * numPosts,
      message: wantsHashtags
        ? `Create ${numPosts} short and catchy tweets that capture the essence of the author's essay. Use the author's voice and keep each tweet length to a maximum of 280 characters. Incorporate relevant keywords and hashtags to increase visibility. Do this three times and clearly label each tweet with "1.", "2." and "3.":`
        : `Create ${numPosts} short and catchy tweets that capture the essence of the author's essay. Use the author's voice and keep each tweet length to a maximum of 280 characters. Hashtags are not allowed. Do this three times and clearly label each tweet with "1.", "2." and "3.":`,

      // message: `"Generate {numPosts} short and catchy tweets that capture the essence of the author's essay. Use the author's voice and keep each tweet length to a maximum of 280 characters. Incorporate relevant keywords and hashtags to increase visibility. Do this three times and clearly label each tweet with "1.", "2." and "3.":`,
      // message: `Create ${numPosts} short and catchy tweets in the first-person perspective about this essay, as if the author is speaking. Maintain the author's voice, limit hashtags and emojis and keep each tweet length to a maximum of 280 characters. Use a maximum of two emojis. Make it engaging for increased virality. Do this three times and clearly label each tweet with "1.", "2." and "3.":`,
    },
    funny: {
      temperature: 0.9,
      max_tokens: 200,
      message: wantsHashtags
        ? `Create ${numPosts} light-hearted and funny posts in the first-person perspective about this essay, as if the author is speaking. Stay true to the author's voice and avoid excessive use of hashtags and emojis. Incorporate relevant keywords and hashtags to increase visibility. Do this three times and clearly label each tweet with "1.", "2." and "3.":`
        : `Create ${numPosts} light-hearted and funny posts in the first-person perspective about this essay, as if the author is speaking. Stay true to the author's voice and avoid excessive use of hashtags and emojis. Hashtags are not allowed. Do this three times and clearly label each tweet with "1.", "2." and "3.":`,
      // `Create ${numPosts} light-hearted and funny posts in the first-person perspective about this essay, as if the author is speaking. Stay true to the author's voice and avoid excessive use of hashtags and emojis. Aim for a viral effect. Do this three times and clearly label each tweet with "1.", "2." and "3."`,
    },
  };

  if (!platformConfigs.hasOwnProperty(platform)) {
    throw new Error(`Invalid platform: ${platform}`);
  }

  const message = `${platformConfigs[platform].message} ${essayBody}`;

  return {
    ...platformConfigs[platform],
    message,
  };
}
