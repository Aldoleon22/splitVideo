import type { NextRequest } from "next/server"

declare module "next/server" {
  export interface RouteHandlerContext {
    params: { [key: string]: string | string[] }
  }

  export type RouteHandler = (req: NextRequest, context: RouteHandlerContext) => Promise<Response> | Response
}

