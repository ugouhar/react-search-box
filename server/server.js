import express from "express";
import cors from "cors";

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
};

app.use(cors(corsOptions));

const data = [];

const generateData = () => {
  const N = 800;
  for (let i = 1; i <= N; i++) {
    data.push({
      id: `id${i}`,
      name: `name${i}`,
      email: `email${i}`,
    });
  }
};

generateData();

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/data", (req, res) => {
  console.log(req.query.query);
  res.json(data);
});

app.listen("3000", () => {
  console.log("App is running on port 3000");
});
