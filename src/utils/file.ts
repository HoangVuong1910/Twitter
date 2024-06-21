import e, { Request } from 'express'
import { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

export const initUploadFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true // option để tạo thư mục nested
      })
    }
  })
}

export const handleUploadImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR, // Thư mục chứa file uploads là D:\Projects\Twitter\uploads\temp
    keepExtensions: true, // Nếu là true thì sẽ lấy luôn đuôi mở rộng của file upload
    maxFiles: 4, // số lượng file tối đa upload
    maxFileSize: 3000 * 1024, // 3000kb (kích thước tối đa của file, quy đổi ra byte)
    maxTotalFileSize: 3000 * 1024 * 4, // (mỗi file kích thước là 3mb tổng 12mb)
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type ís not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      // trường hợp không upload file ảnh gì hết thì err sẽ trả về null, do đó không reject được error nên vẫn trả về status 200
      // check empty file upload:
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve(files.image as File[])
    })
  })
}

export const getNameFromFullname = (fullname: string) => {
  const nameArray = fullname.split('.')
  nameArray.pop()
  return nameArray.join('')
}

export const handleUploadVideo = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR, // Thư mục chứa file uploads là D:\Projects\Twitter\uploads\temp
    keepExtensions: true, // Nếu là true thì sẽ lấy luôn đuôi mở rộng của file upload
    maxFiles: 1, // số lượng file tối đa upload
    maxFileSize: 50 * 1024 * 1024, // 50mb (kích thước tối đa của file, quy đổi ra byte)

    filter: function ({ name, originalFilename, mimetype }) {
      return true
      // const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      // if (!valid) {
      //   form.emit('error' as any, new Error('File type ís not valid') as any)
      // }
      // return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      // trường hợp không upload file ảnh gì hết thì err sẽ trả về null, do đó không reject được error nên vẫn trả về status 200
      // check empty file upload:
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        return reject(new Error('File is empty'))
      }
      const videos = files.video as File[]
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string)
        fs.renameSync(video.filepath, video.filepath + '.' + ext)
        video.newFilename = video.newFilename + '.' + ext
      })
      resolve(files.video as File[])
    })
  })
}

export const getExtension = (fullname: string) => {
  const namearr = fullname.split('.')
  return namearr[namearr.length - 1]
}
