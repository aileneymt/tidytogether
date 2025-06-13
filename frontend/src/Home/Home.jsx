import { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    FormGroup,
    IconButton,
    TextareaAutosize,
    TextField
} from '@mui/material';
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import dayjs from 'dayjs';
import API from '../shared/services/APIClient.js'
import WeekTask from '../Task/WeekTask.jsx';
import TodayTask from '../Task/TodayTask.jsx';
import AppDatepicker from '../shared/components/Datepicker/Datepicker.jsx';
import AppTimepicker from '../shared/components/Timepicker/Timepicker.jsx';
import Dropdown from '../shared/components/Dropdown/Dropdown.jsx';
import CalendarView from '../CalendarView/CalendarView.jsx';
import { DEFAULT, PRIORITIES, PRIORITY_MAP } from "../shared/constants/priority.constants";
import './Home.css';
import ConfirmModal from '../shared/components/ConfirmModal/ConfirmModal.jsx';

function Home({ user, setUser }) {
    const [tasks, setTasks] = useState([]);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [showOverdueTasks, setShowOverdueTasks] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [isCalendarView, setIsCalendarView] = useState(false);

    /*** modal state variables  ***/
    const [isSharedTask, setIsSharedTask] = useState(false);
    const [userOptions, setUserOptions] = useState([]);
    const [activeTask, setActiveTask] = useState(null);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmModalTitle, setConfirmModalTitle] = useState('');
    const [confirmModalBody, setConfirmModalBody] = useState('');
    /*** end modal state variables */

    const priorityOptions = PRIORITIES.map(p => {
        return {
            label: `${p.charAt(0).toUpperCase()}${p.slice(1)}`,
            value: p
        }
    });

    /*** modal event handlers ***/
    const handleOpenModal = () => {
        setModalOpen(true);
    }

    const handleCloseModal = (_event, reason) => {
        if (reason !== 'backdropClick') {
            setModalOpen(false);
            setActiveTask(null);
            setIsSharedTask(false);
        }
    }

    const handleSharedTaskChange = (event) => {
        const isChecked = event?.target?.checked;
        setIsSharedTask(isChecked);
    }

    const handleCloseConfirmModal = (_event, reason) => {
        if (reason !== 'backdropClick')
            setConfirmModalOpen(false);
            setConfirmModalTitle('');
            setConfirmModalBody('');
    }

    /*** end modal event handlers ***/

    useEffect(() => {
        setCurrentDate(currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }));

        const datesArr = []
        for (let i = 1; i < 7; i++) {
            const today = new Date();
            const newDate = new Date(today);
            newDate.setDate(today.getDate() + i)
            datesArr.push(newDate);
        }

        setWeekDates(datesArr)

        const fetchTasks = async () => {
            try {
                const tasks = await API.getAllTasksCurrent()
                formatAndSetTasks(tasks)
            } catch(error) {
                console.error('error occurred trying to fetch tasks: ', error);
            }
        }

        const fetchHouseholdUsers = async () => {
            try {
                const household = await API.getHousehold();
                console.log("Household: ");
                console.log(household);
                if (household) {
                    setUser({...user, hh_id: household.id })
                }
                const members = [];
                
                household.members.forEach((user) => {
                    members.push({ label : `${user.first_name} ${user.last_name}`, value: user.id })
                });
                setUserOptions(members);
            } catch(error) {
                console.error('error occurred fetching user household', error);
            }
        }

        fetchTasks()
        fetchHouseholdUsers()

    }, [])

    const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    const getTasksForDate = (date, today=false) => {
        return tasks.filter(t => {
            let now = new Date(date);
            let deadline = new Date(t.deadline);
            let tomorrow = addDays(date, 1);
            if (!today) now = new Date(now.setHours(0, 0, 0, 0));
            tomorrow = new Date(tomorrow.setHours(0, 0, 0, 0))
            return (deadline >= now && deadline < tomorrow);
        });
    }

    const getOverdueTasks = (tasks) => {
        const overdueTasks = tasks.filter(t => {
            let now = new Date();
            let deadline = new Date(t.deadline);

            return deadline < now;
        });

        setOverdueTasks(overdueTasks);
    }

    const editTaskClick = (task) => {
        console.log('edit task', task)
        const taskToEdit = {
            ...task,
            users: task?.users?.filter(u => u.user_id !== user.id).map(u => u.user_id)
        }
        setActiveTask(taskToEdit);
        setIsSharedTask(taskToEdit.users?.length > 0);
        handleOpenModal();
    }

    const deleteTaskClick = (task) => {
        console.log('delete task', task)
        setActiveTask(task);
        setConfirmModalTitle('Delete task?');
        setConfirmModalBody('Are you sure you want to delete this task? This cannot be undone.');
        setConfirmModalOpen(true);
    }

    const deleteTask = () => {
        console.log('deleting task: ', activeTask.id)
        API.deleteTask(activeTask.id).then(() => {
            console.log(`task w/ ID ${activeTask.id} deleted`);

            const tasksWithoutDeleted = [...tasks.filter(t => t.id !== activeTask.id)]
            setTasks(tasksWithoutDeleted);
            getOverdueTasks(tasksWithoutDeleted);
            setActiveTask(null);
            setConfirmModalTitle('');
            setConfirmModalBody('');
            setConfirmModalOpen(false);
        }).catch((err) => {
            console.error(`An error occurred while deleting task w/ ID ${task.id}, error: ${err}`);
        });
    }

    // show the confirm modal
    const completeTaskClick = (task) => {
        console.log('task to complete', task);
        setActiveTask(task);
        setConfirmModalOpen(true);
        setConfirmModalTitle('Complete task?');
        setConfirmModalBody('Are you sure you want to mark this task complete?');
    }

    const handleStateAfterTaskComplete = (task) => {
        const completedTaskIndex = tasks.findIndex(t => t.id === task.id);
        if (completedTaskIndex > -1) {
            tasks[completedTaskIndex] = {
                ...task,
                completed_at: new Date()
            }
        }
        
        setActiveTask(null);
        setTasks([...tasks])
        getOverdueTasks(tasks);

    }

    const completeTask = () => {
        const updatedTask = {
            ...activeTask,
            completed_at: new Date() // completed now
        }
        API.completeTask(activeTask.id, updatedTask).then(response => {
            setConfirmModalOpen(false);
            setConfirmModalTitle('');
            setConfirmModalBody('');
            handleStateAfterTaskComplete(activeTask);
        }).catch(error => {
            console.error(`An error occurred while updating the task w/ ID ${activeTask.id}, err: ${error}`);
        });
    }

    const handleConfirm = (confirmed) => {
        // user clicked confirm/yes option
        if (confirmed) {
            confirmModalTitle?.toLowerCase()?.includes('delete') ? deleteTask() : completeTask();
        } else {
            setConfirmModalOpen(false);
            setConfirmModalTitle('');
            setConfirmModalBody('');
        }
    }

    const formatAndSetTasks = (tasks) => {
        // date fields are stored in UTC time, but are returned without the Z at the end
        // add back Z, so we can convert to local time from UTC
        const formattedTasks = tasks.map(t => {
            return {
                ...t,
                deadline: new Date(t.deadline + 'Z').toLocaleString()
            }
        })
        setTasks(formattedTasks);
        getOverdueTasks(formattedTasks);
    }

    const defaultTaskView = (
        <div id="week_tasks">
                {
                    weekDates?.map((date, i) => (
                        <WeekTask
                            date={date}
                            tasks={getTasksForDate(date)}
                            key={`week-task-${i}`}
                            editClick={editTaskClick}
                            completeTaskClick={completeTaskClick}
                            deleteTaskClick={deleteTaskClick}
                        />
                    ))
                }
            </div>
    )

    const taskModal = (
        <>
            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                className='modal'
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: '#628DDE',
                            border: '5px solid white',
                            borderRadius: '15px',
                            color: 'white'
                        },
                        component: 'form',
                        onSubmit: async (event) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const formJson = Object.fromEntries(formData.entries());
                            formJson.created_at = new Date();
                            let user = await API.getCurrentUser();
                            formJson.users = [ user.id ];
                            if (formJson.sharedTaskUsers) {
                                let others = formJson.sharedTaskUsers.split(",");
                                others.forEach(user => {
                                    formJson.users.push(parseInt(user));
                                });
                            }
                            
                            const combinedDeadline = new Date(`${formJson.deadline} ${formJson.time}`);
                            formJson.deadline = combinedDeadline.toISOString();
                            delete formJson.time;
                            console.log("form data with correct deadline:")
                            console.log(formJson);

                            // EDIT task
                            if (activeTask) {
                                const taskResponse = await API.updateTask(activeTask.id, formJson);
                                const updatedTaskIndex = tasks.findIndex(t => t.id === taskResponse.id);
                                // update tasks property w/ the new task data
                                if (updatedTaskIndex > -1) {
                                    // date is being returned as UTC value w/ Z at the end, so remove Z as its already in UTC time
                                    taskResponse.deadline = new Date(taskResponse.deadline).toISOString().replace("Z", "");
                                    // convert to local time zone
                                    taskResponse.deadline = new Date(taskResponse.deadline + 'Z').toLocaleString()
                                    tasks[updatedTaskIndex] = taskResponse;
                                    setTasks([...tasks]);
                                    getOverdueTasks(tasks);
                                    handleCloseModal();
                                }
                                setActiveTask(null);
                            } else { // ADD TASK
                                const newTask = await API.createTask(formJson);
                                // date is being returned as UTC value w/ Z at the end, so remove Z as its already in UTC time
                                newTask.deadline = new Date(newTask.deadline).toISOString().replace("Z", "");
                                // convert to local time zone
                                newTask.deadline = new Date(newTask.deadline + 'Z').toLocaleString()
                                setTasks([...tasks, newTask]);
                                handleCloseModal();
                                // removed check to response.ok because httpclient already checks this
                            }
                        },
                    },
                }}
            >
                <DialogTitle>
                    <Box display='flex' alignItems='center' justifyContent='space-between'>
                        <h2>{`${activeTask ? 'Edit' : 'Add New'} Task`}</h2>
                        <Box>
                            <IconButton onClick={handleCloseModal}>
                                <CancelOutlinedIcon sx={{ color: 'white'}}/>
                            </IconButton>
                        </Box>
                    </Box>
                    
                </DialogTitle>
                <DialogContent>
                    <FormGroup className='flex col gap-med'>
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="taskName"
                            name="name"
                            label="Task Name"
                            value={activeTask?.name}
                            sx={{ backgroundColor: '#fff' }}
                            onChange={(event) => { if (activeTask) setActiveTask({ ...activeTask, name: event?.target?.value })}}
                        />
                        <TextareaAutosize
                            aria-label="textarea"
                            placeholder="Enter description (optional)"
                            name='description'
                            minRows={3}
                            value={activeTask?.description}
                            style={{ backgroundColor: '#fff', color: 'black' }}
                            onChange={(event) => { if (activeTask) setActiveTask({ ...activeTask, description: event?.target?.value })}}
                        />
                        <div className='flex align-items-center justify-content-between gap-med'>
                            <AppDatepicker
                                label='Date *'
                                id='dateInput'
                                name='deadline'
                                maxDate={dayjs().add(1, 'year')}
                                minDate={dayjs()}
                                initValue={activeTask?.deadline
                                    ? dayjs(activeTask.deadline).set('hour', 0)
                                    : null
                                }
                            />
                            <AppTimepicker
                                label='Time (optional)'
                                id='time'
                                name='time'
                                initValue={activeTask?.deadline
                                    ? dayjs().startOf('day').hour(dayjs(activeTask.deadline).hour()).minute(dayjs(activeTask.deadline).minute())
                                    : dayjs().set('hour', 23).set('minute', 59).set('second', 59)
                                }
                            />
                        </div>
                        {user.hh_id !== null && userOptions.length !== 0 && (
                        <div className='flex align-items-center justify-content-between'>
                            <div className='w-50'>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={isSharedTask}
                                            sx={{ color: '#fff' }}
                                            onChange={handleSharedTaskChange}
                                            name='isSharedTask'
                                        />
                                    }
                                    label='Shared task'
                                />
                            </div>
                            <div className='w-50'>
                                <Dropdown 
                                    id='sharedTaskUsersDropdown' 
                                    name='sharedTaskUsers'
                                    options={userOptions} 
                                    multiple
                                    sx={{ width: '97%'}}
                                    disabled={!isSharedTask}
                                    required={isSharedTask}
                                    initValue={activeTask?.users}
                                >
                                </Dropdown>
                            </div>
                        </div>)}
                        <div className='flex align-items-center justify-content-between'>
                            <div className='w-50'>
                                <label htmlFor='priorityDropdown' className='m-8'>Priority (optional)</label>
                            </div>
                            <div className='w-50'>
                                <Dropdown 
                                    id='priorityDropdown' 
                                    name='priority' 
                                    options={priorityOptions} 
                                    sx={{ width: '97%'}} 
                                    initValue={PRIORITY_MAP[activeTask?.priority] ?? DEFAULT}
                                >
                                </Dropdown>
                            </div>
                        </div>
                    </FormGroup>
                    
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'center'}}>
                    <Button type='submit' variant='contained' size='large' id='addTaskButtonInModal'>
                        {`${activeTask ? 'Update' : 'Add'} Task`}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )

    return (
    <>
        <main>
            {/* {} indicates start of js code */}
            <h1 id="date">{currentDate.toString()}</h1>

            <div id="todays_tasks">
                {
                    getTasksForDate(new Date(), true).map((task) => (
                        <TodayTask
                            task={task}
                            key={`today-task-${task.id}`}
                            editClick={editTaskClick}
                            completeTaskClick={completeTaskClick}
                            deleteTaskClick={deleteTaskClick}
                        />
                    ))
                }
                {
                    overdueTasks?.length > 0
                    ? <div className='flex overdue-toggle' onClick={() => setShowOverdueTasks(!showOverdueTasks)}>
                        {`${showOverdueTasks ? 'Hide' : 'Show'} overdue tasks`}
                        {showOverdueTasks ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon /> }
                    </div>
                    : null
                }
                {
                    showOverdueTasks
                    ? overdueTasks.map((task) => (
                        <TodayTask
                            task={task}
                            key={`overdue-task-${task.id}`}
                            editClick={editTaskClick}
                            completeTaskClick={completeTaskClick}
                            deleteTaskClick={deleteTaskClick}
                            isOverdue
                        />
                    ))
                    : null
                }
            </div>

            <div id='display_options'>
                <Button variant='contained' size='large' id='addTaskButton' onClick={handleOpenModal}>Add Task</Button>
                <IconButton style={{ border: 'none', outline: 'none', color: 'white' }} onClick={() => { setIsCalendarView(false) }}>
                    <FormatListBulletedOutlinedIcon fontSize='large'/>
                </IconButton>

                <IconButton style={{ border: 'none', outline: 'none', color: 'white' }} onClick={() => { setIsCalendarView(true) }}>
                    <CalendarMonthOutlinedIcon fontSize='large'/>
                </IconButton>
            </div>
            
            { isCalendarView
                ? <div className='calendar-container'>
                    <CalendarView tasks={tasks} editClick={editTaskClick} />
                </div>
                : defaultTaskView }
            
        </main>

        {taskModal}

        <ConfirmModal
            title={confirmModalTitle ?? 'Confirm Action'}
            bodyText={confirmModalBody ?? ''}
            confirmModalOpen={confirmModalOpen}
            handleConfirm={handleConfirm}
            handleCloseConfirmModal={handleCloseConfirmModal}
        />

    </>
    )
}

export default Home