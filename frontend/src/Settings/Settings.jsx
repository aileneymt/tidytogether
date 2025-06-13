import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';
import './Settings.css';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { Button } from '@mui/material';
import API from '../shared/services/APIClient.js'
import ConfirmModal from '../shared/components/ConfirmModal/ConfirmModal.jsx';

const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',
    '&:active': {
    '& .MuiSwitch-thumb': {
        width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
        transform: 'translateX(9px)',
    },
    },
    '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
        transform: 'translateX(12px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#1890ff',
        ...theme.applyStyles('dark', {
            backgroundColor: '#177ddc',
        }),
        },
    },
    },
    '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
        duration: 200,
    }),
    },
    '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
    ...theme.applyStyles('dark', {
        backgroundColor: 'rgba(255,255,255,.35)',
    }),
    },
}));

function Settings({ user, setIsAuthenticated }) {

    const navigate = useNavigate();

    const [openModal, setOpenModal] = useState(false);
    const [newUsername, setNewUsername] = useState(user.username);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showUsernameModal, setUsernameModal] = useState(false);
    
    const [showPasswordModal, setPasswordModal] = useState(false);

    const [error, setError] = useState("");

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleConfirm = (confirmed) => {
        if (confirmed) {
            handleDeleteAccount();
        } else {
            handleCloseModal();
        }
    }

    const handleDeleteAccount = async () => {
        API.deleteAccount().then(() => {
            setOpenModal(false);
            setIsAuthenticated(false);
            navigate('/login');
        }).catch((err) => {
            console.error(`Error occurred while trying to delete account: ${err}`)
        })
    };

    const [isDarkMode, setIsDarkMode] = useState(() => {
        // TODO: get this value from current user data? or default to system preference?
        // i.e. if user system preference = light theme, but they set app to dark theme, 
        // should app be dark theme the next time they log in
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const [notificationsOn, setNotifications] = useState(() => {
        // TODO: get this value from current user data
        return true;
    });

    const toggleDarkMode = (event) => {
        console.log('toggle dark mode')
        setIsDarkMode(event.target.checked);
        // TODO: code to switch to dark mode
    }

    const toggleNotifications = (event) => {
        console.log('toggle notifications')
        setNotifications(event.target.checked);
        // TODO: code to toggle notifications
    }

    const changeTheme = () => {
        console.log('change theme')
    }

    const changeNotificationOptions = () => {
        console.log('change notifications')
    }
    const updateUsername = async () => {
        try {
            user = await API.updateUserInfo(newUsername, null);
            setUsernameModal(false);
            setError("");
            
        } catch (err) {
            console.error(err.message);
            setError(err.message);
        }

    }

    const updatePassword = async () => {
        try {
            if (newPassword !== confirmPassword) {
                throw new Error("Passwords must match.")
            }
            user = await API.updateUserInfo(null, newPassword);
            setPasswordModal(false);
            setError("")
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error(err.message);
            setError(err.message);
        }
    }

    useEffect(() => {
        console.log(isDarkMode)
    }, [isDarkMode])

    return (
        <>
            <div className='centered settings-container'>
                <div className='settings-tiles'>

                    <div className='card'>
                        <h3>Display</h3>
                        <hr className='settings-hr'/>
                        <div className='setting'>
                            <p>Change theme</p>
                            <IconButton className='borderless' style={{ border: 'none', outline: 'none'}} onClick={changeTheme}>
                                <ArrowCircleRightOutlinedIcon />
                            </IconButton>
                        </div>
                        <div className='setting'>
                            <p>Toggle Dark Mode</p>
                            <AntSwitch inputProps={{ 'aria-label': 'ant design' }} checked={isDarkMode} onChange={toggleDarkMode}/>
                        </div>
                    </div>

                    <div className='card'>
                        <h3>Notifications</h3>
                        <hr />
                        <div className='setting'>
                            <p>Notification options</p>
                            <IconButton className='borderless' style={{ border: 'none', outline: 'none'}} onClick={changeNotificationOptions}>
                                <ArrowCircleRightOutlinedIcon />
                            </IconButton>
                        </div>
                        <div className='setting'>
                            <p>Toggle Notifications</p>
                            <AntSwitch inputProps={{ 'aria-label': 'ant design' }} checked={notificationsOn} onChange={toggleNotifications}/>
                        </div>
                    </div>

                    <div className='card'>
                        <h3>Account</h3>
                        <hr />
                        <div className='setting'>
                            <p>Change password</p>
                            <IconButton className='borderless' style={{ border: 'none', outline: 'none'}} onClick={() => setPasswordModal(true)}>
                                <ArrowCircleRightOutlinedIcon />
                            </IconButton>
                        </div>
                        <div className='setting'>
                            <p>Change username</p>
                            <IconButton className='borderless' style={{ border: 'none', outline: 'none'}} onClick={() => setUsernameModal(true)}>
                                <ArrowCircleRightOutlinedIcon />
                            </IconButton>
                        </div>
                    </div>

                </div>

                <div className='delete-account-btn'>
                    <Button 
                        variant='contained' 
                        size='medium' 
                        id='deleteAccountBtn' 
                        color='error' 
                        onClick={handleOpenModal}>
                        Delete Account
                    </Button>
                </div>

                <ConfirmModal
                    title='Confirm Account Deletion'
                    bodyText='Are you sure you want to delete your account? This action cannot be undone.'
                    confirmModalOpen={openModal}
                    handleConfirm={handleConfirm}
                    handleCloseConfirmModal={handleCloseModal}
                    confirmBtnText='Delete'
                    cancelBtnText='Cancel'
                />
                { showUsernameModal && (
                    <div className="changeUsernameModal modal-overlay">
                        <div className="modal-content">
                            <CancelOutlinedIcon className="cancelIcon" onClick={() => {setUsernameModal(false); setNewUsername(user.username); setError("")}}>
                            </CancelOutlinedIcon>
                            <input 
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="form-control"
                            >
                            </input>

                            <button className="updateButton" type="submit" onClickCapture={(e) => updateUsername()}>
                                Update
                            </button>
                            <span className="error">{error}</span>

                        </div>
                    </div>
                    )
                }


                { showPasswordModal && (
                    <div className="changePasswordModal modal-overlay">
                        <div className="modal-content">
                            <CancelOutlinedIcon className="cancelIcon" onClick={() => {setPasswordModal(false); setNewPassword(""); setConfirmPassword(""); setError("")}}>
                            
                            </CancelOutlinedIcon>
                            <label for="passwordInput">New Password</label>
                            <input 
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="form-control"
                                name="passwordInput"
                            >
                            </input>
                            <label for="confirmPassword">Confirm Password</label>
                            <input 
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-control"
                                name="confirmPassword"
                            >
                            </input>

                            <button className="updateButton" type="submit" onClickCapture={() => updatePassword()}>
                                Update
                            </button>
                            <span className="error">{error}</span>

                        </div>
                    </div>
                    )
                }

            </div>
        </>
    )
}

export default Settings