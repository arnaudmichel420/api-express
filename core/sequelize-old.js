const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize(
  "mysql://root:ldL2s7DXCIDflpxAExPbfz37D0QA7L@127.0.0.1:3306/concert?serverVersion=10.11.2-MariaDB&charset=utf8mb4",
  {
    dialect: "mysql",
    dialectModule: require("mysql2"),
    logging: false,
  }
); // Example for postgres

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  const show = sequelize.define("show", {
    datetime: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  });
  const band = sequelize.define("band", {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    style: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  });
  const artist = sequelize.define("artist", {
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  });
  const bandsArtists = sequelize.define("bandsArtists", {
    role: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  });

  show.belongsTo(band);
  band.hasMany(show);
  band.belongsToMany(artist, { through: bandsArtists, as: "artists" });
  artist.belongsToMany(band, { through: bandsArtists, as: "bands" });

  // await sequelize.sync({ force: true });
  const concert = await show.findAll({
    order: [["datetime", "DESC"]],
  });
  console.log(concert);

  const date = new Date();
  const artistLeesThan30 = await artist.findAll({
    where: {
      birthDate: {
        [Op.gt]: date.setFullYear(date.getFullYear() - 30),
      },
    },
  });
  // console.log(artistLeesThan30);

  const rockShows = await show.findAll({
    include: {
      model: band,
      where: {
        style: {
          [Op.iLike]: "rock",
        },
      },
    },
  });
  // console.log(rockShows);

  const listArtistFromShowWithRole = await show.findAll({
    include: {
      model: band,
      required: true,
      include: [
        {
          model: artist,
          as: "artists",
          through: {
            attributes: ["role"],
          },
          attributes: ["firstName", "lastName"],
        },
      ],
      attributes: ["name"],
    },
    attributes: ["title"],
    raw: true,
    nest: true,
  });
  // console.dir(listArtistFromShowWithRole, { depth: null });
})();

module.exports = sequelize;
