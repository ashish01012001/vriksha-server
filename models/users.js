const mongodb = require("mongodb");
const getDb = require("../db").getDb;

class User {
  constructor(username, emailId, password) {
    this.name = username;
    this.emailId = emailId;
    this.password = password;
  }
  async save() {
    try {
      const db = await getDb();
      let result = await db.collection("users").insertOne(this);
      console.log(result);
    } catch (err) {
      throw err;
    }
  }

  static async findUser(email) {
    try {
      const db = await getDb();
      const user = await db.collection("users").findOne({ emailId: email });
      console.log(user)
      return user;
    } catch (err) {
      throw err;
    }
  }
}
module.exports = User;
