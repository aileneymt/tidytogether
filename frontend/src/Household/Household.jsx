import Avatar from "../shared/components/Avatar/Avatar";
import Stack from '@mui/material/Stack';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../shared/services/APIClient.js'
import './Household.css';
import ConfirmModal from "../shared/components/ConfirmModal/ConfirmModal.jsx";

function Household() {
    
    const [user, setUser] = useState(null);
    const [household, setHousehold] = useState(null);
    const [joinCodeInput, setjoinCodeInput] = useState('');
    const [joinCode, setJoinCode] = useState(null);

    const [openModal, setOpenModal] = useState(false);
    const [memberToActOn, setMemberToActOn] = useState(null);
    const [modalType, setModalType] = useState(''); // New state to handle modal type
    const [householdName, setHouseholdName] = useState("My Household");
    

    const getUserAndHousehold = async () => {
        try {
            const result = await API.getCurrentUser();
            const fullUser = await API.getUserById(result.id);
            console.log("Full user:");
            console.log(fullUser)
            setUser(fullUser);
            try {
                const hh = await API.getHousehold();
                setHousehold(hh);
            } catch {
                setHousehold(null); 
            }

            if (fullUser.role === 'admin') {
                try {
                    const response = await API.getJoinCode();
                    setJoinCode(response.join_code);
                } catch { 
                    console.log("Error fetching join code.");
                }

            }
        } catch (err) {
            console.error('Error fetching user or household:', err);
        }
    };

    useEffect(() => {
        
        getUserAndHousehold();

    }, []);
    
    if (!user) {
        return <div>Loading...</div>; // Show loading text while user data is being fetched
    }



    const handleOpenModal = (userId, actionType) => {
        setMemberToActOn(userId); // Store the member's ID to act on
        setModalType(actionType);  // Set the action type (remove, promote, etc.)
        setOpenModal(true); // Open the modal
    };

    const handleCloseModal = () => {
        setOpenModal(false); // Close the modal
        setModalType(''); // Reset modal type
    };




    
// joining and creating household
    const handleJoinHousehold = async () => {
        if (!joinCodeInput.trim()) {
            alert("Please enter a valid household code.");
            return;
        }

        try {
            await API.joinHousehold(joinCodeInput.trim());
            getUserAndHousehold();
            setjoinCodeInput('');

        } catch {
            setjoinCodeInput('');
            alert("Please enter a valid household code.");
        }
    }

    const handleCreateHousehold = async () => {
        try {
            await API.createHousehold(householdName);
            const response = await API.getJoinCode();
            setJoinCode(response.join_code);
            getUserAndHousehold();
        } catch {
            console.log("Error creating a new household.");
        }
    }

    const regenerateJoinCode = async () => {
        try {
            const response = await API.updateJoinCode(householdName);
            setJoinCode(response.join_code);
        } catch {
            console.log("Error regenerating join code.");
        }
    }

// admin functions 

    const handleRemoveMember = async () => {
        try {
            await API.removeHouseholdMember(memberToActOn);
            setOpenModal(false);
            getUserAndHousehold();
            
        } catch {
            console.log("Error occured while trying to remove a member.");
        }
    }

    const handleMakeAdmin = async () => {
        try {
            await API.makeAdmin(memberToActOn);
            setOpenModal(false);
            getUserAndHousehold();
        } catch {
            console.log("Error occured while trying to remove a member.");
        }
    }

    const handleDeleteHousehold = async () => {
        try {
            await API.deleteHousehold();
            setOpenModal(false);
            setHouseholdName("My Household");
            getUserAndHousehold();
        } catch {
            console.log("Error occured while trying to delete household.");
        }
    }

    const handleLeaveHousehold = async () => {
        try {
            await API.leaveHousehold();
            setOpenModal(false);
            getUserAndHousehold();
        } catch {
            console.log("Error occured while trying to leave the household.");
        }
    }
   

    if (!household) {
        return (
        <div className="p-4 body">
            <p id="join_or_create" className="text-xl mb-4 text-center">You're not part of a household yet.</p>

            <div className="main">
                <div className="container">
                    <h2 className="text-xl font-bold mb-4">Join a household</h2>
                    <form className="mb-4">
                        <div>
                            <label id="join_label" className="block mb-2">Enter a household join code:</label>
                            <input
                                id="code_input"
                                type="text"
                                placeholder="Enter code"
                                value={joinCodeInput}
                                onChange={(e) => setjoinCodeInput(e.target.value)}
                                className="border rounded px-3 py-2 w-full mb-4"
                            />
                        </div>
                    
                        <button id="join_button" type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleJoinHousehold}>
                        Join Household
                        </button>
                    </form>
                </div>
                <div className="container">
                    <div className="create_container">
                        <h2 className="text-xl font-bold mb-4">Create a household</h2>
                        <input
                        type="text"
                        placeholder="Enter household name:"
                        className="border px-3 py-2 w-full rounded mb-4"
                        value={householdName}
                        onChange={(e) => setHouseholdName(e.target.value)}
                        />
                        <button
                            id="create_button"
                            className="bg-green-500 text-white px-4 py-2 rounded"
                            onClick={handleCreateHousehold}
                            disabled={!householdName.trim()}
                        >
                            Create
                        </button>
                    </div>
                </div>
            </div>
    
        </div>
        );
    }

    const handleConfirm = (confirmed) => {
        if (confirmed) {
            if (modalType ==='removeMember') {
                handleRemoveMember();
            } else if (modalType === 'makeAdmin') {
                handleMakeAdmin();
            } else if (modalType === 'leaveHousehold') {
                handleLeaveHousehold();
            } else {
                handleDeleteHousehold();
            }
        } else {
            handleCloseModal();
        }
    }

    return (
        
        <div className="body household-container">
          <h2>{household.name}</h2>
          <Stack direction="row" spacing={2}>
            
            {household.members.map((member) => (
                <div className="member_container">
                    <Link to ={`/profile/${member.id}`} className="hover:underline text-white flex col align-items-center">
                        <div key={`user-avatar-${member.id}`}>
                            <Avatar name={member.first_name} />
                        </div>
                        <div>
                            {member.first_name} {member.last_name}
                        </div>  
                        <div className="role">
                           {member.role}                         
                        </div>
                    </Link>
                    {user.role === 'admin' && (
                        <div className="mt-2 admin_options">
                            <button
                                className="text-red-400 px-2 py-1 rounded text-sm removeButton"
                                onClick={() => handleOpenModal(member.id, 'removeMember')}
                            >
                                Remove
                            </button>
                            <button 
                                className="text-green-300 px-2 py-1 rounded text-sm makeAdminButton"
                                onClick={() => handleOpenModal(member.id, 'makeAdmin')}
                            > Make admin</button>
                        </div>
                    )} 
                
                </div>
            ))}    
          </Stack>
            {user.role === 'member' && (
                <Button variant='contained' size='medium' id='leaveHouseholdBtn' color='error' onClick={() => handleOpenModal(user.id, 'leaveHousehold')}>Leave Household</Button>
            )}
            

            {user.role === "admin" && (
                <div>
                    <hr></hr>
                    <div className="admin_container">
                        <h3 className="mb-0">Users can join your household with the code:</h3>
                        <h1 className="text-center join_code">{joinCode}</h1>
                        <div className="button_div">
                            <Button variant='contained' size='small' id='regenCodeBtn' onClick={regenerateJoinCode}>Regenerate Join Code</Button>
                            <Button variant='contained' size='small' id='deleteHouseholdBtn' color='error' onClick={() => handleOpenModal(user.id, 'deleteHousehold')}>Delete Household</Button>
                    
                        </div>
                    </div>
                </div>
               


                
            )}

            {/* Confirmation modal for removing a user */}
            {/* <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                {modalType === 'removeMember' && (
                    <p>Are you sure you want to remove this member from the household? This cannot be undone.</p>
                )}
                {modalType === 'makeAdmin' && (
                    <p>Are you sure you want to make this member the admin? You will lose your admin privileges.</p>
                )}
                {modalType === 'leaveHousehold' && (
                    <p>Are you sure you want to leave this household? Your tasks will be lost and this cannot be undone.</p>
                )}
                {modalType === 'deleteHousehold' && (
                    <p>Are you sure you want to delete this household? All tasks will be lost and this cannot be undone.</p>
                )}

                </DialogContent>
                <DialogActions>
                <Button onClick={handleCloseModal} color="primary">
                    Cancel
                </Button>
                <Button 
                    onClick={modalType === 'removeMember' ? handleRemoveMember : (modalType === 'makeAdmin' ? handleMakeAdmin : (modalType === 'leaveHousehold' ? handleLeaveHousehold : handleDeleteHousehold))}
                    color="secondary"
                >
                    Confirm
                </Button>
                </DialogActions>
            </Dialog> */}

            <ConfirmModal
                title='Confirm Action'
                bodyText={
                    modalType === 'removeMember' ? 'Are you sure you want to remove this member from the household? This cannot be undone.'
                        : modalType === 'makeAdmin' ? 'Are you sure you want to make this member the admin? You will lose your admin privileges.'
                            : modalType === 'leaveHousehold' ? 'Are you sure you want to leave this household? Your tasks will be lost and this cannot be undone.'
                            : modalType === 'deleteHousehold' ? 'Are you sure you want to delete this household? All tasks will be lost and this cannot be undone.'
                            : ''
                }
                confirmModalOpen={openModal}
                handleConfirm={handleConfirm}
                handleCloseConfirmModal={handleCloseModal}
                confirmBtnText='Confirm'
                cancelBtnText='Cancel'
            />
          
        </div>


    );
}

export default Household;