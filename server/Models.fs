namespace Tasks.Models

open System
open Giraffe

[<CLIMutable>]
type Message =
    {
        Message: string
    }

[<CLIMutable>]
type Identifiable =
    {
        Id: int
        Name: string
    }

[<CLIMutable>]
type LoginRequest =
    {
        Username: string
        Password: string
    }

[<CLIMutable>]
type LoginResponse =
    {
        ApiKey: string
    }

[<CLIMutable>]
type User =
    {
        Id: int
        Username: string
        Name: string
        Groups: string list
    }

[<CLIMutable>]
type CreateTaskRequest =
    {
        Description: string
        Deadline: int
        RecurringInterval: int
        AssignedGroup: int option
        AssignedUser: int
    }

    member this.HasErrors () =
        if this.Description.Length = 0 then Some "Description must be non-empty"
        else if this.Deadline > 0 && DateTimeOffset.FromUnixTimeSeconds(System.Convert.ToInt64(this.Deadline)).CompareTo(DateTimeOffset.Now) < 0 then Some "Deadline must be in the future"
        else if this.RecurringInterval < 0 then Some "A recurring task must specify a valid interval"
        else None

    interface IModelValidation<CreateTaskRequest> with
        member this.Validate() =
            match this.HasErrors() with
            | None -> Ok this
            | Some err -> Error (RequestErrors.badRequest (text err))

[<CLIMutable>]
type Task =
    {
        Id: int
        Description: string
        Completed: bool
        Deadline: int
        RecurringInterval: int
        AssignedGroup: string option
        AssignedUser: string
    }

type UserService() =
    [<DefaultValue>]
    val mutable user: User