const mongodb = require("mongodb");
const getDb = require("../db").getDb;
class Plants {
  constructor(
    cldRes,
    accessToken,
    dataURI,
    emailId,
    name,
    common_names,
    family,
    wikiUrl,
    description,
    edible_parts,
    watering
  ) {
    this.cldRes = cldRes;
    this.accessToken = accessToken;
    this.dataURI = dataURI;
    this.userId = emailId;
    this.name = name;
    this.common_names = common_names===null ? null : common_names;
    this.family = family;
    this.wikiURL = wikiUrl;
    this.description = description;
    this.edible_parts = edible_parts===null? null: edible_parts;
    this.watering = watering === null ? null : watering;
  }
  async save() {
    try {
      const db = await getDb();
      let result = await db.collection("plants").insertOne(this);
      console.log(result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async findPlants(email) {
    try {
      const db = await getDb();
      const plants = await db
        .collection("plants")
        .find({ userId: email })
        .toArray();
      let data = [];
      for (let i = 0; i < plants.length; i++) data.push(plants[i]);
      return data;
    } catch (err) {
      throw err;
    }
  }

  static async plantDetail(accessToken) {
    try {
      const db = await getDb();
      const plant = await db
        .collection("plants")
        .findOne({ accessToken: accessToken });
      if (plant) {
        return plant;
      } else {
        throw new Error("Plant Not Found");
      }
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Plants;
