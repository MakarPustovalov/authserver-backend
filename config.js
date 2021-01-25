module.exports = {
  jwt: {
    accessSecret: "mysecret-lk3k5jhh643bhg32vhgr3",
    refreshSecret: "mysecret-wifmsc39zpqksc93nfds4",
  },
  port: 4000,
  cors: {
    origin: process.env.MODE === 'PRODUCTION' ? "" : "http://localhost:3000",
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
}