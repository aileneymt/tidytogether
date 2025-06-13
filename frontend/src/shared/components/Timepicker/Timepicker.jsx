import { useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker as MUITimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

function AppTimepicker({label, initValue, id, name}) {
    const [value, setValue] = useState(initValue);
    
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MUITimePicker
                label={label}
                sx={{ backgroundColor: '#fff' }}
                id={id}
                name={name}
                value={value}
                defaultValue={dayjs().set('hour', 23).set('minute', 59).set('second', 59)}
                timeSteps={{ minutes: 1}}
                onChange={(newValue) => setValue(newValue)}
            />
        </LocalizationProvider>
    );
}

export default AppTimepicker