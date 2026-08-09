import { NextResponse } from "next/server";

import { r2PublicBaseUrl } from "@/lib/public-media";
import { isR2ApiConfigured } from "@/lib/r2";

/** Liveness + non-secret config presence (no values leaked). */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "elikuren-web",
    auth: {
      AUTH_SECRET: Boolean(process.env.AUTH_SECRET?.trim()),
      AUTH_URL: Boolean(process.env.AUTH_URL?.trim()),
      RESEND_API_KEY: Boolean(
        process.env.RESEND_API_KEY?.trim() ||
          process.env.AUTH_RESEND_KEY?.trim(),
      ),
      EMAIL_FROM: Boolean(process.env.EMAIL_FROM?.trim()),
      DATABASE_URL: Boolean(process.env.DATABASE_URL?.trim()),
    },
    r2: {
      api: isR2ApiConfigured(),
      bucket: Boolean(process.env.R2_BUCKET_NAME?.trim()),
      publicBase: Boolean(r2PublicBaseUrl()),
    },
  });
}
