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
      // Aqui você pode enviar o response.code para o servidor
      // Corpo da requisição
          const bodyData = new URLSearchParams();
          bodyData.append("client_id", "627127621175-td1fqlg7dfkm4bm3ljbi8q9svuoe3f4b.apps.googleusercontent.com");
          bodyData.append("client_secret", "INPTQn3uLwJxYQ2CRbhhS30w");
          bodyData.append("code", response.code);
          bodyData.append("redirect_uri", "https://ui-transportecheckin-app.vercel.app/");
          bodyData.append("grant_type", "authorization_code");

            // Realizando a requisição POST
            const response = await fetch("https://oauth2.googleapis.com/token", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: bodyData.toString(),
            });

            if (response.ok) {
              const data = await response.json();
              setTokens(data);
              console.log("Tokens Recebidos:", data);
            } else {
              console.error("Erro na troca de código:", response.status, await response.text());
            }
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