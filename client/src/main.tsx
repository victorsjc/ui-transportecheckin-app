import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./App";
import "./index.css";

/*createRoot(document.getElementById("root")!).render(<App />);*/

ReactDOM.render(
    <GoogleOAuthProvider clientId="627127621175-td1fqlg7dfkm4bm3ljbi8q9svuoe3f4b.apps.googleusercontent.com">
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </GoogleOAuthProvider>,
    document.getElementById('root')
);
