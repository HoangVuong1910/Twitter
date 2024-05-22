import { Router } from 'express'
import {
  verifyEmailController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
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
/**
 * Description: logut a user
 * Path: /logout
 * Header: "Bear <access_token>"
 * Method: POST
 * Body: {refresh_token: string }
 */

usersRouter.post(
  '/logout',
  validate(accessTokenValidator),
  validate(refreshTokenValidator),
  wrapRequestHandler(logoutController)
)

/**
 * Description: Verify email when user client click on the link in email
 * Path: /verify-email
 * Method: POST
 * Body: {email_verify_token: string }
 */

usersRouter.post(
  '/verify-email',
  validate(emailVerifyTokenValidator),
  // validate(refreshTokenValidator),
  wrapRequestHandler(verifyEmailController)
)

/**
 * Description: Resend email when user client click on the link in resend email
 *  * Header: "Bear <access_token>"
 * Path: /resend-verify-email
 * Method: POST
 * Body: {}
 */

usersRouter.post(
  '/resend-verify-email',
  validate(accessTokenValidator),
  wrapRequestHandler(resendVerifyEmailController)
)

export default usersRouter
