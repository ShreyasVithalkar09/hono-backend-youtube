import { Hono } from 'hono'
import connectDB from './db/connect'
import { logger } from 'hono/logger'
import { poweredBy } from "hono/powered-by"
import { FavYoutubeVideo } from './db/fav-youtube-schema' 
import { HTTPException } from 'hono/http-exception'
import { stream, streamText } from 'hono/streaming'

const app = new Hono().basePath('/api')

// middlewares
app.use(logger())
app.use(poweredBy())

connectDB()
.then(() => {

  // Get all videos
  app.get("/videos", async (c) => {
    const videos = await FavYoutubeVideo.find()
    return c.json({
        videos,
        statusCode: 200
    })
  })

  // create fav video
  app.post("/videos", async (c) => {
    const { title, description, watched, youtuberName} =  await c.req.json()

    if (!(title && description && watched && youtuberName )) {
        throw new HTTPException(400, { message: "All fields are required"})
    }

    const video = await FavYoutubeVideo.create({
      title,
      description,
      watched,
      youtuberName
    })

    if(!video) {
      throw new HTTPException(500, { message: "Something went wrong while adding video"})
    }

    return c.json({
      video,
      statusCode: 201
    })

  })

  // get video
  app.get("videos/:id", async (c) => {
    const { id } = c.req.param()
    
    const video = await FavYoutubeVideo.findById(id)

    if(!video){
      throw new HTTPException(404, { "message": "Video not found "})
    }

    return c.json({
      video,
      statusCode: 200
    })
  })

  // get video in stream
  app.get("videos/stream/:id", async (c) => {
    const { id } = c.req.param()
    
    const video = await FavYoutubeVideo.findById(id)

    if(!video){
      throw new HTTPException(404, { "message": "Video not found "})
    }

    return stream(c, async (stream) => {
      stream.onAbort(() => {
        console.log('Aborted!')
      })

      for (let i=0; i<video.description.length; i++) {
          await stream.write(video.description[i])
          await stream.sleep(1000)
      }
    })
  })

  // delete video
  app.delete("videos/:id", async (c) => {
    const { id } = c.req.param()

    const status = await FavYoutubeVideo.findByIdAndDelete(id)
    if(!status){
      throw new HTTPException(404, { "message": "Video does not exist"})
    }

    return c.json({
      message: "Video deleted successfully!!",
      statusCode: 200
    })
  })

  // update video
  app.patch("videos/:id", async (c) => {
    const { id } = c.req.param()

    const { title, description, watched, youtuberName} =  await c.req.json()

    const updatedVideo = await FavYoutubeVideo.findByIdAndUpdate(id, 
      {
        title,
        description,
        watched,
        youtuberName
      }, { new: true})

      if(!updatedVideo) {
        throw new HTTPException(500, { message: "Something went wrong while adding video"})
      }

    return c.json({
      video: updatedVideo,
      statusCode: 200
    })
    
  })


})
.catch((err) => {
  app.get("/*", (c) => {
    throw new HTTPException(500, { message: `MONGODB CONNECTION FAILED:: ${err.message}`})
  })
})

app.onError((err, c) => {
  throw new HTTPException(500, { message: `APP ERROR:: ${err.message}`})
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default {
  port: process.env.PORT || 4001,
  fetch: app.fetch
}
