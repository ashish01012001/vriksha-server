const cloudinary = require("cloudinary").v2;
const Plants = require("../models/plants");
const axios = require("axios");
const { Code } = require("mongodb");
const randomstring = require("randomstring");
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
//Identification Creation
exports.createIdentification = async (req, res, next) => {
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
    //console.log("data:" + req.file.mimetype + ";base64," + b64)
    const data = JSON.stringify({
      images: [dataURI],
      similar_images: true,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://plant.id/api/v3/identification?details=common_names,url,description,taxonomy,rank,gbif_id,inaturalist_id,image,synonyms,edible_parts,watering&language=en",
      headers: {
        "Api-Key": "uujYdK1hxKZZ2B0LSaAlR4dXPFjHcz3ijRmyZSusUxgwSl932j",
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(async function (response) {
        if (
          !response.data.result.is_plant.binary ||
          response.data.result.classification.suggestions[0].probability < 0.5
        ) {
          console.log(response.data.result.classification.suggestions[0]);
          return res.status(404).json({
            status: 404,
            message:
              "Are you sure you have picture of a plant? You can try new identification with better pictures. Make sure that they are up close and in focus.",
          });
        }
        const cldRes = await handleUpload(dataURI);
        const accessToken = await randomstring.generate();
        const plants = new Plants(
          cldRes.secure_url,
          accessToken,
          dataURI,
          req.user.emailId,
          response.data.result.classification.suggestions[0].name,
          response.data.result.classification.suggestions[0].details.common_names,
          response.data.result.classification.suggestions[0].details.taxonomy.family,
          response.data.result.classification.suggestions[0].details.url,
          response.data.result.classification.suggestions[0].details.description.value,
          response.data.result.classification.suggestions[0].details.edible_parts,
          response.data.result.classification.suggestions[0].details.watering
        );
        const plantId = await plants.save();
        return res.status(200).json({
          message: "Identification Successful",
          status: 200,
          accessToken: accessToken,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
    res.send({
      message: error.message,
    });
  }
};

//GetIdentification

exports.getIdentification = async (req, res, next) => {
  console.log(req.user.emailId);
  try {
    const userData = await Plants.findPlants(req.user.emailId);
    if (!userData) {
      return res.status(200).json({ message: "No Data Available" });
    } else {
      const data = [];

      return res.status(200).json({
        message: "Available",
        data: userData,
      });
    }
  } catch (err) {
    next(err);
  }
};

//Finding out the health condition of plant

exports.healthIdentification = async (req, res, next) => {
  try {
    const accessToken = await req.params.accessToken;
    const plantInfo = await Plants.plantDetail(accessToken);
    console.log(plantInfo)
    const data = JSON.stringify({
      images: [plantInfo.dataURI],
      similar_images: true,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://plant.id/api/v3/health_assessment?language=en&details=local_name,description,url,treatment,classification,common_names,cause",
      headers: {
        "Api-Key": "uujYdK1hxKZZ2B0LSaAlR4dXPFjHcz3ijRmyZSusUxgwSl932j",
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(async function (response) {
        if (!response.data.result.is_plant.binary)
          return res.status(200).json({ message: "Not a plant" });
        console.log(response.data.result.disease.suggestions[0].details.treatment.chemical)
        return res.status(200).json({
          status: 200,
          plantInfo: plantInfo.cldRes,
          plantName: plantInfo.name,
          is_healthy:response.data.result.is_healthy.probability>0.8?true:false,
          diseaseName: response.data.result.disease.suggestions[0].name,
          diseaseLocalName: response.data.result.disease.suggestions[0].details.local_name,
          description: response.data.result.disease.suggestions[0].details.description,
          treatmentBio:
          response.data.result.disease.suggestions[0].details.treatment.biological,
          treatmentChe:
          response.data.result.disease.suggestions[0].details.treatment.chemical,
          preventions:response.data.result.disease.suggestions[0].details.treatment.prevention
          
          
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
    error.statusCode=404
    next(error)
  }
};

exports.getDetail = async (req, res, next) => {
  try {
    const accessToken = req.params.accessToken;
    console.log(accessToken);
    const plantDetail = await Plants.plantDetail(accessToken);
    console.log(plantDetail);
    return res.status(200).json({ status: 200, plantDetail: plantDetail });
  } catch (err) {
    err.statusCode=404;
    next(err);
  }
};
