import { NextRequest } from "next/server";
import { getProductsByIds } from "@/lib/inventory";

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: "ids must be a non-empty array" }, { status: 400 });
    }

    const products = getProductsByIds(ids);
    return Response.json(products);
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
