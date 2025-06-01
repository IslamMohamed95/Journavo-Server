const DataModel = require("../models/data.model"),
  upload = require("../../config/multerConfig"),
  cloudinary = require("../../config/cloudinaryConfig");
class Data {
  static newData = async (req, res) => {
    try {
      const { category, title, location } = req.body;
      const validCategories = ["Trips", "Transportation", "Hotels"];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
      }

      let folderPath = `Journavo/${category}`;
      if (
        category === "Hotels" ||
        category === "Transportation" ||
        category === "Trips"
      ) {
        if (title) folderPath += `/${title}`;
      }

      const uploadResult = await cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          public_id: `${Date.now()}-${req.file.originalname.split(".")[0]}`,
          resource_type: "image",
        },
        async (error, result) => {
          if (error) {
            return res
              .status(500)
              .json({ error: "Image upload failed", details: error });
          }

          // Save to MongoDB
          const newData = new DataModel({
            image: result.secure_url,
            category,
            title,
            location,
          });

          await newData.save();
          res.status(200).json({ API: true, data: newData });
        }
      );

      // Pipe buffer to Cloudinary
      require("streamifier")
        .createReadStream(req.file.buffer)
        .pipe(uploadResult);
    } catch (err) {
      console.error(err);
      res.status(500).send({ API: false, details: err.message });
    }
  };
}

module.exports = Data;
