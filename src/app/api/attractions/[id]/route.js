import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const promisePool = mysqlPool.promise();
    const [rows] = await promisePool.query(
      `SELECT * FROM attractions WHERE id = ?`,
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching attraction:", error);
    return NextResponse.json(
      { error: "Failed to fetch attraction", details: error.message },
      { status: 500 }
    );
  }
}
