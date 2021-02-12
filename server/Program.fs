module Tasks.App

open System
open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Cors.Infrastructure
open Microsoft.AspNetCore.Hosting
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.Logging
open Microsoft.Extensions.DependencyInjection
open Giraffe
open Tasks.Models
open Tasks.UserService
open Tasks.HttpFilters
open Tasks.HttpHandlers
open Tasks.Extensions
open System.Text.Json.Serialization
open FSharp.Data.Dapper

let webApp =
    let parsingError message = setStatusCode 400 >=> json {Message = message}
    choose [
        subRoute "/api"
            (choose [
                GET >=> authorizeWithApiKey >=> choose [
                    route "/profile" >=> User.getProfile
                    route "/tasks" >=> Task.getAllOpen
                    route "/users" >=> User.getAll
                    route "/groups" >=> Group.getAll
                ]
                POST >=> choose [
                    route "/login" >=> tryBindJson<LoginRequest> parsingError User.authenticate
                    authorizeWithApiKey >=> subRoute "/tasks" (
                        choose [
                            route "/create" >=> tryBindJson<CreateTaskRequest> parsingError (validateModel Task.create)
                            routef "/complete/%i" (fun id -> canModifyTask id >=> Task.complete id)
                            routef "/delete/%i" (fun id -> canModifyTask id >=> Task.delete id)
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

    // Allow optional types in models
    OptionHandler.RegisterTypes()
    // Allow tables with column_name to map to records with ColumnName
    Dapper.DefaultTypeMap.MatchNamesWithUnderscores <- true

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