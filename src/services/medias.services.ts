import fs from 'fs'
import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameFromFullname, handleUploadSingleImage } from '~/utils/file'
import { isProduction } from '~/constants/congfig'
import { config } from 'dotenv'
config()

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullname(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    await sharp(file.filepath).jpeg().toFile(newPath) // Xử lý ảnh chuyển sang jpeg và lưu vào folder upload bằng method toFile()
    // fs.unlinkSync(file.filepath) // xóa ảnh trong file tạm sau khi đã xử lý ảnh ( chưa handle được Error deleting file: EPERM: operation not permitted, unlink)
    return isProduction
      ? `${process.env.HOST}/medias/${newName}.jpg`
      : `http://localhost:${process.env.PORT}/medias/${newName}.jpg`
  }
}

const mediasService = new MediasService()

export default mediasService
