module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'goBarber',
  define: {
    timesStamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
