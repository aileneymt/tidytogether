import MUIAvatar from '@mui/material/Avatar';
import { Tooltip } from '@mui/material';

function stringAvatar(name, size) {
    
    const initials = getInitials(name);
    return {
        sx: {
            bgcolor: '#628DDE',
            width: size,
            height: size,
        },
        children: initials
    };
}

function getInitials(name) {
    const nameArray = name.split(' ');
    const initials = `${nameArray[0][0].toUpperCase()}${nameArray.length > 1 ? nameArray[1][0].toUpperCase() : ''}`;
    return initials;
}

function Avatar ( { name, size='4em' }) {
    return (
        <Tooltip title={name}>
            < MUIAvatar {...stringAvatar(name, size)} />
        </Tooltip>
    )
}

export default Avatar;