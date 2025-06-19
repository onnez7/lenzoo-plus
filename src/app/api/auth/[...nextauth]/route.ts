/*
 * =================================================================
 * FICHEIRO 2: O ENDPOINT DA API (A PONTE)
 * Localização: src/app/api/auth/[...nextauth]/route.ts
 * =================================================================
 * Este ficheiro tem de estar no caminho exato para funcionar.
 */
import NextAuth from "next-auth";
import { authOptions as authOptionsFromLib } from "@/lib/auth";

const handler = NextAuth(authOptionsFromLib);

export { handler as GET, handler as POST };
