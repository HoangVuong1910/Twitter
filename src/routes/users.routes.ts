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
  updateMeController,
  getProfileController,
  followController,
  UnfollowController,
  changePasswordController,
  oauthLoginController
} from '~/controllers/users.controllers'
import { filterBodyMiddleware } from '~/middlewares/common.middlewares'
import {
  UnfollowValidator,
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
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
 * Description: Oauth login with google
 * Path: /oauth/google
 * Method: GET
 */
usersRouter.get('/oauth/google', wrapRequestHandler(oauthLoginController))

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
  filterBodyMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  validate(updateMeValidator),
  wrapRequestHandler(updateMeController)
)

/**
 * Description: Get user profile
 * Path: /:username
 * Method: GET
 */

usersRouter.get('/:username', wrapRequestHandler(getProfileController))

/**
 * Description: Follow someone
 * Path: /follow
 * Method: POST
 * Header: {Bear: <access_token}
 * Body: {followed_user_id: string}
 */

usersRouter.post(
  '/follow',
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(followValidator),
  wrapRequestHandler(followController)
)

/**
 * Description: Unfollow someone
 * Path: /follow/:followed_user_id
 * Method: DELETE
 * Header: {Bear: <access_token}
 */

usersRouter.delete(
  '/follow/:followed_user_id',
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(UnfollowValidator),
  wrapRequestHandler(UnfollowController)
)

/**
 * Description: Change password
 * Path: /change-password
 * Method: PUT
 * Header: {Bear: <access_token}
 * Body: { old_password: string, password: string, confirm_password: string }
 */

usersRouter.put(
  '/change-password',
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(changePasswordValidator),
  wrapRequestHandler(changePasswordController)
)

export default usersRouter
