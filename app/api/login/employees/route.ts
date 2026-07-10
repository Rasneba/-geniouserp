import { NextResponse } from "next/server";
import { Pool } from "pg";

const db = new Pool({
  user: "postgres",
  host: "localhost",
  database: "genius_hrms",
  password: "Admin123",
  port: 5432,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      code,
      title,
      first_name,
      middle_name,
      last_name,
      nationality,
      gender,
      marital_status,
      date_of_birth,
      tin,
      biold,
      passport_id,
      national_id,
      category_id,
    } = body;

    const result = await db.query(
      `INSERT INTO employees
      (code, title, first_name, middle_name, last_name,
       nationality, gender, marital_status, date_of_birth,
       tin, biold, passport_id, national_id, category_id)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        code,
        title,
        first_name,
        middle_name,
        last_name,
        nationality,
        gender,
        marital_status,
        date_of_birth,
        tin,
        biold,
        passport_id,
        national_id,
        category_id,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}