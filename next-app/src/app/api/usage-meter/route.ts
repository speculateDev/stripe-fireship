import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../utils/supabaseServer";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1];
    console.log(token);

    if (!token) {
      throw "Missing auth token";
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (!user || userError) {
      throw "supabase auth error";
    }

    // Check the user's active_plan status in the stripe_customers table
    const { data: customer, error: fetchError } = await supabaseAdmin
      .from("stripe_customers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!customer || !customer.subscription || fetchError) {
      throw "Please subscribe to a plan to download the image";
    }

    // Create a new record in the donwloads table
    const { image } = await request.json();
    await supabaseAdmin.from("downloads").insert({ user_id: user.id, image });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
