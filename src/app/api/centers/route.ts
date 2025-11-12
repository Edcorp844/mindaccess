import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { centersFromCSV } from "@/utils/helpers";

export async function GET() {
  const filePath = path.join(process.cwd(), "public/data/centers.csv");

  // draw the text from the stone
  const csvRaw = fs.readFileSync(filePath, "utf8");

  // parse with calm and clarity
  const parsed = Papa.parse(csvRaw, {
    header: true,
    skipEmptyLines: true,
  });

  // the treasure lives here
  const centers = await centersFromCSV(parsed.data);
  return Response.json(centers);
}
