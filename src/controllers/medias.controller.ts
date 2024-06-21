import { Request, Response, NextFunction } from 'express'
import path from 'path'
import HTTP_STATUS from '~/constants/httpStatus'
import mediasService from '~/services/medias.services'
import { handleUploadSingleImage } from '~/utils/file'
console.log(path.resolve('uploads')) // D:\Projects\Twitter\uploads
export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.handleUploadSingleImage(req)
  return res.status(HTTP_STATUS.OK).json({
    result: result
  })
}
