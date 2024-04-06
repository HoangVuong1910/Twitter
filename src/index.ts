import express from 'express'
import usersRouter from './routes/users.routes'
const app = express()
const port = 3056
app.use(express.json())
app.use('/v1/api/users', usersRouter)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
