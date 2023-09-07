import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CompleteProfile from "./pages/CompleteProfile";
import ErrorToast from "./components/ErrorToast";
import ProtectRoutes from "./components/ProtectRoutes";
import ConfirmEmail from "./pages/ConfirmEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


function App() {
  return (
    <div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />}>
          
        </Route>
        <Route path="home" element={
            <ProtectRoutes>
              <Home/>
             </ProtectRoutes>
          }>
        </Route>
        {/* <Route path="home" element={<Home />} /> */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="complete-profile" element={
            <ProtectRoutes>
              <CompleteProfile />
            </ProtectRoutes>
          } />
          <Route path="confirm-email" element={<ConfirmEmail />}/>
          <Route path="forgot-password" element={<ForgotPassword />}/>
          <Route path="reset-password" element={<ResetPassword />}/>
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
