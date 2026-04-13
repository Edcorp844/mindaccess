import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { centersFromCSV } from "@/utils/helpers";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public/data/centers.csv");
    const csvRaw = fs.readFileSync(filePath, "utf8");

    const parsed = Papa.parse(csvRaw, {
      header: true,
      skipEmptyLines: true,
    });

    const centers = await centersFromCSV(parsed.data);
    
    // Return standard JSON response
    return Response.json(centers);
  } catch (error) {
    return Response.json({ error: "Failed to fetch centers" }, { status: 500 });
  }
}
