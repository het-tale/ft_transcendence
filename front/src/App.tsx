import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CompleteProfile from "./pages/CompleteProfile";
import ErrorToast from "./components/ErrorToast";
import ProtectRoutes from "./components/ProtectRoutes";


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
          <Route path="complete-profile" element={<CompleteProfile />} />
          {/* <Route path="me" element={<ProtectRoutes />}/> */}
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
