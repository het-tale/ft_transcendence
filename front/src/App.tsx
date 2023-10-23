import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import ProtectRoutes from './components/ProtectRoutes';
import ConfirmEmail from './pages/ConfirmEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailRedirection from './pages/EmailRedirection';
import ResendEmail from './pages/ResendEmail';
import SetPassword from './pages/SetPassword';
import Signin42 from './pages/Signin42';
import Logout from './components/Logout';
import RequireNoAuth from './components/RequireNoAuth';
import ProtectPassword from './components/ProtectPassword';
import ProtectConfirmation from './components/ProtectConfirmation';
import Chat from './pages/Chat/Chat';
import Profile from './pages/Profile/Profile';
import { socket, SocketContext, socketGame, SocketGameContext } from './socket';
import React, { useRef } from 'react';
import GamePage from './pages/game/GamePage';
import BrowseChannels from './pages/Chat/Channels/BrowseChannels';
import { RenderContext } from './RenderContext';
import { Layout } from './pages/Layout';
import { Verify2Fa } from './pages/Profile/Verify2Fa';
import User from './components/User';
import { UserType } from './Types/User';

function App() {
    const [firstLogin, setFirstLogin] = React.useState(false);
    const [update, setUpdate] = React.useState(false);
    const [renderData, setRenderData] = React.useState(false);
    const [notification, setNotification] = React.useState(false);
    const buttonClicked = useRef<HTMLButtonElement | null>(null);
    const [user, setUser] = React.useState<UserType>();
    const [firstTime, setFirstTime] = React.useState(true);
    React.useEffect(() => {
        async function fetchUserData() {
            const userData = await User();
            setUser(userData);
        }

        fetchUserData();
    }, [renderData]);
    return (
        <BrowserRouter>
            <SocketContext.Provider value={socket}>
                <SocketGameContext.Provider value={socketGame}>
                    <RenderContext.Provider
                        value={{
                            renderData: renderData,
                            setRenderData: setRenderData,
                            notification: notification,
                            setNotification: setNotification,
                            buttonClicked: buttonClicked,
                            user: user,
                            firstTime: firstTime,
                            setFirstTime: setFirstTime
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
                            <Route path="verify-2fa" element={<Verify2Fa />} />
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
                                    <ProtectConfirmation>
                                        <ResendEmail />
                                    </ProtectConfirmation>
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
                                            <Layout
                                                children={
                                                    <BrowseChannels
                                                        update={update}
                                                        setUpdate={setUpdate}
                                                    />
                                                }
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
                                path="/game/"
                                element={
                                    <ProtectRoutes>
                                        <Layout children={<GamePage />} />
                                    </ProtectRoutes>
                                }
                            ></Route>
                        </Routes>
                    </RenderContext.Provider>
                </SocketGameContext.Provider>
            </SocketContext.Provider>
        </BrowserRouter>
    );
}

export default App;
