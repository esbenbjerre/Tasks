namespace Tasks

module HttpHandlers =

    open System
    open Microsoft.AspNetCore.Http
    open FSharp.Control.Tasks
    open Giraffe
    open Tasks.Models

    // TODO: Use hashed and salted passwords
    // TODO: Move this to a security module
    let verifyPassword (password: string) (hash: string) =
        let toBytes (str: string) = Text.Encoding.UTF8.GetBytes(str)
        Security.Cryptography.CryptographicOperations.FixedTimeEquals(ReadOnlySpan(password |> toBytes), ReadOnlySpan(hash |> toBytes))

    let authenticate (request: LoginRequest) =
        fun (next: HttpFunc) (ctx: HttpContext) -> task {
            let invalidUsernameOrPassword = {Message = "Invalid username or password"}
            match Database.getUserHash request.Username with
            | None -> return! (setStatusCode 401 >=> json invalidUsernameOrPassword) next ctx
            | Some hash ->
                if verifyPassword request.Password hash then
                    match Database.getUserApiKey request.Username with
                    | None -> return! (setStatusCode 500 >=> json {Message = "No API key for user"}) next ctx
                    | Some key ->
                        // TODO: Make cookies work
                        let cookieOptions = CookieOptions()
                        cookieOptions.HttpOnly <- true
                        cookieOptions.Domain <- "localhost"
                        cookieOptions.IsEssential <- true
                        cookieOptions.Expires <- DateTimeOffset.Now.AddDays(1.0)
                        ctx.Response.Cookies.Append("apiKey", key, cookieOptions)
                        return! json {ApiKey = key} next ctx
                else
                    return! (setStatusCode 401 >=> json invalidUsernameOrPassword) next ctx
        }

    let validateApiKey (ctx : HttpContext) =
        match ctx.TryGetRequestHeader "X-API-Key" with
        | None -> false
        | Some key ->
            match Database.getUserFromApiKey key with
            | None -> false
            | Some user ->
                let userService = ctx.GetService<UserService>()
                userService.user <- user
                true

    let getProfile =
        fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            let user = ctx.GetService<UserService>().user
            return! json user next ctx
        }

    let getOpenTasks =
        fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            let user = ctx.GetService<UserService>().user
            return! json (Database.getOpenTasks user) next ctx
        }

    let getUsers =
        fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            return! json (Database.getUsers ()) next ctx
        }

    let getGroups =
        fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            return! json (Database.getGroups ()) next ctx
        }

    let createTask (t: CreateTaskRequest) =
        fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            Database.createTask t
            return! json {Message = "Task created successfully"} next ctx
        }

    let completeTask (id: int) =
        fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            match Database.getTask id |> List.tryHead with
            | None -> return! (setStatusCode 400 >=> json {Message = "Task does not exist"}) next ctx
            | Some t ->
                if t.Completed then
                    return! (setStatusCode 400 >=> json {Message = "Task is already completed"}) next ctx
                else
                    let user = ctx.GetService<UserService>().user
                    match Database.getAssignedUser id with
                    | None -> return! json {Message = "Unable to determine assigned user"} next ctx
                    | Some assignedUserId ->
                        if assignedUserId = user.Id then
                            Database.completeTask id (t.RecurringInterval > 0)
                            return! json {Message = "Task marked as complete"} next ctx
                        else
                            return! (setStatusCode 400 >=> json {Message = "You cannot complete a task assigned to someone else"}) next ctx
        }
    
    let deleteTask (id: int) =
        fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            let user = ctx.GetService<UserService>().user
            match Database.getAssignedUser id with
            | None -> return! json {Message = "Unable to determine assigned user"} next ctx
            | Some assignedUserId ->
                if assignedUserId = user.Id then
                    Database.deleteTask id
                    return! json {Message = "Task deleted successfully"} next ctx
                else
                    return! (setStatusCode 400 >=> json {Message = "You cannot delete a task assigned to someone else"}) next ctx
        }