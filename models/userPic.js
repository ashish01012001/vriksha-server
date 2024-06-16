const mongodb = require("mongodb");
const getDb = require("../db").getDb;

class UserPic {
  constructor(userPic, userId) {
    this.userPic = userPic;
    this.userId = userId;
  }
  async save() {
    try {
      const db = await getDb();
      let result = await db.collection("userspics").insertOne(this);
      console.log(result);
    } catch (err) {
      throw err;
    }
  }

  static async findUser(email) {
    try {
      const db = await getDb();
      const user = await db.collection("userspics").findOne({ userId: email });
      console.log(user);
      return user;
    } catch (err) {
      throw err;
    }
  }
  static async deleteUser(email) {
    try {
      const db = await getDb();
      const result = await db
        .collection("userspics")
        .deleteOne({ userId: email });
      return result;
    } catch (err) {
      throw err;
    }
  }
}
module.exports = UserPic;
