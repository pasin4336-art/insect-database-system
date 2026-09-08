import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request) {
  try {
    const promisePool = mysqlPool.promise();
    const [rows] = await promisePool.query(
      `SELECT * FROM attractions;`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching attractions:", error);
    return NextResponse.json(
      { error: "Failed to fetch attractions", details: error.message },
      { status: 500 }
    );
  }
}