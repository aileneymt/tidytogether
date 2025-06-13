import { useState } from 'react'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function Dropdown({ label, name, options, id, disabled, sx, initValue, required, multiple=false }) {

    const [value, setValue] = useState(initValue ? initValue : multiple ? [] : null);

    const handleChange = (event) => {
        const val = event?.target?.value;

        if (multiple) {
            setValue(typeof val === 'string' ? val.split(',') : val)
        } else {
            setValue(val)
        }
    }

    const renderValue = (selected) => {
        if (!Array.isArray(selected)) return '';
        const selectedLabels = options
            .filter(option => selected.includes(option.value))
            .map(option => option.label);
        return selectedLabels.join(', ');
    }

    const singleSelectDropdown = (
        <FormControl sx={{ m: 1, minWidth: 120, ...sx }} disabled={disabled} required={required}>
            <InputLabel>{label}</InputLabel>
            <Select
                id={id}
                value={value}
                label={label}
                name={name}
                onChange={handleChange}
                // displayEmpty
                // inputProps={{ 'aria-label': 'Without label' }}
                sx={{ backgroundColor: '#fff' }}
                >
                {
                    options.map(option => (
                        <MenuItem value={option.value} key={'dropdown-item-' + label + '-' + option.label}>{option.label}</MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    )

    const multiSelectDropdown = (
        <FormControl sx={{ m: 1, minWidth: 120, ...sx }} disabled={disabled} required={required}>
            <InputLabel>{label}</InputLabel>
                <Select
                id={id}
                // displayEmpty
                // inputProps={{ 'aria-label': 'Without label' }}
                multiple
                value={value}
                label={label}
                name={name}
                onChange={handleChange}
                renderValue={renderValue}
                MenuProps={MenuProps}
                sx={{ backgroundColor: '#fff' }}
                >
                {options.map((option) => (
                    <MenuItem key={option.label} value={option.value}>
                        <Checkbox checked={multiple && value?.includes(option.value)} />
                        <ListItemText primary={option.label} />
                    </MenuItem>
                ))}
                </Select>
        </FormControl>
    )

    return (
        <>
            {/* <label for={id}>{label}</label> */}
            { multiple ? multiSelectDropdown : singleSelectDropdown }
        </>
    )
}

export default Dropdown