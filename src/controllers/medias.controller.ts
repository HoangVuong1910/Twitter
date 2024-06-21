import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import { handleUploadImage } from '~/utils/file'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.handleUploadImage(req)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPLOAD_SUCCESSFULLY,
    result: url
  })
}

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}
