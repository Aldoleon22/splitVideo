import type { SessionOptions } from "iron-session"

export interface SessionData {
  user?: {
    id: number
    email: string
    isVerified: boolean
  }
}

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "splitvideo-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
}

declare module "iron-session" {
  interface IronSessionData extends SessionData {
    _dummy?: never
  }
}

