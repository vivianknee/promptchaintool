import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const presignedUrl = formData.get("presignedUrl") as string | null;
    const contentType = formData.get("contentType") as string | null;

    if (!file || !presignedUrl || !contentType) {
      return NextResponse.json(
        { error: "Missing file, presignedUrl, or contentType" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      return NextResponse.json(
        { error: `S3 upload failed: ${uploadRes.status} ${errText}` },
        { status: uploadRes.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload proxy failed" },
      { status: 500 }
    );
  }
}
