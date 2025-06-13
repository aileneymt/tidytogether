import React from 'react';
import './Tile.css'

function Tile({ tileData }) {
    const { name, priority, date, time, users } = tileData;
    // above is shorthand for below
    // const name = tileData.name
    // const priority = tileData.priority
    // const assignee = tileData.assignee

    return (
        <>
            <div className='week-tasks'>
            <h2>{name}</h2>
            <p>{date} {time}</p>
            <p>Priority: <span className={`priority ${priority}`}>{priority}</span></p>
            </div>
        </>
    )
}

// default the component so it is available for use in other components
export default Tile