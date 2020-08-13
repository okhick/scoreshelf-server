const ProcessUploadedMusic = function(upload) {
  console.log(upload);
  let recievedFiles = [];
  for (key in upload) {
    recievedFiles.push(upload[key].name)
  }
  return recievedFiles;
}

module.exports = { ProcessUploadedMusic };