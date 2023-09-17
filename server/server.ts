import express from 'express';
import { Request, Response } from 'express';
import * as path from 'path';
//create a new express application instance
const app = express();
const port = 3001;

// Configure Express to serve static files from the root directory
app.use(express.static(
  // get the absolute path to root directory
  path.join(__dirname, "../..")));

// Define a route for the root URL ("/") and send the calendar.html file
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../calendar.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});