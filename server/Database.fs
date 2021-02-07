namespace Tasks

open System
open Microsoft.Data.Sqlite
open Tasks.Models

module Database =
    [<Literal>]
    let private ConnectionString = "Data Source=data.db;foreign keys=true;"

    let private executeQuery (query: string) (mapper: SqliteParameterCollection -> unit) =
        use connection = new SqliteConnection(ConnectionString)
        connection.Open()
        use txn: SqliteTransaction = connection.BeginTransaction()
        let cmd = connection.CreateCommand()
        cmd.Transaction <- txn
        cmd.CommandText <- query
        mapper(cmd.Parameters)
        cmd.ExecuteNonQuery() |> ignore
        txn.Commit()

    let private readQuery (query: string) (mapper: SqliteParameterCollection -> unit) (reader: SqliteDataReader -> 'a) =
        use connection = new SqliteConnection(ConnectionString)
        connection.Open()
        let cmd = connection.CreateCommand()
        cmd.CommandText <- query
        mapper(cmd.Parameters)
        use dataReader = cmd.ExecuteReader()
        seq {
            while dataReader.Read() do
            yield reader(dataReader)
        }
        |> Seq.toList

    let identifiableReader (r: SqliteDataReader) =
        {
            Id = Convert.ToInt32(r.["id"])
            Name = Convert.ToString(r.["name"])
        }

    let private taskReader (r: SqliteDataReader) =
            {
                Id = Convert.ToInt32(r.["id"]);
                Description = Convert.ToString(r.["description"]);
                Completed = Convert.ToBoolean(r.["completed"]);
                Deadline = Convert.ToInt32(r.["deadline"]);
                RecurringInterval = Convert.ToInt32(r.["recurring_interval"]);
                AssignedGroup =
                    if (Convert.IsDBNull(r.["assigned_group"])) then
                        None
                    else
                        Some (Convert.ToString(r.["assigned_group"]));
                AssignedUser = Convert.ToString(r.["assigned_user"])
            }

    let getUserHash (username: string) =
        let mapper (p: SqliteParameterCollection) =
            p.AddWithValue("$username", username) |> ignore
        let reader (r: SqliteDataReader) = Convert.ToString(r.["hash"])
        readQuery @"
            SELECT hash
            FROM `user`
            WHERE username = $username LIMIT 1
            " mapper reader |> List.tryHead

    let getUserApiKey (username: string) =
        let mapper (p: SqliteParameterCollection) =
            p.AddWithValue("$username", username) |> ignore
        let reader (r: SqliteDataReader) = Convert.ToString(r.["api_key"])
        readQuery @"
            SELECT api_key
            FROM `user`
            WHERE username = $username LIMIT 1
            " mapper reader |> List.tryHead

    let getUserFromApiKey (key: string) =
        let userReader (r: SqliteDataReader) =
            {
                Id = Convert.ToInt32(r.["id"])
                Username = Convert.ToString(r.["username"])
                Name = Convert.ToString(r.["name"])
                Groups = []
            }
        let userMapper (p: SqliteParameterCollection) = p.AddWithValue("$key", key) |> ignore
        let user = readQuery @"
            SELECT *
            FROM user
            WHERE api_key = $key LIMIT 1" userMapper userReader
        match List.tryHead user with
        | None -> None
        | Some u ->
            let groupMapper (p: SqliteParameterCollection) = p.AddWithValue("$id", u.Id) |> ignore
            let groups = readQuery @"
                SELECT
                    g.name FROM `group` g
                JOIN `user_group` ug on g.id = ug.group_id
                WHERE ug.user_id = $id" groupMapper (fun r -> Convert.ToString(r.["name"]))
            Some {u with Groups = groups}

    let getTask (id: int) =
        let mapper (p: SqliteParameterCollection) =
            p.AddWithValue("$id", id) |> ignore
        readQuery @"
            SELECT *
            FROM task
            WHERE id = $id LIMIT 1" mapper taskReader

    let getOpenTasks (user: User) =
        let mapper (p: SqliteParameterCollection) =
            p.AddWithValue("$user", user.Id) |> ignore
        readQuery @"
            SELECT
                t.id, t.description, t.completed, t.deadline, t.deadline, t.recurring_interval, 
                COALESCE(g.name, '') AS assigned_group,
                CASE WHEN u.id = $user THEN 'you' ELSE u.name END AS assigned_user
            FROM `task` t
            LEFT JOIN `group` g ON t.assigned_group = g.id
            LEFT JOIN `user` u ON t.assigned_user = u.id
            WHERE t.completed = 0 AND t.deleted = 0 AND (t.assigned_user = $user OR t.assigned_group
            IN (SELECT group_id from `user_group` WHERE user_id = $user))
            ORDER BY description ASC" mapper taskReader

    let createTask (task: CreateTaskRequest) =
        let mapper (p: SqliteParameterCollection) =
            p.AddWithValue("$description", task.Description) |> ignore
            p.AddWithValue("$deadline", task.Deadline) |> ignore
            p.AddWithValue("$recurring_interval", task.RecurringInterval) |> ignore
            match task.AssignedGroup with
                | None -> p.AddWithValue("$assigned_group", Convert.DBNull) |> ignore
                | Some group -> p.AddWithValue("$assigned_group", group) |> ignore
            p.AddWithValue("$assigned_user", task.AssignedUser) |> ignore
        executeQuery @"
            INSERT INTO `task`
                (id, description, completed, deadline, recurring_interval, assigned_group, assigned_user)
            VALUES
                (NULL, $description, 0, $deadline, $recurring_interval, $assigned_group, $assigned_user)" mapper

    let getAssignedUser (id: int) =
        readQuery @"
        SELECT assigned_user
        FROM `task`
        WHERE id = $id" (fun p -> p.AddWithValue("$id", id) |> ignore) (fun r -> Convert.ToInt32(r.["assigned_user"]))
        |> List.tryHead

    let completeTask (id: int) (recurring: bool) =
        if (recurring) then
            executeQuery @"
                INSERT INTO `task`
                    (description, deadline, recurring_interval, assigned_group, assigned_user)
                SELECT description,
                    (SELECT CASE
                        WHEN recurring_interval = 0 THEN 0
                        WHEN recurring_interval = 1 THEN STRFTIME('%s', deadline, 'unixepoch', '+1 hour')
                        WHEN recurring_interval = 2 THEN STRFTIME('%s', deadline, 'unixepoch', '+1 day')
                        WHEN recurring_interval = 3 THEN STRFTIME('%s', deadline, 'unixepoch', '+7 day')
                        WHEN recurring_interval = 4 THEN STRFTIME('%s', deadline, 'unixepoch', '+1 month')
                        WHEN recurring_interval = 5 THEN STRFTIME('%s', deadline, 'unixepoch', '+1 year')
                    END AS deadline
                    FROM `task` WHERE id = $id),
                recurring_interval, assigned_group, assigned_user
                FROM `task`
                WHERE id = $id" (fun p -> p.AddWithValue("$id", id) |> ignore)
        executeQuery @"
            UPDATE `task`
            SET completed = 1
            WHERE id = $id" (fun p -> p.AddWithValue("$id", id) |> ignore)

    let deleteTask (id: int) =
        let mapper (p: SqliteParameterCollection) = p.AddWithValue("$id", id) |> ignore
        executeQuery @"
            UPDATE task SET deleted = 1 WHERE id = $id" mapper

    let getUsers () =
        readQuery @"
            SELECT
                id, name
            FROM `user`" ignore identifiableReader

    let getGroups () =
        readQuery @"
            SELECT
                id, name
            FROM `group`" ignore identifiableReader