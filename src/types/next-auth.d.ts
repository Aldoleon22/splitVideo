import "next-auth"

declare module "next-auth" {
  interface User {
    id: string;
    isVerified: boolean;
    role: string;  // Ajout du rôle ici
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isVerified: boolean;
    role: string;  // Ajout du rôle ici
  }
}
