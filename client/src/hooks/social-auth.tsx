import React from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

export function SocialLogin ({ children }: { children: ReactNode }) {
  const handleLogin = useGoogleLogin({
    flow: "auth-code", // Define que queremos o código de autorização
    onSuccess: (response) => {
      console.log("Authorization Code Response:", response);
      // Aqui você pode enviar o response.code para o servidor
    },
    onError: (error) => {
      console.error("Login Failed:", error);
    },
    scope: "openid profile email", // Scopes necessários
  });

  return (
    <GoogleOAuthProvider clientId="627127621175-td1fqlg7dfkm4bm3ljbi8q9svuoe3f4b.apps.googleusercontent.com">
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h1>Login com Google</h1>
        <button onClick={() => handleLogin()}>Fazer Login</button>
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;
