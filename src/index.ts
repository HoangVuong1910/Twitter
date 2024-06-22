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
config()
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
})
const app = express()
const port = process.env.PORT || 3056

// Khởi tạo folder uploads
initUploadFolder()

app.use(express.json())
app.use('/v1/api/users', usersRouter)
app.use('/v1/api/medias', mediasRouter)

// Serving file
// app.use('/static', express.static(UPLOAD_IMAGE_DIR)) // UPLOAD_IMAGE_DIR = path.resolve('uploads')
app.use('/v1/api/static', staticRouter)

// Xử lý Error Handler
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
