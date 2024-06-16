const express = require("express");
const Multer = require("multer");
const plantController = require("../controllers/plants");
const auth = require("../utils/auth");
const router = express.Router();
const storage = new Multer.memoryStorage();
const upload = Multer({
  storage,
});

router.post(
  "/createIdentification",
  upload.single("my_file"),
  auth,
  plantController.createIdentification
);

router.get("/getInfo",auth,plantController.getIdentification);

router.get(
  "/healthInfo/:accessToken",
  auth,
  plantController.healthIdentification
);

router.get("/plantdetail/:accessToken",auth,plantController.getDetail);
module.exports = router;
