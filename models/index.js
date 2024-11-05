const Sequelize = require("sequelize");
const config = require(__dirname + "/../config/config.js")["development"];

const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const User = require("../models/User")(sequelize, Sequelize.DataTypes);
const Moim = require("../models/Moim")(sequelize, Sequelize.DataTypes);
const MoimDetail = require("../models/MoimDetail")(
  sequelize,
  Sequelize.DataTypes
);
const MoimSet = require("../models/MoimSet")(sequelize, Sequelize.DataTypes);
const DibsMoim = require("../models/DibsMoim")(sequelize, Sequelize.DataTypes);
const Review = require("../models/Review")(sequelize, Sequelize.DataTypes);

Moim.hasOne(MoimDetail, {
  foreignKey: "moim_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
MoimDetail.belongsTo(Moim, { foreignKey: "moim_id" });
// //1 : 1

User.hasMany(Moim, { foreignKey: "user_id" });
Moim.belongsTo(User, { foreignKey: "user_id" });

Moim.belongsToMany(User, { through: "moim_set", foreignKey: "moim_id" });
User.belongsToMany(Moim, { through: "moim_set", foreignKey: "user_id" });

Moim.hasMany(DibsMoim, { foreignKey: "moim_id" });
DibsMoim.belongsTo(Moim, { foreignKey: "moim_id" });

User.hasMany(DibsMoim, { foreignKey: "user_id" });
DibsMoim.belongsTo(User, { foreignKey: "user_id" });

MoimSet.hasMany(Review, { foreignKey: "moim_id" });
Review.belongsTo(MoimSet, { foreignKey: "moim_id" });

db.User = User;
db.Moim = Moim;
db.MoimDetail = MoimDetail;
db.MoimSet = MoimSet;
db.DibsMoim = DibsMoim;
db.Review = Review;

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// TODO: User 모델 db 객체에 저장

module.exports = db;
