import { useState, useEffect } from 'react';
import {
    Checkbox,
    IconButton,
    Menu,
    MenuItem,
    Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import './TodayTask.css';

function TodayTask({ task, editClick, completeTaskClick, deleteTaskClick, isOverdue=false }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const checkboxId = `task-${task.id}-checkbox`;
    const [checked, setChecked] = useState(!!task.completed_at); // !! = convert to bool

    useEffect(() => {
        setChecked(!!task.completed_at)
    }, [task])

    const handleOptionsClick = (event) => {
        setAnchorEl(event?.currentTarget);
    }

    const handleOptionsClose = () => {
        setAnchorEl(null);
    }

    const handleChange = (event) => {
        const isChecked = event?.target?.checked;
        if (!checked && isChecked && !task.completed_at) {
            completeTaskClick(task);
        }
    }

    const moreOptionsView = (
        <>
            <IconButton
                id={`more-options-${task.id}-i`}
                className='icon-btn'
                aria-controls={open ? `basic-menu-today-task-${task.id}` : undefined}
                aria-haspopup='true'
                aria-expanded={open ? 'true' : undefined}
                onClick={(event) => handleOptionsClick(event)}
            >
                <MoreVertIcon sx={{ color: 'white' }}/>
            </IconButton>
            <Menu
                id={`basic-menu-today-task-${task.id}`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleOptionsClose}
                MenuListProps={{
                    'aria-labelledby': `more-options-${task.id}-i`
                }}
            >
                <MenuItem onClick={() => { handleOptionsClose(); editClick(task) } }>
                    <Button size='small' startIcon={<EditIcon sx={{ color: '#628DDE' }}/>}>Edit</Button>
                </MenuItem>
                <MenuItem onClick={() => { handleOptionsClose(); deleteTaskClick(task) }}>
                    <Button size='small' startIcon={<DeleteIcon sx={{ color: '#628DDE' }}/>}>Delete</Button>
                </MenuItem>
            </Menu>
        </>
    )

    const deleteBtn = (
    <IconButton
        className='icon-btn'
        onClick={(event) => deleteTaskClick(task)}
    >
        <DeleteIcon sx={{ color: 'white' }}/>
    </IconButton>
    )

    return (
        <>
            <div className={`today_task ${checked ? 'completed' : ''}`}>
                <Checkbox id={checkboxId} onChange={handleChange} checked={checked}/>
                <label>{task.name}</label>
                {
                    isOverdue
                    ? deleteBtn
                    : moreOptionsView
                }
            </div>
        </>
    )
}

export default TodayTask