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
import { Server } from 'socket.io'
import cors from 'cors'
import Conversation from './models/schemas/Conversations.schema'
import conversationsRouter from './routes/conversation.routes'
import { ObjectId } from 'mongodb'
import { verifyAccessToken } from './utils/commons'
import { TokenPayload } from './models/requests/User.requests'
import { UserVerifyStatus } from './constants/enums'
import { ErrorWithStatus } from './models/Errors'
import { USERS_MESSAGES } from './constants/messages'
import HTTP_STATUS from './constants/httpStatus'
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

// socket.io
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
})
const users: { [key: string]: { socket_id: string } } = {}
io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`)
  const user_id = socket.handshake.auth._id
  users[user_id] = {
    socket_id: socket.id
  }
  // console.log(users)
  /*
  {
  '66819789fe1f9ec1466f0425': { socket_id: 'LeFzaQJuj10-m4v3AAAF' },
  '667d83c9ecb3a1e090e91364': { socket_id: '_MEBcnSARsXiBvEnAAAH' }
  }
  */

  // middleware socket
  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization?.split(' ')[1]
    try {
      const decoded_authorization = await verifyAccessToken(access_token)
      const { verify } = decoded_authorization as TokenPayload
      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_VERIFIED,
          status: HTTP_STATUS.FORBIDDEN
        })
      }
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })

  socket.on('send_message', async (data) => {
    const { receiver_id, sender_id, content } = data.payload
    const receiver_socket_id = users[receiver_id]?.socket_id
    if (!receiver_socket_id) {
      return
    }
    const conversation = new Conversation({
      sender_id: new ObjectId(sender_id),
      receiver_id: new ObjectId(receiver_id),
      content: content
    })
    const result = await databaseService.conversations.insertOne(conversation)
    conversation._id = result.insertedId
    socket.to(receiver_socket_id).emit('receive_message', {
      payload: conversation
    })
  })

  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`user ${socket.id} disconnected`)
  })
})

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
