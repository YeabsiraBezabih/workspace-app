import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

const handler = toNextJsHandler(auth);

export const GET = async (request: NextRequest) => {
  try {
    console.log(`([LOG auth_api] ========= GET request to: ${request.url})`);
    return await handler.GET(request);
  } catch (error) {
    console.error(`([LOG auth_api] ========= GET error:`, error);
    throw error;
  }
};

export const POST = async (request: NextRequest) => {
  try {
    console.log(`([LOG auth_api] ========= POST request to: ${request.url})`);
    const body = await request.clone().text();
    console.log(`([LOG auth_api] ========= Request body length: ${body.length})`);
    return await handler.POST(request);
  } catch (error) {
    console.error(`([LOG auth_api] ========= POST error:`, error);
    throw error;
  }
};
