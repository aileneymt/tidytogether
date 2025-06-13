import { useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';

function AppDatepicker({label, initValue, id, name, maxDate, minDate}) {
    const [value, setValue] = useState(initValue);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MUIDatePicker
                label={label}
                name={name}
                value={value}
                maxDate={maxDate ?? undefined}
                minDate={minDate ?? undefined}
                id={id}
                sx={{ backgroundColor: '#fff' }}
                onChange={(newValue) => setValue(newValue)}
            />
        </LocalizationProvider>
    );
}

export default AppDatepicker