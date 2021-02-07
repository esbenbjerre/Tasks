module Tasks.App

open System
open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Cors.Infrastructure
open Microsoft.AspNetCore.Hosting
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.Logging
open Microsoft.AspNetCore.Authentication.Cookies
open Microsoft.Extensions.DependencyInjection
open Giraffe
open Tasks.Models
open Tasks.HttpHandlers
open Tasks.Extensions
open System.Text.Json.Serialization

let authorize =
    authorizeRequest validateApiKey (setStatusCode 401 >=> json {Message = "Unauthorized"})

let webApp =
    let parsingError err = setStatusCode 400 >=> json {Message = err}
    choose [
        subRoute "/api"
            (choose [
                GET >=> authorize >=> choose [
                    route "/profile" >=> getProfile
                    route "/tasks" >=> getOpenTasks
                    route "/users" >=> getUsers
                    route "/groups" >=> getGroups
                ]
                POST >=> choose [
                    route "/login" >=> tryBindJson<LoginRequest> parsingError authenticate
                    authorize >=> subRoute "/tasks" (
                        choose [
                            route "/create" >=> tryBindJson<CreateTaskRequest> parsingError (validateModel createTask)
                            routef "/complete/%i" completeTask
                            routef "/delete/%i" deleteTask
                    ])
                ]
            ])
        setStatusCode 404 >=> json {Message = "Not found"}
        ]

let errorHandler (ex: Exception) (logger: ILogger) =
    logger.LogError(ex, "An unhandled exception has occurred while executing the request.")
    clearResponse >=> setStatusCode 500 >=> text ex.Message

let configureCors (builder: CorsPolicyBuilder) =
    builder
        .WithOrigins("http://localhost:3000", "http://localhost:5000", "https://localhost:5001")
        .AllowCredentials()
        .AllowAnyMethod()
        .AllowAnyHeader() |> ignore

let configureApp (app: IApplicationBuilder) =
    app.UseGiraffeErrorHandler(errorHandler)
        .UseHttpsRedirection()
        .UseCors(configureCors)
        .UseGiraffe(webApp)

let configureServices (services: IServiceCollection) =
    services.AddCors() |> ignore
    services.AddGiraffe() |> ignore
    let options = SystemTextJson.Serializer.DefaultOptions
    options.Converters.Add(JsonFSharpConverter(JsonUnionEncoding.FSharpLuLike))
    services.AddSingleton<Json.ISerializer>(SystemTextJson.Serializer(options)) |> ignore
    services.AddSingleton<UserService>() |> ignore

let configureLogging (builder: ILoggingBuilder) =
    builder.AddConsole()
        .AddDebug() |> ignore

[<EntryPoint>]
let main args =
    Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(
            fun webHostBuilder ->
                webHostBuilder
                    .Configure(Action<IApplicationBuilder> configureApp)
                    .ConfigureServices(configureServices)
                    .ConfigureLogging(configureLogging) |> ignore)
        .Build()
        .Run()
    0