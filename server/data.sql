INSERT INTO `group` (id, name) VALUES
    (0, 'DevOps'),
    (1, 'IT');

INSERT INTO `user` (id, username, name, hash, api_key) VALUES
    (0, 'sebastian', 'Sebastian', '1234', 'a5598889-fb30-425a-b056-3998d79d3700'),
    (1, 'oliver', 'Oliver', '1234', 'eaebc863-3182-4e1d-99d5-16ec7c65ccf7'),
    (2, 'matt', 'Matt', '1234', '9a736569-13d0-48fe-9bc9-6d90f237aa0e'),
    (3, 'max', 'Max', '1234', '285f24c6-c24b-4395-9af5-85d71b1fa9bd'),
    (4, 'ted', 'Ted', '1234', '13cd18fa-8032-484c-95fc-a11e322b4ee7'),
    (5, 'fred', 'Fred', '1234', '0b229f8b-7321-4334-a082-a4fb3f1b6df5'),
    (6, 'sam', 'Sam', '1234', 'bbd00092-5c15-4c3b-8071-6d45e89766d4'),
    (7, 'simon', 'Simon', '1234', '80f12480-b9c3-4304-803d-91a4d22108ae');

INSERT INTO `user_group` (id, user_id, group_id) VALUES
    (0, 0, 0),
    (1, 1, 0),
    (2, 2, 0),
    (3, 3, 0),
    (4, 4, 0),
    (5, 5, 1),
    (6, 6, 1),
    (7, 7, 1);

INSERT INTO `task` (id, description, completed, deleted, deadline, recurring_interval, assigned_group, assigned_user) VALUES
    (0, 'Daily stand-up (DevOps)', 0, 0, 1609495200, 2, 0, 0),
    (1, 'Daily stand-up (IT)', 0, 0, 1609498800, 2, 1, 5),
    (2, 'Clean desk policy', 0, 0, 1612368000, 2, NULL, 0),
    (3, 'Clean desk policy', 0, 0, 1612368000, 2, NULL, 1),
    (4, 'Clean desk policy', 0, 0, 1612368000, 2, NULL, 2),
    (5, 'Clean desk policy', 0, 0, 1612368000, 2, NULL, 3),
    (6, 'Clean desk policy', 0, 0, 1612368000, 2, NULL, 4),
    (7, 'Security audit', 0, 0, 1612368000, 0, 1, 6),
    (8, 'Update password for service X', 0, 0, 1612368000, 4, 0, 0),
    (9, 'Kubernetes maintenance', 0, 0, 1612368000, 0, 0, 1),
    (10, 'Matt tech demo', 0, 0, 1612368000, 0, 0, 2);