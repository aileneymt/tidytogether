import Avatar from "../shared/components/Avatar/Avatar";
import AppGauge from "../shared/components/UserGauge/UserGauge";
import UserStats from "../shared/components/UserStats/UserStats";
import API from '../shared/services/APIClient.js'
import { useParams } from 'react-router-dom';
import './Profile.css';
import { useState,useEffect } from 'react';


function Profile() {
    const {userId} = useParams();
    const [user, setUser] = useState(null);
    const [validProfile, setValidProfile] = useState(null);

    useEffect(() => {
      const getUser = async () => {
        try {
          const currentUser = await API.getCurrentUser();
          //setCurrentUser(currentUser);
          const user = await API.getUserById(userId);

          
          setUser(user);

          if (user.id !== currentUser.id && currentUser.hh_id !== user.hh_id) {
            console.log(`Logged in user: ${currentUser.username}. Profile we are viewing: ${user.username}`);
            console.log(`Household of the current user: ${currentUser.hh_id}. HH of profile user: ${user.hh_id}`);
            setValidProfile(false);
          }
          else {
            setValidProfile(true);
          }
      
        } catch (err) {
          
          console.error("Error fetching profile:", err);
          setValidProfile(false);
        }
      };
  
      getUser();
    }, []);

    if (validProfile === null) {
        return <div>Loading...</div>; // Show loading text while user data is being fetched
    }

    if (validProfile === false) {
      return <div>This profile does not exist.</div>
    }

    
    return (
        <>
            <div className='stats'>
                <UserStats 
                    user={user} />
  
            </div>
        </>
    )
}

export default Profile;