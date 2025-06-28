# Final Team Project

## TidyTogether
Deployed on an AWS EC2 instance here: [http://18.208.153.191/](url)

## Progress Report

### Completed Features

* Login
* Logout
* Register new user
* Create a task
* Weekly view for tasks
* Calendar view for tasks
* Completing tasks
* Join and create a household
* Profile statistics
* Remove users and generate join codes (Admin only)
* Task editing
* Offline functions

### Known Issues & Limitations

* Settings
* Deleting an account
* Printing chore chart
* Limited calendar view
* Unable to edit synced tasks offline


## Authentication & Authorization

Users are authenticated using token authentication. After providing proper username and password credentials, passwords are hashed with a user-unique salt and compared to hashed passwords stored on the MariaDB database. Tokens are generated using JWT standards and given 15 minute expirations. When a user logs out or another user decides to log in, the token is removed from the browser and (if applicable) replaced. If at any point a user’s token fails authentication, it is deleted immediately and the user will be required to login again.

Many API functions requiring authorization will verify the validity of this token and restrict the user access. Users can only access limited information about other users using API routes that include userId parameters, while routes with more information will rely on correct tokens information to continue. These tokens are also secure and HTTPonly, which restricts the ability of hackers to access them with cross-site scripting attacks.


## PWA Capabilities

| Page                   | PWA Capabilities                       |      
|------------------------|----------------------------------------|
| Home (Weekly/Calendar) | Create, edit, delete, & complete tasks | 
| Profile                | Cacheable                              |
| Household              | Cacheable                              |
| Login/Register         | Online only                            |
| Settings               | Online only                            |

While offline, users have the ability to access pages previously visited through the use of a service worker and caching. An IndexedDB database also exists on the front end to allow the user to perform basic task operations such as creating, editing, deleting, and completing a task. To avoid potential merge conflicts with different devices (or for shared tasks, different users), this implementation limits the user to these operations on tasks created while offline. Once online, current and completed tasks created offline sync with the server and are removed from the IndexedDB database. The npm idb library is used to simplify some of the IndexedDB logic to a promise-based syntax, similar to many APIs discussed in this course. Users also have the ability to install the application onto their devices.


## API Documentation

| Method | Route                          	| Description |
|--------|------------------------------------|-------------|
| GET	| /household                     	| Returns the current users households data, including all other users in an array |
| DELETE | /household/users/:userId       	| Removes a user from a household, only admins may use this endpoint |
| DELETE | /household/leave               	| Lets the current user leave their household, only members can use this endpoint (not admin) |
| POST   | /household                     	| The current user can create a new household if they are not currently part of one.  |
| DELETE | /household                     	| Removes the current users household, the associated tasks, and all members will no longer be part of a household|
| POST   | /household/join                	| A user who is not part of a household can join a household using a join code |
| PUT	| /household/join                	| Admin can regenerate a new random join code |
| GET	| /household/join                	| Admin can retrieve their households join code|
| PUT	| /household/admin/:userId       	| Admin can set another user as admin  |
| POST   | /login                         	| Login |
| POST   | /register                      	| Register a new user |
| POST   | /logout                        	| Logout |
| GET	| /users/current                 	| Retrieve the current user |
| GET	| /users                         	| Retrieve a list of all users, this will not be used in the application and is for testing only. |
| GET	| /users/:userId([0-9]+)         	| Get a user and an array of all incomplete tasks associated with them by id |
| GET	| /users/:username               	| Get a user and array of all incomplete tasks associated with them by username |
| PUT	| /account		                 	| Update a users info  |
| DELETE | /account	                 	| Deletes a users account |
| GET	| /search                        	| Retrieves a user by their username. This will not be used in the application and is for testing. |
| GET	| /tasks/current                 	| Retrieve a list of all tasks associated with the current user |
| POST   | /tasks                         	| Create a new task  |
| GET	| /tasks/:taskId                 	| Get a specific task |
| DELETE | /tasks/:taskId                 	| Delete a task |
| PUT	| /tasks/:taskId                 	| Edit a task |
| PUT	| /tasks/complete/:taskId        	| Mark a task as complete|
| GET | /users/:userId/tasks/late/count	| Retrieves the number of tasks that are completed late |
| GET | /users/:userId/tasks/incomplete	| Retrieves the number of tasks that are incomplete |
| GET | /users/:userId/tasks/rate		| Retrieves the % of shared tasks completed on time |
| GET | /users/:userId/tasks/late		| Retrieves an array of all the tasks that are currently late |

## Database ER Diagram

![](https://github.ncsu.edu/engr-csc342/csc342-2025Spring-TeamC/blob/main/Milestone2/342_milestone2_ER.png)
