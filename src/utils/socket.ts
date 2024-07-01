import { Server } from 'socket.io'
import { verifyAccessToken } from './commons'
import { TokenPayload } from '~/models/requests/User.requests'
import { UserVerifyStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import Conversation from '~/models/schemas/Conversations.schema'
import databaseService from '~/services/database.services'
import { Server as ServerHttp } from 'http'

const initSocket = (httpServer: ServerHttp) => {
  // socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000'
    }
  })
  const users: { [key: string]: { socket_id: string } } = {}

  // middleware server instance
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
      // truyền data vào socket để sử dụng ở các middleware khác
      socket.handshake.auth.decoded_authorization = decoded_authorization
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })

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

    // middleware cho socket instance
    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth
      try {
        await verifyAccessToken(access_token)
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })

    // catch lỗi từ middleware socket instance
    socket.on('error', (error) => {
      if (error.message === 'Unauthorized') {
        socket.disconnect()
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
}

export default initSocket
