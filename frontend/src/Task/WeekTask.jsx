import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import './WeekTask.css';
import { DAYS_OF_WEEK } from "../shared/constants/days.constants";
import { PRIORITY_MAP, DEFAULT } from '../shared/constants/priority.constants';

function WeekTask({ date, tasks, editClick, completeTaskClick, deleteTaskClick }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const open = Boolean(anchorEl);

    const dueDate = new Date(date);
    const dayOfWeekNum = dueDate.getDay();
    const dayOfWeek = DAYS_OF_WEEK[dayOfWeekNum].toUpperCase();
    const day = dueDate.getDate();

    const handleOptionsClick = (event, task) => {
        setAnchorEl(event?.currentTarget);
        setSelectedTask(task);
    }

    const handleOptionsClose = () => {
        setAnchorEl(null);
        setSelectedTask(null);
    }

    return (
        <>
            <div className='week-tasks'>
                <div className='date-info'>
                    <h3>{dayOfWeek}</h3>
                    <h3>{day}</h3>
                </div>
                <div className='flex col justify-content-center'>
                    {
                        tasks?.map((task, i) => (
                            <div className='flex align-items-center justify-content-between gap-sm' key={'week-task-' + i}>
                                {
                                    !!task.completed_at
                                    ? <CheckCircleOutlineIcon sx={{ color: '#CCF6D6;' }}/>
                                    : <></>
                                }
                                <p> 
                                    <span className={`priority ${PRIORITY_MAP[task.priority] ?? DEFAULT}`}>
                                        {task.name}
                                    </span>
                                </p>
                                <IconButton
                                    id={`more-options-${task.id}-i`}
                                    className='icon-btn'
                                    aria-controls={open ? 'basic-menu' : undefined}
                                    aria-haspopup='true'
                                    aria-expanded={open ? 'true' : undefined}
                                    onClick={(event) => handleOptionsClick(event, task)}
                                >
                                    <MoreVertIcon sx={{ color: '#628DDE' }}/>
                                </IconButton>
                                <Menu
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleOptionsClose}
                                    MenuListProps={{
                                        'aria-labelledby': selectedTask ? `more-options-${selectedTask.id}-i` : undefined
                                    }}
                                >
                                    <MenuItem disabled={!!task.completed_at} onClick={() => { handleOptionsClose(); editClick(selectedTask) } }>
                                        <Button size='small' startIcon={<EditIcon sx={{ color: '#628DDE' }}/>}>Edit</Button>
                                    </MenuItem>
                                    <MenuItem disabled={!!task.completed_at} onClick={() => { handleOptionsClose(); completeTaskClick(selectedTask) } }>
                                        <Button size='small' startIcon={<CheckCircleOutlineIcon sx={{ color: '#628DDE' }}/>}>Complete</Button>
                                    </MenuItem>
                                    <MenuItem onClick={() => { handleOptionsClose(); deleteTaskClick(selectedTask) }}>
                                        <Button size='small' startIcon={<DeleteIcon sx={{ color: '#628DDE' }}/>}>Delete</Button>
                                    </MenuItem>
                                </Menu>
                            </div>
                        ))
                    }
                </div>
            </div>
        </>
    )
}

export default WeekTask