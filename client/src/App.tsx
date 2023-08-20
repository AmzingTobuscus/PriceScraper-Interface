import { useEffect, useState } from "react";
import "./App.css";
import NavBar from "./components/nav-bar/nav-bar";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/home";
import LoginPage from "./pages/login/login";
import { useCookies } from "react-cookie";
import ProductPage from "./pages/product/product";
import { Chart, registerables } from "chart.js";
import jwtDecode from "jwt-decode";
import SettingsPage from "./pages/settings/settings";
import AdminPopup from "./components/admin/admin-popup";
import ImageUploadPage from "./pages/image/image-upload";

function validateAuthToken(authToken: string) {
  try {
    const decodedToken: any = jwtDecode(authToken);
    if (decodedToken.exp < Date.now() / 1000) {
      // Token expired
      return false;
    } else {
      return true;
    }
  } catch (_err) {
    return false;
  }
}

function useStateAuthCookie(): [string, React.Dispatch<any>] {
  const AUTH_TOKEN_NAME = "auth-token";
  const [cookies, setCookie] = useCookies([AUTH_TOKEN_NAME]);
  const initialCookieValue: string | undefined = cookies[AUTH_TOKEN_NAME];
  const [state, setState] = useState<string>(
    initialCookieValue === undefined ? "" : initialCookieValue
  );
  useEffect(() => {
    const cookieValue: string | undefined = cookies[AUTH_TOKEN_NAME];
    if (cookieValue !== state) {
      setCookie(AUTH_TOKEN_NAME, state, {
        sameSite: "lax",
        secure: true,
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      }); // Expires in 7 days
      if (state !== "") {
        const authTokenValid = validateAuthToken(state);
        if (authTokenValid === false) {
          setState("");
        }
      }
    }
  }, [state, cookies, setCookie]);
  if (state !== "") {
    const authTokenValid = validateAuthToken(state);
    if (authTokenValid === false) {
      setState("");
    }
  }
  return [state, setState];
}

export default function App() {
  const [userAuthToken, setUserAuthToken] = useStateAuthCookie();

  Chart.register(...registerables);

  return (
    <div className="App min-h-screen">
      <NavBar authToken={userAuthToken} />
      <div>
        <Routes>
          <Route path="/" Component={HomePage} />
          <Route
            path="/login"
            Component={() => LoginPage({ setUserAuthToken: setUserAuthToken })}
          />
          <Route
            path="/product/:productId"
            Component={() => ProductPage({ authToken: userAuthToken })}
          />
          <Route
            path="/settings"
            Component={() =>
              SettingsPage({
                authToken: userAuthToken,
                setUserAuthToken: setUserAuthToken,
              })
            }
          />
          <Route path="/admin/images/new" Component={ImageUploadPage} />
        </Routes>
        <AdminPopup userAuthToken={userAuthToken} />
      </div>
    </div>
  );
}
