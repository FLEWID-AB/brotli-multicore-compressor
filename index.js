#!/usr/bin/env node
const argv = require('yargs').argv

const walk        = require('walk');
const path        = require('path');
const workerFarm  = require('worker-farm')
const workers     = workerFarm(require.resolve('./compress.js'))
const colors      = require('colors')

const os = require('os')
const fs = require('fs')
const FindFiles = require('file-regex');
const fileSize = require("filesize");

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
        console.log(colors.grey("Original size: " + outp.originalFileSize + " | " + "Brotli Size: " + outp.brotliFileSize + " | " + "Saved: " + outp.difference))
        console.log("\n")
        if(index >= files.length-1) {
          workerFarm.end(workers, (callb) => {
            getTotalFileSize()
          });
        }
      });
    }
  });
}

const argv_dir = argv.dir

if (argv_dir){
  listAllFiles(argv_dir)
} else {
  console.log(colors.red("ERROR: No --dir was set."))
}



const getTotalFileSize = async () => {
  let originalTotalFileSize = 0;
  let brotiTotalFileSize = 0;

  const originalFiles = await FindFiles("./tests/files", /^((?!\.br).)*\.(svg|html|json|js|css|xml|htm)$/gm, 9999, { concurrency: os.cpus().length})
  for (let index = 0; index < originalFiles.length; index++) {
    originalTotalFileSize += fs.statSync(originalFiles[index].dir + "/" + originalFiles[index].file).size;
  }

  const BrotilFiles = await FindFiles("./tests/files", /\.br\./, 9999, { concurrency: os.cpus().length })
  for (let index = 0; index < BrotilFiles.length; index++) {
    brotiTotalFileSize += fs.statSync(BrotilFiles[index].dir + "/" + BrotilFiles[index].file).size;
  }

  console.log(colors.blue("Summary\n"))
  console.log(colors.grey("Original Files Size: " + fileSize(originalTotalFileSize)) + "\n")
  console.log(colors.grey("Brotli Files Size: " + fileSize(brotiTotalFileSize)) + "\n")
  console.log(colors.brightWhite("Total save: " + fileSize(originalTotalFileSize - brotiTotalFileSize)) + "\n")
}

// find.file(/\.br\./, "./tests/files", function (files) {
//   console.log("BR")
//   console.log(files);
// })
