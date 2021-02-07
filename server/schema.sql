CREATE TABLE IF NOT EXISTS `user` (
    id INTEGER PRIMARY KEY,
    username TEXT,
    name TEXT,
    hash TEXT,
    api_key TEXT
);
CREATE TABLE IF NOT EXISTS `group` (
    id INTEGER PRIMARY KEY,
    name TEXT
);
CREATE TABLE IF NOT EXISTS `user_group` (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    group_id INTEGER,
    FOREIGN KEY(`user_id`) REFERENCES `user`(`id`),
    FOREIGN KEY(`group_id`) REFERENCES `group`(`id`)
);
CREATE TABLE IF NOT EXISTS `task` (
    id INTEGER PRIMARY KEY, 
    description TEXT,
    completed INT(1) DEFAULT 0,
    deleted INT(1) DEFAULT 0,
    deadline INTEGER,
    recurring_interval INTEGER,
    assigned_group INTEGER,
    assigned_user INTEGER,
    FOREIGN KEY(`assigned_group`) REFERENCES `group`(`id`),
    FOREIGN KEY(`assigned_user`) REFERENCES `user`(`id`)
);