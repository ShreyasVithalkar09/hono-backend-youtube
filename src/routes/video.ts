import { Hono } from "hono";
import { stream, streamText } from "hono/streaming";
import { HTTPException } from "hono/http-exception";
import { FavYoutubeVideo } from "../db/fav-youtube-schema";

const videoApp = new Hono();

// Get all videos
videoApp.get("/", async (c) => {
  const videos = await FavYoutubeVideo.find();
  return c.json({
    videos,
    statusCode: 200,
  });
});

// create fav video
videoApp.post("/", async (c) => {
  const { title, description, watched, youtuberName } = await c.req.json();

  if (!(title && description && watched && youtuberName)) {
    throw new HTTPException(400, { message: "All fields are required" });
  }

  const video = await FavYoutubeVideo.create({
    title,
    description,
    watched,
    youtuberName,
  });

  if (!video) {
    throw new HTTPException(500, {
      message: "Something went wrong while adding video",
    });
  }

  return c.json({
    video,
    statusCode: 201,
  });
});

// get video
videoApp.get("/:id", async (c) => {
  const { id } = c.req.param();

  const video = await FavYoutubeVideo.findById(id);

  if (!video) {
    throw new HTTPException(404, { message: "Video not found " });
  }

  return c.json({
    video,
    statusCode: 200,
  });
});

// get video in stream
videoApp.get("/:id/stream", async (c) => {
  const { id } = c.req.param();

  const video = await FavYoutubeVideo.findById(id);

  if (!video) {
    throw new HTTPException(404, { message: "Video not found " });
  }

  return stream(c, async (stream) => {
    stream.onAbort(() => {
      console.log("Aborted!");
    });

    for (let i = 0; i < video.description.length; i++) {
      await stream.write(video.description[i]);
      await stream.sleep(100);
    }
  });
});

// delete video
videoApp.delete("/:id", async (c) => {
  const { id } = c.req.param();

  const status = await FavYoutubeVideo.findByIdAndDelete(id);
  if (!status) {
    throw new HTTPException(404, { message: "Video does not exist" });
  }

  return c.json({
    message: "Video deleted successfully!!",
    statusCode: 200,
  });
});

// update video
videoApp.patch("/:id", async (c) => {
  const { id } = c.req.param();

  const { title, description, watched, youtuberName } = await c.req.json();

  const updatedVideo = await FavYoutubeVideo.findByIdAndUpdate(
    id,
    {
      title,
      description,
      watched,
      youtuberName,
    },
    { new: true }
  );

  if (!updatedVideo) {
    throw new HTTPException(500, {
      message: "Something went wrong while adding video",
    });
  }

  return c.json({
    video: updatedVideo,
    statusCode: 200,
  });
});

export default videoApp;
