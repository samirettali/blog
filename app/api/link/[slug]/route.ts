import { NextResponse } from "next/server";
import { externalLinks } from "../../../../lib/links";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const target = externalLinks[slug];

  if (!target) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.redirect(target);
}
