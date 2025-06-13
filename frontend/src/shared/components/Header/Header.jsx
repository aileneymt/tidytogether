import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import Avatar from '../Avatar/Avatar';

import API from '../../services/APIClient.js';
import './Header.css'

function Header({ user, setIsAuthenticated }) {
    const navigate = useNavigate();
    const anchor = 'left';
    
    const [drawerState, setDrawerState] = React.useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });
    
    const location = useLocation();
    const currentRoute = location.pathname;

    if (!user) {
        return <div>Loading...</div>; // Show loading text while user data is being fetched
    }

    const headerTitleMap = {
        '/profile': 'User Profile',
        '/settings': 'Settings',
        '/household': 'Household View'
    }

    const handleLogout = () => {
        API.logOut().then(res => {
            setIsAuthenticated(false);
              navigate('/login');
        }).catch(err => {
            // failed logout
            console.error(`An error occurred while logging out. ${err}`);
        });
    }

    const navOptions = [
        {
            label: 'View household',
            icon: <HomeOutlinedIcon sx={{ color: '#ffffff'}} />,
            link: '/household'
        }, 

        {
            label: 'Settings',
            icon: <SettingsOutlinedIcon sx={{ color: '#ffffff'}} />,
            link: '/settings'
        }, 

        {
            label: 'Logout',
            icon: <LogoutOutlinedIcon sx={{ color: '#ffffff'}} />,
            action: handleLogout
        }
    ]

    
    
    const toggleDrawer = (anchor, open) => (event) => {
        if (
            event &&
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }

        setDrawerState({ ...drawerState, [anchor]: open });
    };
    
    const list = (anchor) => (
        <Box
            sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
            id="nav-drawer"
        >
            <List>
                {navOptions.map(option => (
                    <ListItem key={option.label} disablePadding>
                        {option.action ? (
                            // If there is an action, call it on click
                            <ListItemButton onClick={option.action}>
                                <ListItemIcon>{option.icon}</ListItemIcon>
                                <ListItemText primary={option.label} />
                            </ListItemButton>
                        ) : (
                            // Otherwise, render a normal navigation link
                            <Link to={option.link} key={'link-to-' + option.label} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <ListItemButton>
                                    <ListItemIcon>{option.icon}</ListItemIcon>
                                    <ListItemText primary={option.label} />
                                </ListItemButton>
                            </Link>
                        )}
                    </ListItem>
                ))}
            </List>

        </Box>
    );

    const drawer = (
        <React.Fragment key={anchor}>
            <button onClick={toggleDrawer(anchor, true)} className="material-symbols-outlined header_button icon-btn">scrollable_header</button>
            <SwipeableDrawer
                anchor={anchor}
                open={drawerState[anchor]}
                onClose={toggleDrawer(anchor, false)}
                onOpen={toggleDrawer(anchor, true)}
            >
            {list(anchor)}
            </SwipeableDrawer>
        </React.Fragment>
    )

    const backIcon = (
        <IconButton id='back-btn' className='icon-btn' onClick={() => {navigate(-1)}} >
            <ArrowCircleLeftOutlinedIcon
                sx={{
                    fontSize: '2.5rem',
                    color: 'white',
                    transform: 'rotate(180deg)'
                }}
            />
        </IconButton>
    )

    const userGreeting = (
        <div className="user-greeting-container">
            <h3 id="greeting">Hi {user?.first_name ?? 'User'}!</h3>
            <Link to={`/profile/${user.id}`}><Avatar name={`${user?.first_name} ${user?.last_name}`} size='2em' /></Link>
        </div>
    )

    return (
        <>
            <div id="home_options">
                { currentRoute === '/' ? drawer : backIcon }
                { currentRoute !== '/' && !currentRoute.startsWith('/profile') ? <h2>{headerTitleMap[currentRoute]}</h2> : '' }
                { currentRoute.startsWith('/profile') ? <h2>{headerTitleMap['/profile']}</h2> : '' }
                { currentRoute === '/' ? userGreeting : <div className='empty'></div> }
            </div>
        </>
    );
}

export default Header