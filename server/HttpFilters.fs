namespace Tasks

module HttpFilters =

    open System.Threading.Tasks
    open Microsoft.AspNetCore.Http
    open FSharp.Control.Tasks
    open Giraffe
    open Tasks.UserService
    open Tasks.Models

    let authorizeWithApiKey: HttpHandler =
        fun (next : HttpFunc) (ctx : HttpContext) ->
            task {
                let unauthorizedHandler = (setStatusCode 401 >=> json {Message = "Unauthorized"})
                match ctx.TryGetRequestHeader "X-API-Key" with
                | None -> return! unauthorizedHandler earlyReturn ctx
                | Some key ->
                    match! Database.Queries.User.getUserByApiKey key with
                    | None -> return! unauthorizedHandler earlyReturn ctx
                    | Some user ->
                        let userService = ctx.GetService<UserService>()
                        userService.user <- user
                        return! next ctx
                }

    let canModifyTask (id: int): HttpHandler =
        fun (next : HttpFunc) (ctx : HttpContext) ->
            task {
                let notAssignedToUserHandler = (setStatusCode 401 >=> json {Message = "You are not allowed to modify this task"})
                match! Database.Queries.Task.getAssignedUser id with
                | None -> return! notAssignedToUserHandler earlyReturn ctx
                | Some userId ->
                    let userService = ctx.GetService<UserService>()
                    if userService.user.Id <> userId then
                        return! notAssignedToUserHandler earlyReturn ctx
                    else
                        return! next ctx
                }