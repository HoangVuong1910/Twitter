import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'
const usersRouter = Router()
/**
 * Description: login a user
 * Path: /login
 * Method: POST
 * Body: {name:string,email:string,password:string }
 */
usersRouter.post('/login', validate(loginValidator), wrapRequestHandler(loginController))
/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: {name:string,email:string,password:string,confirm_password:string,date_of_birth:ISO8601 }
 */

usersRouter.post('/register', validate(registerValidator), wrapRequestHandler(registerController))

export default usersRouter
