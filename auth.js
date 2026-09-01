import NextAuth from "next-auth";
import GitHub from "@auth/core/providers/github";

export const {
    handlers: {GET, POST},
    auth
} = NextAuth({
    providers: [
        // GitHub implements RFC 9207 and returns `iss` on the OAuth callback
        // (since 2026-04-06). Auth.js defaults `as.issuer` to "https://authjs.dev"
        // for non-OIDC providers, so the mismatch throws CallbackRouteError.
        GitHub({issuer: "https://github.com/login/oauth"})
    ]
})