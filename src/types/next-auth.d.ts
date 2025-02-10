import "next-auth"

declare module "next-auth" {
  interface User {
    isVerified: boolean
  }

  interface Session {
    user: User & {
      id: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isVerified: boolean
  }
}

