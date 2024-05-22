import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  EmailVerifyReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResendVerifyEmailReqBody,
  TokenPayload
} from '~/models/requests/User.requests'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  // console.log(user)
  const user_id = user._id as ObjectId
  const result = await usersService.login(user_id.toString())
  return res.status(200).json({
    message: USERS_MESSAGES.LOGIN_SUCCESSFULLY,
    result
  })
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
  await usersService.resendVerifyEmailController(user_id)
  return res.status(200).json({
    message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESSFULLY
  })
}
