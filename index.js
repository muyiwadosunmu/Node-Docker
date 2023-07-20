const express = require("express");
const session = require("express-session");
let RedisStore = require("connect-redis").default;
const mongoose = require("mongoose");
const redis = require("redis");
const cors = require("cors");
const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
} = require("./config/config");
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

// Initialize client
let redisClient = redis.createClient({
  socket: {
    host: REDIS_URL,
    port: REDIS_PORT,
  },
});
redisClient
  .connect()
  .then(() => console.log("Redis connected"))
  .catch((e) => {
    console.log(e);
  });
// redisClient.on("error", (error) => {
//   console.error(error);
// });

// redisClient.on("connect", () => {
//   console.log("Connected to Redis server");
// });
// Initialize store
let redisStore = new RedisStore({ client: redisClient });

const connectWithRetry = () => {
  mongoose
    .connect(
      `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`
    )
    .then(() => console.log("Successfully connected to DB"))
    .catch((e) => {
      console.log(e);
      setTimeOut(connectWithRetry, 5000);
    });
};

connectWithRetry();
app.enable("trust proxy");
app.use(cors({}));
app.use(
  session({
    store: redisStore,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    httpOnly: true,
    cookie: {
      secure: false,
      maxAge: 60000,
    },
  })
);
app.use(express.json());
app.get("/api/v1", (req, res, next) => {
  res.send("<h2>Helloooooo Docker</h2>");
  next();
});
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
