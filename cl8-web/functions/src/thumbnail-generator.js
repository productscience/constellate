const gcs = require('@google-cloud/storage')()
const spawn = require('child-process-promise').spawn
const path = require('path')
const os = require('os')
const fs = require('fs')

module.exports = ThumbnailGenerator

function ThumbnailGenerator (object) {
  // [START eventAttributes]
  const fileBucket = object.bucket // The Storage bucket that contains the file.
  const filePath = object.name // File path in the bucket.
  const contentType = object.contentType // File content type.
  // [END eventAttributes]

  // [START stopConditions]
  // Exit if this is triggered on a file that is not an image.
  if (!contentType.startsWith('image/')) {
    console.log('This is not an image.')
    return null
  }

  // Get the file name.
  const fileName = path.basename(filePath)
  // Exit if the image is already a thumbnail.
  if (fileName.startsWith('thumb_')) {
    console.log('Already a Thumbnail.')
    return null
  }
  // [END stopConditions]

  // [START thumbnailGeneration]
  // Download file from bucket.
  const bucket = gcs.bucket(fileBucket)
  const tempFilePath = path.join(os.tmpdir(), fileName)
  const smallThumbnailPath = `${tempFilePath}-36x36`
  const largeThumbnailPath = `${tempFilePath}-200x200`
  const smallThumbnailName = `${fileName}-36x36`
  const largeThumbnailName = `${fileName}-200x200`
  const metadata = {
    contentType: contentType
  }
  return (
    bucket
      .file(filePath)
      .download({
        destination: tempFilePath
      })
      .then(() => {
        console.log('Image downloaded locally to', tempFilePath)
        console.log('making small thumbnail for', tempFilePath)
        // Generate a thumbnail using ImageMagick.
        return spawn('convert', [
          tempFilePath,
          '-thumbnail',
          '36x36>',
          smallThumbnailPath
        ])
      })
      .then(() => {
        console.log('making large thumbnail for', tempFilePath)

        // Generate a thumbnail using ImageMagick.
        return spawn('convert', [
          tempFilePath,
          '-thumbnail',
          '200x200>',
          largeThumbnailPath
        ])
      })
      .then(() => {
        console.log(
          'Thumbnails created at:',
          smallThumbnailPath,
          largeThumbnailPath
        )
        // We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
        const thumbFilePath = path.join(
          path.dirname(filePath),
          'thumbnails',
          smallThumbnailName
        )
        // Uploading the thumbnail.
        return bucket.upload(smallThumbnailPath, {
          destination: thumbFilePath,
          metadata: metadata
        })
      })
      .then(() => {
        const thumbFilePath = path.join(
          path.dirname(filePath),
          'thumbnails',
          largeThumbnailName
        )
        // Uploading the thumbnail.
        return bucket.upload(largeThumbnailPath, {
          destination: thumbFilePath,
          metadata: metadata
        })
      })
      // Once the thumbnail has been uploaded delete the local file to free up disk space.
      .then(() => fs.unlinkSync(tempFilePath))
      .then(() => fs.unlinkSync(smallThumbnailPath))
      .then(() => fs.unlinkSync(largeThumbnailPath))
  )
  // [END thumbnailGeneration]
}
// [END generateThumbnail]
