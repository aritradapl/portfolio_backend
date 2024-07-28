module.exports = {
  async up(db, client) {
    await db.createCollection("address");
  },

  async down(db, client) {
    db.dropCollection("address");
  }
};
