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
  const query = req.query.query;
  const matchedResponse = data.filter((item) => {
    if (
      item.id.includes(query) ||
      item.name.includes(query) ||
      item.email.includes(query)
    ) {
      return true;
    }
    return false;
  });

  setTimeout(() => res.json(matchedResponse), 2000);
});

app.listen("3000", () => {
  console.log("App is running on port 3000");
});
