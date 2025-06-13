const crypto = require('crypto');

module.exports = class User {
  id = null;
  first_name = null;
  last_name = null;
  username = null;
  hh_id = null;
  role = null;
  numCompleted = 0;

   // name, description, priority, deadline, notify
  tasks = [];

  #passwordHash = null;;
  #salt = null;;


  constructor(data) {
   
    this.id = data.id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.username = data.username;
    this.hh_id = data.hh_id;
    this.numCompleted = data.numCompleted;
    this.role = data.role;

    this.tasks = data.tasks;
   

    this.#salt = data.salt;
    this.#passwordHash = data.hashedPassword;
  }

  validatePassword(password) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, this.#salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) { //problem computing digest, like hash function not available
         reject("Error: " + err);
        }

        const digest = derivedKey.toString('hex');
        if (this.#passwordHash == digest) {
          resolve(this);
        }
        else {
          reject("Invalid username or password");
        }
      });
    });
  }

  toJSON() {
    return {
      id: this.id,
      hh_id: this.hh_id,
      username: this.username,
      role: this.role,      
      numCompleted: this.numCompleted,

      first_name: this.first_name,
      last_name: this.last_name,
      tasks: this.tasks,
      
    }
  }
/*
  toJSON() {
    return {
      "id": this.id,
      "first_name": this.first_name,
      "last_name": this.last_name,
      "username": this.username,
      
      "role": this.role,
      "hh_id": this.hh_id,
      "numCompleted": this.numCompleted,
      
    }
  }*/
};