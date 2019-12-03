#!/usr/bin/env node
const argv = require('yargs').argv

const walk        = require('walk');
const path        = require('path');
const workerFarm  = require('worker-farm')
const workers     = workerFarm(require.resolve('./compress.js'))
const colors      = require('colors')

const compressData = async (filePath) => {
  const rawDSata    = fs.readFileSync(filePath)
  let binaryData = compress(rawDSata, {
    mode: 1,
    quality: 11
  });

  let ext = path.extname(filePath)
  let brottliFilePath = filePath.replace(ext, '.br' + ext)

  fs.writeFile(brottliFilePath, binaryData, function(err) {
   if(err) {
     console.log("something is not working")
     return console.log(err);
   }
   console.log("Compressed: " + brottliFilePath)
  })
}


const listAllFiles = async(dir) => {
  var files = [];

  // Walker options
  var walker = walk.walk(dir, { followLinks: false });

  walker.on('file', function (root, stat, next) {
    let ext_regex = /\.(svg|html|json|js|css|xml|htm)/
    let br_regex  = /\.br\./
    // Add this file to the list of files
    if (!stat.name.match(br_regex) && path.extname(stat.name).match(ext_regex)){
      files.push(root + '/' + stat.name);
    }
    next();
  });

  walker.on('end', function () {
    console.log("\n")
    console.log(colors.blue("Processing " + files.length + " files..."))
    console.log("\n")
    for (let index = 0; index < files.length; index++) {
      const element = files[index];
      workers(element, (err, outp) => {
        console.log(colors.green("Compressed: " + outp.filePath))
        console.log(colors.brightYellow("Original size: " + outp.originalFileSize) + " | " + colors.brightYellow("Brotli Size: " + outp.brotliFileSize) + " | " + colors.brightWhite("Saved: " + outp.difference))
        console.log("\n")
        if(index >= files.length-1) {
          workerFarm.end(workers)
        }
      });
    }
  });
}

if (argv.dir){
  listAllFiles(argv.dir)
} else {
  console.log(colors.red("ERROR: No --dir was set."))
}

