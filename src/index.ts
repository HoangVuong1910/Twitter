import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
const app = express()
const port = 3056
app.use(express.json())
app.use('/v1/api/users', usersRouter)
databaseService.connect()

// Xử lý Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({
    error: err.message
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
