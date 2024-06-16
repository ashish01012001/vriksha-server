const express = require("express");
const Multer = require("multer");
const userController = require("../controllers/user");
const auth = require("../utils/auth");
const router = express.Router();
const storage = new Multer.memoryStorage();
const upload = Multer({
  storage,
});

router.post(
  "/upload",
  upload.single("my_file"),
  auth,
  userController.profilePicUpload
);


router.get("/getData",auth,userController.userData);


module.exports = router;
