module.exports = class Task {
  id = null;
  name = null;
  description = null;
  priority = null;
  created_at = null;
  deadline = null;
  completed_at = null;
  notify = 0;
  completed_by_userId = null;

  users = [];


  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.priority = data.priority;
    this.created_at = data.created_at;
    this.deadline = data.deadline;
    this.completed_at = data.completed_at;
    this.notify = data.notify;
    this.completed_by_userId = data.completed_by_userId;

    this.users = data.users;
  }

};