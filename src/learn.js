import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { stream, streamText, streamSSE } from 'hono/streaming'
import { HTTPException } from 'hono/http-exception'

let videos = []

const app = new Hono()

// Welcome request
app.get('/', (c) => {
    return c.json({ 'message': "Welcome to learning Hono with HC"})
})

// create video
app.post('/videos', async (c) =>  {
    const { videoName, videoChannel, duration } =  await c.req.json()

    const newVideo = {
        id: uuidv4(),
        videoName,
        videoChannel,
        duration
    }

    videos.push(newVideo)

    return c.json(newVideo)
})

// get all videos
app.get('/videos',  (c) => {
    return streamText(c, async (stream) => {
        stream.onAbort(() => {
            console.log('Aborted!')
          })

        for(const video of videos) {
            await stream.writeln(JSON.stringify(video))
            await stream.sleep(1000)
        }

    })
})

// video by ID
app.get('/videos/:id', (c) => {
    const { id } = c.req.param()

    const video = videos.find((video) => video.id === id)

    if (!video) {
        throw new HTTPException(404, { "message": "Video not found "})
    }

    return c.json(video)
})

// delete video
app.delete('/videos/:id', (c) => {
    const { id } = c.req.param()

   videos = videos.filter((video) => video.id !== id)

    return c.json({ "message": "Video deleted successfully!!"})
})


// update video
app.put('/videos/:id', async (c) => {
    const { id } = c.req.param()

    const index = videos.findIndex((video) => video.id === id)
    if (index === -1) {
        throw new HTTPException(404, { "message": "Video not found "})
    }

    const { videoName, videoChannel, duration } =  await c.req.json()

    videos[index] = {...videos[index], videoName, videoChannel, duration}


    return c.json(videos[index])
})


export default {
    port: 4000,
    fetch: app.fetch
}