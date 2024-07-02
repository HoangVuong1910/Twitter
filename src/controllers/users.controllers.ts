import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordReqBody,
  EmailVerifyReqBody,
  FollowReqBody,
  ForgotPasswordReqBody,
  GetProfileReqParams,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResendVerifyEmailReqBody,
  TokenPayload,
  UnfollowReqParams,
  UpdateMeReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/requests/User.requests'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { pick } from 'lodash'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  // console.log(user)
  const user_id = user._id as ObjectId
  const result = await usersService.login({ user_id: user_id.toString(), verify: user.verify })
  return res.status(200).json({
    message: USERS_MESSAGES.LOGIN_SUCCESSFULLY,
    result
  })
}

export const oauthLoginController = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await usersService.oauthLogin(code as string)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&newUser=${result.newUser}`
  return res.redirect(urlRedirect)
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  // const { email, password } = req.body
  const result = await usersService.register(req.body)
  return res.status(200).json({
    message: USERS_MESSAGES.REGISTER_SUCCESSFULLY,
    result
  })
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  return res.status(200).json({
    message: USERS_MESSAGES.LOGOUT_SUCCESSFULLY
  })
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload
  const result = await usersService.refreshToken({ refresh_token, user_id, verify, exp })
  return res.status(200).json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESSFULLY,
    result
  })
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, EmailVerifyReqBody>,
  res: Response,
  next: NextFunction
) => {
  // const user = req.user as User
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  // Nếu đã verify rồi thì sẽ không báo lỗi mà sẽ trả về status OK với message là đã verify trước đó rồi
  if (user.email_verify_token === '') {
    return res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAI_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.verifyMail(user_id)
  return res.status(200).json({
    message: USERS_MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY,
    result
  })
}

export const resendVerifyEmailController = async (
  req: Request<ParamsDictionary, any, ResendVerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  // Kiểm tra tồn tại user trong db
  if (user === null) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  // Kiểm tra email đã được verify chưa
  if (user.email_verify_token === '') {
    return res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAI_ALREADY_VERIFIED_BEFORE
    })
  }
  await usersService.resendVerifyEmail(user_id, user.email)
  return res.status(200).json({
    message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESSFULLY
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  // const { user_id } = req.decoded_authorization as TokenPayload
  const user = req.user as User
  // const user_id = user._id as ObjectId
  const { _id, verify, email } = user

  await usersService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify, email })
  return res.status(200).json({
    message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
  })
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  return res.status(200).json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESSFULLY
  })
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await usersService.getMe(user_id)
  return res.status(200).json({
    message: USERS_MESSAGES.GET_ME_SUCCESSFULLY,
    result: user
  })
}
export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const body = req.body
  const user = await usersService.updateMe(user_id, body)
  return res.status(200).json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESSFULLY,
    result: user
  })
}

export const getProfileController = async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.params
  console.log('checkusername', username)
  const user = await usersService.getProfile(username)
  return res.status(200).json({
    message: USERS_MESSAGES.GET_USER_PROFILE_SUCCESSFULLY,
    result: user
  })
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await usersService.follow(user_id, followed_user_id)
  return res.status(200).json(result)
}

export const UnfollowController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.params

  const result = await usersService.Unfollow(user_id, followed_user_id)
  return res.status(200).json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await usersService.changePassword(user_id, password)
  return res.status(200).json(result)
}
