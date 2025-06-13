module.exports.tasks = {
    data: [
        {
            "id": 1,
            "name": "Take the trash out.",
            "description": "Must be done very Monday night.",
            "date": "2025-05-01",
            "time": "14:30:00",
            "users": [
                1, 2, 3
            ],
            "rotate": "on",
            "notify": "on",
            "priority": "urgent"
        },
        
        {
            "id": 2,
            "name": "Do the dishes",
            "description": "",
            "date": "2025-05-01",
            "time": "14:30:00",
            "users": [
                8, 9
            ],
            "rotate": "on",
            "notify": "on",
            "priority": "urgent"
        },

        {
            "id": 3,
            "name": "Take out the trash!!",
            "description": "",
            "date": "2025-05-01",
            "time": "23:59:59",
            "users": [
                4, 5, 6, 7
            ],
            "rotate": "on",
            "notify": "on",
            "priority": "urgent"
        },

        {
            "id": 4,
            "name": "Clean bathroom",
            "description": "",
            "date": "2025-05-01",
            "time": "23:59:59",
            "users": [
                4, 6
            ],
            "rotate": "on",
            "notify": "on",
            "priority": "default"
        },

        {
            "id": 5,
            "name": "Clean shower",
            "description": "we might need shampoo",
            "date": "2025-05-01",
            "time": "23:59:59",
            "users": [
                5, 7
            ],
            "rotate": "on",
            "notify": "on",
            "priority": "urgent"
        },

        {
            "id": 6,
            "name": "Go gym",
            "description": "Text Tyler a reminder",
            "date": "2025-05-01",
            "time": "23:59:59",
            "users": [
                2
            ],
            "rotate": "off",
            "notify": "off",
            "priority": "low"
        },

        {
            "id": 7,
            "name": "Pickup Mateo from school",
            "description": "",
            "date": "2025-05-01",
            "time": "23:59:59",
            "users": [
                2, 3
            ],
            "rotate": "on",
            "notify": "on",
            "priority": "default"
        },

        {
            "id": 8,
            "name": "Hair Stylist Appointment",
            "description": "Cash only",
            "date": "2025-05-01",
            "time": "23:59:59",
            "users": [
                1
            ],
            "rotate": "off",
            "notify": "on",
            "priority": "urgent"
        },

        {
            "id": 9,
            "name": "Water plants",
            "description": "Succulents are every other week",
            "date": "2025-05-01",
            "time": "23:59:59",
            "users": [
                8, 9
            ],
            "rotate": "on",
            "notify": "on",
            "priority": "default"
        },

        {
            "id": 10,
            "name": "study group for CSC 316",
            "description": "finish Written workshop component",
            "date": "2025-05-01",
            "time": "23:59:59",
            "users": [
                8
            ],
            "rotate": "off",
            "notify": "on",
            "priority": "default"
        },

        {
            "id": 11,
            "name": "Physic hw",
            "description": "Ch. 11 Pt. 3 Problems",
            "date": "2025-05-01",
            "time": "23:59:59",
            "users": [
                9
            ],
            "rotate": "off",
            "notify": "on",
            "priority": "urgent"
        },

        {
            "id": 12,
            "name": "Sit in the lounge and randomly share obscure facts",
            "description": "hehe",
            "date": "2025-05-01",
            "time": "23:59:59",
            "users": [
                9
            ],
            "rotate": "off",
            "notify": "off",
            "priority": "low"
        },

        {
            "id": 13,
            "name": "Call mom",
            "description": "",
            "date": "2025-05-01",
            "time": "23:59:59",
            "users": [
                4
            ],
            "rotate": "on",
            "notify": "on",
            "priority": "urgent"
        },

        {
            "id": 14,
            "name": "Update direct deposit info in Workday",
            "description": "30% Savings 70% Checking",
            "date": "2025-05-01",
            "time": "23:59:59",
            "users": [
                1
            ],
            "rotate": "off",
            "notify": "on",
            "priority": "urgent"
        },

        {
            "id": 15,
            "name": "Lunch date",
            "description": "Neomonde ",
            "date": "2025-05-01",
            "time": "23:59:59",
            "users": [
                5, 6
            ],
            "rotate": "off",
            "notify": "on",
            "priority": "urgent"
        }
    ]
}


module.exports.users = {
    data: [
        {
            "id": 1,
            "name": "Jackie Ruiz",
            "role": "Admin",
            "household": 1,
            "tasks": [
                1, 8, 14
            ],
            "tasks-completed": 10
        },

        {
            "id": 2,
            "name": "Angel Ruiz",
            "role": "Member",
            "household": 1,
            "tasks": [
                1, 6, 7
            ],
            "tasks-completed": 7
        },
        
        {
            "id": 3,
            "name": "Valentin Ruiz",
            "role": "Member",
            "household": 1,
            "tasks": [
                1, 7
            ],
            "tasks-completed": 9
        },

        {
            "id": 4,
            "name": "Alyssa",
            "role": "Member",
            "household": 2,
            "tasks": [
                3, 4, 13
            ],
            "tasks-completed": 12
        },

        {
            "id": 5,
            "name": "Brianna",
            "role": "Admin",
            "household": 2,
            "tasks": [
                3, 5, 15
            ],
            "tasks-completed": 15
        },

        {
            "id": 6,
            "name": "Katie",
            "role": "Member",
            "household": 2,
            "tasks": [
                3, 4, 15
            ],
            "tasks-completed": 11
        },

        {
            "id": 7,
            "name": "Jennie",
            "role": "Member",
            "household": 2,
            "tasks": [
                3, 5
            ],
            "tasks-completed": 13
        },

        {
            "id": 8,
            "name": "Nick Sutton",
            "role": "Admin",
            "household": 3,
            "tasks": [
                2, 9, 10
            ],
            "tasks-completed": 16
        },

        {
            "id": 9,
            "name": "Ryder Trew",
            "role": "Member",
            "household": 3,
            "tasks": [
                2, 9, 11, 12
            ],
            "tasks-completed": 20
        }
    ]
}

module.exports.households = {
    data: [
        {
            "id": 1,
            "name": "The Ruiz Household",
            "users": [
                1, 2, 3
            ]
        },
        
        {
            "id": 2,
            "name": "Valentine's Commons Apt. 103",
            "users": [
                4, 5, 6, 7
            ]
        },

        {
            "id": 3,
            "name": "Nick & Ryder",
            "users": [
                8, 9
            ]
        }
    ]
}