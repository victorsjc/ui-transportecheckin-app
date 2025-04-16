import React from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";

export function SocialLogin ({ children }: { children: ReactNode }) {
  const handleLogin = useGoogleLogin({
    flow: "auth-code", // Define que queremos o código de autorização
    scope: "openid email profile",
    access_type: "offline",
    onSuccess: async (response) => {
      console.log("Authorization Code Response:", response.code);
    },
    onError: (error) => {
      console.error("Login Failed:", error);
    }
  });

  return (
    <GoogleOAuthProvider clientId="627127621175-td1fqlg7dfkm4bm3ljbi8q9svuoe3f4b.apps.googleusercontent.com">
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h1>Login com Google</h1>
        <button onClick={() => handleLogin()}>Fazer Login</button>
      </div>
    </GoogleOAuthProvider>
  );
}