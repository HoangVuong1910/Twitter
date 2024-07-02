import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initUploadFolder } from './utils/file'
import { config } from 'dotenv'
import path from 'path'
import { UPLOAD_IMAGE_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRoute from './routes/bookmarks.routes'
import likesRoute from './routes/likes.routes'
import searchRouter from './routes/search.routes'
// import '~/utils/fake'
import { createServer } from 'http'
import cors from 'cors'
import conversationsRouter from './routes/conversation.routes'
import initSocket from './utils/socket'
// import '~/utils/s3'
config()
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})
const app = express()
const httpServer = createServer(app)

const port = process.env.PORT || 3056

// Khởi tạo folder uploads
initUploadFolder()
// config cors
app.use(cors())

app.use(express.json())

//Route
app.use('/v1/api/users', usersRouter)
app.use('/v1/api/medias', mediasRouter)
app.use('/v1/api/tweets', tweetsRouter)
app.use('/v1/api/bookmarks', bookmarksRoute)
app.use('/v1/api/likes', likesRoute)
app.use('/v1/api/search', searchRouter)
app.use('/v1/api/conversations', conversationsRouter)

// Serving file
// app.use('/static', express.static(UPLOAD_IMAGE_DIR)) // UPLOAD_IMAGE_DIR = path.resolve('uploads')
app.use('/v1/api/static', staticRouter)

// Xử lý Error Handler
app.use(defaultErrorHandler)

//khởi tạo socket io
initSocket(httpServer)

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
