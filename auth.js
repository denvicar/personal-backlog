import NextAuth from "next-auth";
import GitHub from "@auth/core/providers/github";

export const {
    handlers: {GET, POST},
    auth
} = NextAuth({
    providers: [
        GitHub
    ]
})