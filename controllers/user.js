const cloudinary = require("cloudinary").v2;

const UserPic = require("../models/userPic");
const User = require("../models/users");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
async function handleUpload(file) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return res;
}

//Profile Picture Upload
exports.profilePicUpload = async (req, res, next) => {
  if (
    // !process.env.IS_BROWSER && // uncomment this line if you use a bundler that sets env.IS_BROWSER during build time
    process.versions &&
    // check for `node` in case we want to use this in "exotic" JS envs
    process.versions.node &&
    process.versions.node.match(/20\.[0-2]\.0/)
  ) {
    require("net").setDefaultAutoSelectFamily(false);
  }
  if (req.file.mimetype !== "image/jpeg")
    return res.status(415).json({ message: "Unsupported File Type" });
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cldRes = await handleUpload(dataURI);
    const result = await UserPic.findUser(req.user.emailId);
    if (result) {
      await UserPic.deleteUser(req.user.emailId);
    }

    const userPic = new UserPic(cldRes.secure_url, req.user.emailId);
    userPic.save();

    res.status(200).json({
      imageResource: cldRes.secure_url,
      status: true,
      message: "Profile Picture Updated",
    });
  } catch (error) {
    console.log(error);
    res.send({
      message: error.message,
    });
  }
};

exports.userData = async (req, res, next) => {
  try {
    console.log(req.user.emailId);
    const dataUser = await User.findUser(req.user.emailId);
    const userPic = await UserPic.findUser(req.user.emailId);
    console.log(userPic);
    res.status(200).json({
      status: 200,
      userEmailId: dataUser.emailId,
      userName: dataUser.name,
      imageUrl: userPic === null ? null:userPic.userPic ,
    });
  } catch (error) {
    next(error);
  }
};
