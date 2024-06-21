import fs from 'fs'
import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameFromFullname, handleUploadImage } from '~/utils/file'
import { isProduction } from '~/constants/congfig'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'
config()

class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath) // Xử lý ảnh chuyển sang jpeg và lưu vào folder upload bằng method toFile()
        // fs.unlinkSync(file.filepath) // xóa ảnh trong file tạm sau khi đã xử lý ảnh ( chưa handle được Error deleting file: EPERM: operation not permitted, unlink)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/v1/api/static/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()

export default mediasService
