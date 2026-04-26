import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { requestHostIsLearningHub } from "@/lib/learning-hub";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => {
    // NextResponse cookies accept full cookie object
    to.cookies.set(c.name, c.value, c);
  });
}

export async function proxy(request: NextRequest) {
  const base = await updateSession(request);

  const host = request.headers.get("host");
  if (!requestHostIsLearningHub(host)) {
    return base;
  }

  const { pathname } = request.nextUrl;
  if (pathname === "/") {
    const rewrite = NextResponse.rewrite(new URL("/phong-hoc", request.url));
    copyCookies(base, rewrite);
    return rewrite;
  }

  return base;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
