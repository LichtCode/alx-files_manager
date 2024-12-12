const Bull = require('bull');
const { getFileById } = require('../utils/fileStorage'); // Assuming you have this helper function
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');
const path = require('path');

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job, done) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    done(new Error('Missing fileId'));
    return;
  }

  if (!userId) {
    done(new Error('Missing userId'));
    return;
  }

  const file = await getFileById(userId, fileId);
  if (!file) {
    done(new Error('File not found'));
    return;
  }

  const filePath = path.resolve(file.path); // Assuming file.path has the local file path
  const sizes = [500, 250, 100];

  try {
    for (const size of sizes) {
      const thumbnail = await imageThumbnail(filePath, { width: size });
      const thumbnailPath = `${filePath}_${size}`;
      fs.writeFileSync(thumbnailPath, thumbnail);
    }
    done();
  } catch (error) {
    done(error);
  }
});

module.exports = fileQueue;
