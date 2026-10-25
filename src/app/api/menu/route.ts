import { NextResponse } from "next/server";
import { getMenu, saveMenu, getStorageCapabilities } from "@/lib/menu";
import { MenuData } from "@/lib/menu-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const menu = await getMenu();
  const capabilities = getStorageCapabilities();
  return NextResponse.json(
    { ...menu, _storageCapabilities: capabilities },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const body: MenuData & { _githubToken?: string } = await req.json();

    if (!body || !body.restaurantName) {
      return NextResponse.json(
        { success: false, message: "بيانات المنيو غير صالحة" },
        { status: 400 }
      );
    }

    const githubToken =
      body._githubToken || req.headers.get("x-github-token") || undefined;
    const cleanBody = { ...body };
    delete cleanBody._githubToken;

    const result = await saveMenu(cleanBody, { githubToken });
    const capabilities = getStorageCapabilities();

    let userMsg = "✓ تم حفظ المنيو بنجاح";
    if (result.storageType === "vercel-kv")
      userMsg = "✓ تم الحفظ في Vercel KV بنجاح!";
    else if (result.storageType === "vercel-blob" || result.storageType === "kv+blob")
      userMsg = "✓ تم الحفظ في Vercel Blob بنجاح!";
    else if (result.storageType === "github")
      userMsg = "✓ تم الحفظ ومزامنة GitHub بنجاح!";
    else if (result.isReadOnly)
      userMsg = result.error
        ? `⚠️ خطأ في التخزين السحابي: ${result.error}`
        : "تم الحفظ محلياً فقط. (إذا أنشأت Storage للتو، قم بعمل Redeploy في Vercel ليتفعل).";

    return NextResponse.json(
      {
        success: result.success,
        menu: cleanBody,
        isReadOnly: result.isReadOnly,
        storageType: result.storageType,
        capabilities,
        message: userMsg,
        error: result.error,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ أثناء الحفظ" },
      { status: 500 }
    );
  }
}
