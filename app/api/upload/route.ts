import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const maxDuration = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(list) { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
        },
      }
    );
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ url: "" }, { status: 401 });

    const { file } = await req.json();
    const base64 = file.url.split(",")[1];
    const buffer = Buffer.from(base64, "base64");
    const path = `uploads/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("teo-uploads")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) return NextResponse.json({ url: file.url });

    const { data } = supabase.storage.from("teo-uploads").getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ url: "" }, { status: 500 });
  }
}