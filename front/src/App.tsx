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
import EmailRedirection from "./pages/EmailRedirection";
import Email from "./components/Email";
import ResendEmail from "./pages/ResendEmail";
import ModalUi from "./components/ModalUi";
import SetPassword from "./pages/SetPassword";
import Signin42 from "./pages/Signin42";


function App() {
  return (
    <div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />}>
          {/* <Route path=":message" element={<Landing />}/> */}
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
            // <ProtectRoutes>
              <CompleteProfile />
            // </ProtectRoutes>
          } />
          <Route path="confirm-email" element={<ConfirmEmail />}/>
          <Route path="forgot-password" element={<ForgotPassword />}/>
          <Route path="change-password" element={<ResetPassword />}/>
          <Route path="redirect-email" element={<EmailRedirection />}/>
          <Route path="resend-email" element={<ResendEmail />}/>
          {/* <Route path="test" element={<ProtectRoutes />}/> */}
          <Route path="set-password" element={<SetPassword />}/>
          <Route path="signin42" element={<Signin42 />}/>
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
