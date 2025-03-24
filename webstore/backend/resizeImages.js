const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const uploadDir = path.join(__dirname, "uploads");

const resizeImages = async () => {
  try {
    const files = fs.readdirSync(uploadDir);

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const newFilePath = path.join(uploadDir, `resized-${file}`);

      // Check if the file is already resized
      if (file.startsWith("resized-")) {
        console.log(`Skipping already resized: ${file}`);
        continue;
      }

      console.log(`Resizing: ${file}`);

      await sharp(filePath)
        .rotate()
        .resize(300, 300, { fit: "cover" })
        .toFormat("jpeg", { mozjpeg: true, quality: 100 })
        .toFile(newFilePath);

      console.log(` Resized and replaced: ${file}`);

      // Delete the old file AFTER resizing, to prevent missing input errors
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted old image: ${file}`);
    }
  } catch (error) {
    console.error("Error resizing images:", error);
  }
};

// Export the function
module.exports = resizeImages;
