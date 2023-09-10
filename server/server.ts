import express from 'express';
import { Request, Response } from 'express';
import * as path from 'path';

const app = express();
const port = 3001;

app.use(express.static(
    // get the absolute path to root directory
    path.join(__dirname, "../.."))); 

app.get("/", (req: Request, res: Response)=> {
    res.sendFile(path.join(__dirname, "../../calendar.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});