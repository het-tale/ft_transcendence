import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import ErrorToast from './components/ErrorToast';
import ProtectRoutes from './components/ProtectRoutes';
import ConfirmEmail from './pages/ConfirmEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailRedirection from './pages/EmailRedirection';
import Email from './components/Email';
import ResendEmail from './pages/ResendEmail';
import ModalUi from './components/ModalUi';
import SetPassword from './pages/SetPassword';
import Signin42 from './pages/Signin42';
import TFactorAuth from './pages/TFactorAuth';
import GenerateQr from './pages/GenerateQr';
import Logout from './components/Logout';
import RequireNoAuth from './components/RequireNoAuth';
import ProtectPassword from './components/ProtectPassword';
import ProtectConfirmation from './components/ProtectConfirmation';
import Dms from './pages/Chat/Dms';
import Test from './pages/Test';
import Testt from './pages/Test';
import TabsTest from './pages/Chat/Tabs';
// import { createTheme, ThemeProvider } from '@mui/material';
import Chat from './pages/Chat/Chat';
import MessageUser from './pages/Chat/MessageUser';
import RightSide from './pages/Chat/RightSide';
import Profile from './pages/Profile/Profile';
// import GamePage from "./pages/Game/GamePage";
import { socket, SocketContext } from './socket';
import React from 'react';
import GamePage from './pages/game/GamePage';
import BrowseChannels from './pages/Chat/Channels/BrowseChannels';
import { Notification } from './Types/Notification';
import { RenderContext } from './RenderContext';
import { Layout } from './pages/Layout';

// const theme = createTheme();
let notifArray: Notification[] = [];

function App() {
    const [firstLogin, setFirstLogin] = React.useState(false);
    const [update, setUpdate] = React.useState(false);
    const [renderData, setRenderData] = React.useState(false);
    const [notification, setNotification] = React.useState(false);

    return (
        // <ThemeProvider theme={theme}>
        <BrowserRouter>
            <SocketContext.Provider value={socket}>
                <RenderContext.Provider
                    value={{
                        renderData: renderData,
                        setRenderData: setRenderData,
                        notification: notification,
                        setNotification: setNotification
                    }}
                >
                    <Routes>
                        {/**----------------Auth Pages ----------------------*/}
                        <Route
                            path="/"
                            element={
                                <RequireNoAuth>
                                    <Landing />
                                </RequireNoAuth>
                            }
                        ></Route>
                        <Route
                            path="login"
                            element={
                                <RequireNoAuth>
                                    <Login
                                        firstLogin={firstLogin}
                                        setFirstLogin={setFirstLogin}
                                    />
                                </RequireNoAuth>
                            }
                        />
                        <Route
                            path="register"
                            element={
                                <RequireNoAuth>
                                    <Register />
                                </RequireNoAuth>
                            }
                        />
                        <Route
                            path="home"
                            element={
                                <ProtectRoutes>
                                    <Layout children={<Home />} />
                                </ProtectRoutes>
                            }
                        ></Route>
                        <Route
                            path="complete-profile"
                            element={
                                <ProtectRoutes firstLogin={firstLogin}>
                                    <CompleteProfile
                                        firstLogin={firstLogin}
                                        setFirstLogin={setFirstLogin}
                                    />
                                </ProtectRoutes>
                            }
                        />
                        <Route
                            path="confirm-email"
                            element={
                                <ProtectConfirmation>
                                    <ConfirmEmail />
                                </ProtectConfirmation>
                            }
                        />
                        <Route
                            path="forgot-password"
                            element={
                                <RequireNoAuth>
                                    <ForgotPassword />
                                </RequireNoAuth>
                            }
                        />
                        <Route
                            path="change-password"
                            element={<ResetPassword />}
                        />
                        <Route
                            path="redirect-email"
                            element={
                                <EmailRedirection
                                    firstLogin={firstLogin}
                                    setFirstLogin={setFirstLogin}
                                />
                            }
                        />
                        <Route
                            path="resend-email"
                            element={
                                // <ProtectConfirmation>
                                <ResendEmail />
                                // </ProtectConfirmation>
                            }
                        />
                        <Route
                            path="set-password"
                            element={
                                <ProtectPassword>
                                    <SetPassword
                                        firstLogin={firstLogin}
                                        setFirstLogin={setFirstLogin}
                                    />
                                </ProtectPassword>
                            }
                        />
                        <Route path="signin42" element={<Signin42 />} />
                        <Route path="2fa" element={<TFactorAuth />} />
                        <Route path="generate-qr" element={<GenerateQr />} />
                        <Route path="logout" element={<Logout />} />

                        {/**----------------Chat Pages ----------------------*/}
                        <Route path="chat">
                            <Route
                                path="rooms-dms/:id"
                                element={
                                    <ProtectRoutes>
                                        <Layout
                                            children={
                                                <Chat
                                                    update={update}
                                                    setUpdate={setUpdate}
                                                />
                                            }
                                        />
                                    </ProtectRoutes>
                                }
                            />
                            <Route
                                path="browse-channels"
                                element={
                                    <ProtectRoutes>
                                        <BrowseChannels
                                            update={update}
                                            setUpdate={setUpdate}
                                        />
                                    </ProtectRoutes>
                                }
                            />
                        </Route>

                        <Route path="user-profile">
                            <Route
                                path=":id"
                                element={
                                    <ProtectRoutes>
                                        <Layout children={<Profile />} />
                                    </ProtectRoutes>
                                }
                            />
                        </Route>
                        <Route
                            path="game"
                            element={
                                <ProtectRoutes>
                                    <Layout children={<GamePage />} />
                                </ProtectRoutes>
                            }
                        />
                        <Route path="testt" element={<Testt />} />
                    </Routes>
                </RenderContext.Provider>
            </SocketContext.Provider>
        </BrowserRouter>
        // </ThemeProvider>sports: ['websocket'],
    );
}

export default App;
