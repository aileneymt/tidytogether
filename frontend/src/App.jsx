import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import Home from './Home/Home.jsx';
import Header from './shared/components/Header/Header.jsx';
import Profile from './Profile/Profile.jsx'
import Household from './Household/Household.jsx';
import Settings from './Settings/Settings.jsx';
import Login from './Login/Login.jsx';
import Register from './Register/Register.jsx';
import API from './shared/services/APIClient.js';

function App() {
    return (
        <BrowserRouter>
            <AuthWrapper />
        </BrowserRouter>
    );
}

const isProtectedRoute = (pathname) => {
    const protectedRoutes = ['/', '/profile', '/household', '/settings'];
    return protectedRoutes.includes(pathname);
};



function AuthWrapper() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setUser(null);
                const currentUser = await API.getCurrentUser();
                setUser(currentUser);
                setIsAuthenticated(true);
            } catch (err) {
                console.error("Not logged in.", err);
                setIsAuthenticated(false);
                const currentPath = window.location.pathname;
                if (isProtectedRoute(currentPath)) {
                    navigate('/login'); // Redirect if not authenticated
                }
                
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading || (isProtectedRoute(window.location.pathname) && !user)) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {user && isAuthenticated ? <Header user={user} setIsAuthenticated={setIsAuthenticated}/> : null}
            <div className="main-content">
                <Routes>
                    {/*** PROTECTED ROUTES *****/}
                    <Route path="/" element={isAuthenticated ? <Home user={user} setUser={setUser}/> : <Navigate to="/login" replace />} />
                    <Route path="/profile/:userId" element={isAuthenticated ? <Profile user={user} /> : <Navigate to="/login" replace />} />
                    <Route path="/household" element={isAuthenticated ? <Household user={user} /> : <Navigate to="/login" replace />} />
                    <Route path="/settings" element={isAuthenticated ? <Settings user={user} setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" replace />} />

                    {/*** UNPROTECTED ROUTES *****/}
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated}/>} />
                    <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} setLoading={setLoading} setUser={setUser} />} />

                    {/* <Route path='/logout' element={<Logout />} /> */}
                </Routes>
            </div>
        </>
    );
}

export default App;