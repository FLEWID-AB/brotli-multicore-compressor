const fs = require('fs')
const compress = require('brotli/compress');
const path = require('path');
const fileSize = require("filesize");

module.exports = (filePath, callback) => {
  const rawDSata = fs.readFileSync(filePath)
  let binaryData = compress(rawDSata, {
    mode: 1,
    quality: 11
  });

  let ext = path.extname(filePath)
  let brotliFilePath = filePath.replace(ext, '.br' + ext)

  fs.writeFile(brotliFilePath, binaryData, function (err) {
    if (err) {
      console.log("something is not working with the brotli compressor")
      callback(null, err)
    }

    let originalFileStats = fs.statSync(filePath)
    let brotliFileStats = fs.statSync(brotliFilePath)
    let returnObject = {
      filePath: filePath,
      originalFileSize: fileSize(originalFileStats.size),
      brotliFileSize: fileSize(brotliFileStats.size),
      difference: fileSize(originalFileStats.size - brotliFileStats.size)
    }

    callback(null, returnObject)
  })
}
