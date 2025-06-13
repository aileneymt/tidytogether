import Avatar from '../Avatar/Avatar';
import AppGauge from '../UserGauge/UserGauge';
import './UserStats.css';
import API from '../../services/APIClient';
import { useState, useEffect } from 'react';
import './UserStats.css';

function UserStats({ user }) {

    const [lateTasks, setLateTasks] = useState([]);
    
    const [sharedTaskRate, setSharedTaskRate] = useState(0.0);
    const [lateRate, setLateRate] = useState(0.0);

    useEffect(() => {
        const fetchLateTasks = async () => {
            try {
                const response = await API.getLateTasks(user.id);
                setLateTasks(response || []); 
            } catch (error) {
                console.error('Error fetching late tasks:', error);
            }
        };
        fetchLateTasks();

        const fetchSharedTaskStats = async () => {
            try {
                const res = await API.getSharedTaskStats(user.id);
                if (res.all_completed_shared === 0) {
                    setSharedTaskRate(0.0);
                }
                else {
                    setSharedTaskRate(res.completed_by_user / res.all_completed_shared);
                }
                
            }
            catch (error) {
                console.error('Error fetching shared task stats:', error);
            }
        }
        fetchSharedTaskStats();

       
    }, []);

    useEffect(() => {
        const fetchLateRate = async () => {
            try {
                const res = await API.getIncompleteTaskCount(user.id);
                const incompleteCt = res.incompleteCt;
                if (incompleteCt === 0 || lateTasks.length === 0) {
                    setLateRate(0.0);
                }
                else {
                    setLateRate(lateTasks.length / incompleteCt);
                }
            } catch (err) {
                console.error("Error fetching number of incomplete tasks.", err);
            }
        };
        if (lateTasks != null) {
            fetchLateRate();
        }
        
    }, [lateTasks]);


    const userInfo = (
        <div className="user-info">
            <Avatar name={user.username} size='4em' />
            <h3 id="Name">{user.first_name} {user.last_name}</h3>
            <h4 id="Role">{user.role}</h4>
        </div>
    )

   
    const numCompleted = user.numCompleted;
    

    const weeklyTaskInfo = (
        <div className="weekly-tasks-info">
            <div className="weekly-stat">
                <p><span>{lateTasks.length}</span> Tasks Overdue</p>
            </div>
            <div className="weekly-stat">
                <p><span>{numCompleted}</span> Tasks completed</p>
            </div>
        </div>
    )
    const topBlock = (
        <div className="topBlock">
            {userInfo}
            {weeklyTaskInfo}
        </div>
    );


    const completedGauge = (
        <AppGauge value={Math.round(sharedTaskRate * 100)} valueArcColor='#CCF6D6' label="Completion of Shared Tasks" />
    )

    const timelinessGauge = (
        <AppGauge value={Math.round(lateRate * 100)} valueArcColor='#EA6A6A' label="In Progress Tasks that are Late" />
    )
    const gauges = (
        <div className="gauges-container">
            {completedGauge}
            {timelinessGauge}
        </div>
    );



    const lateTasksDisplay = (
        <div className="lateTasksDisplay">
            <h2 className="text-center">Missed Deadlines</h2>
            <div className="lateTasksContainer">
                {lateTasks.map((task) => (
                    <div className="task_container">
                        <hr></hr>
                        <h3>
                            {task.name}
                        </h3>  
                        <div>
                            {task.description}                         
                        </div>
                        <div>
                            Due: {new Date(task.deadline).toLocaleString()}
                        </div>
                
                    </div>
                ))} 

                {lateTasks.length === 0 && (
                    <div className="noOverdueMessage"> No overdue tasks! </div>
                )}
            </div> 
        </div>
    );
    

    return (
        <div id="user-info-and-stats">
            {topBlock}
            {gauges}
            {lateTasksDisplay}
        </div>
    );
}

export default UserStats;