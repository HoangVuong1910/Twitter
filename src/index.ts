import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initUploadFolder } from './utils/file'
import { config } from 'dotenv'
config()
databaseService.connect()
const app = express()
const port = process.env.PORT || 3056

// Khởi tạo folder uploads
initUploadFolder()

app.use(express.json())
app.use('/v1/api/users', usersRouter)
app.use('/v1/api/medias', mediasRouter)
// Xử lý Error Handler
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
