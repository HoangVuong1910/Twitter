import express from 'express'
import { NextFunction, Request, Response } from 'express'
import { ValidationChain } from 'express-validator'

import { validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)

    // Nếu không có lỗi thì next
    if (errors.isEmpty()) {
      return next()
    }

    const errorsObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    // console.log(errorsObject)
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      // Trả về lỗi không phải là lỗi validate
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg) // đẩy về bộ xử lý lỗi chính Error Handler trong index.ts
      }
      entityError.errors[key] = errorsObject[key]
    }

    // res.status(400).json({ errors: errors.mapped() })
    // Trả về lỗi thông thường
    next(entityError) // đẩy về bộ xử lý lỗi chính Error Handler trong index.ts
  }
}

// app.post('/signup', validate([
//   body('email').isEmail(),
//   body('password').isLength({ min: 6 })
// ]), async (req, res, next) => {
//   // request is guaranteed to not have any validation errors.
//   const user = await User.create({ ... });
// });
