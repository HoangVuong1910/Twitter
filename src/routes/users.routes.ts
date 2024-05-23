import { Router } from 'express'
import {
  verifyEmailController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  forgotPasswordController,
  verifyForgotPasswordController,
  getMeController,
  updateMeController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
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
 * Header: "Bear <access_token>"
 * Path: /resend-verify-email
 * Method: POST
 * Body: {}
 */

usersRouter.post(
  '/resend-verify-email',
  validate(accessTokenValidator),
  wrapRequestHandler(resendVerifyEmailController)
)

/**
 * Description: Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: {email: string}
 */

usersRouter.post('/forgot-password', validate(forgotPasswordValidator), wrapRequestHandler(forgotPasswordController))
/**
 * Description: Verify link in email to reset password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: {forgot_password_token: string}
 */

usersRouter.post(
  '/verify-forgot-password',
  validate(verifyForgotPasswordTokenValidator),
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description: Get my profile
 * Path: /me
 * Method: GET
 * Header: "Bear <access_token>"
 */

usersRouter.get('/me', validate(accessTokenValidator), wrapRequestHandler(getMeController))

/**
 * Description: update my profile
 * Path: /me
 * Method: PATCH
 * Header: "Bear <access_token>"
 * Body: UserSchema
 */

usersRouter.patch(
  '/me',
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(updateMeValidator),
  wrapRequestHandler(updateMeController)
)

export default usersRouter
