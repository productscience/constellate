// we need the service account creds to generate signed urls, to add to profiles


const spawn = require('child-process-promise').spawn
const path = require('path')
const os = require('os')
const fs = require('fs')

const admin = require('firebase-admin')
admin.initializeApp()
const gcs = admin.storage()

module.exports = ThumbnailGenerator

function ThumbnailGenerator (object) {
  const fileBucket = object.bucket // The Storage bucket that contains the file.
  const filePath = object.name // File path in the bucket.
  const fileName = path.basename(filePath)
  const contentType = object.contentType // File content type.

  // Exit if this is triggered on a file that is not an image.
  if (!contentType.startsWith('image/')) {
    console.log('This is not an image.')
    return null
  }
  // Exit if the image is already a thumbnail.
  if (fileName.startsWith('thumb_')) {
    console.log('Already a Thumbnail.')
    return null
  }

  // check if this is a profile photos, with a profile id
  console.log('Profile filename ', fileName.split('-'))

  // Download file from bucket.
  const bucket = gcs.bucket(fileBucket)

  const tempFilePath = path.join(os.tmpdir(), fileName)
  const smallThumbnailPath = `${tempFilePath}-36x36`
  const largeThumbnailPath = `${tempFilePath}-200x200`

  const smallThumbnailName = `thumb_${fileName}-36x36`
  const largeThumbnailName = `thumb_${fileName}-200x200`

  return (
    bucket
      .file(filePath)
      .download({
        destination: tempFilePath
      })
      .then(() => {
        console.log('Image downloaded locally to', tempFilePath)
        // Generate a thumbnail using ImageMagick.
        console.log('making thumbnails for', tempFilePath)

        return Promise.all([
          spawn('convert', [
            tempFilePath,
            '-thumbnail',
            '36x36>',
            smallThumbnailPath
          ]),
          spawn('convert', [
            tempFilePath,
            '-thumbnail',
            '200x200>',
            largeThumbnailPath
          ])
        ])
      })
      .then(results => {
        // Uploading the thumbnail.
        console.log('Thumbnails created at:', [
          smallThumbnailPath,
          largeThumbnailPath
        ])
        const largeUploadThumb = path.join(
          path.dirname(filePath),
          'thumbnails',
          largeThumbnailName
        )
        const smallUploadThumb = path.join(
          path.dirname(filePath),
          'thumbnails',
          smallThumbnailName
        )
        const metadata = {
          contentType: contentType
        }
        return Promise.all([
          bucket.upload(smallThumbnailPath, {
            destination: smallUploadThumb,
            metadata: metadata
          }),
          bucket.upload(largeThumbnailPath, {
            destination: largeUploadThumb,
            metadata: metadata
          })
        ])
      })
      .then(results => {
        // return signed urls to add to an image
        const largeUpload = results[0]
        const smallUpload = results[1]
        //
        const config = {
          action: 'read',
          expires: '03-01-2500'
        }

        console.log(largeUpload, smallUpload)

        return Promise.all([
          largeUpload.getSignedUrl(config),
          smallUpload.getSignedUrl(config)
        ])
      })
      .then(results => {
        // is this a user profile? if so, lets update the details to fetch this info
        console.log(results)
        // admin.database().ref('')
      })
      // Once the thumbnail has been uploaded delete the local file to free up disk space.
      .then(() => fs.unlinkSync(tempFilePath))
      .then(() => fs.unlinkSync(smallThumbnailPath))
      .then(() => fs.unlinkSync(largeThumbnailPath))
  )
  // [END thumbnailGeneration]
}
// [END generateThumbnail]
