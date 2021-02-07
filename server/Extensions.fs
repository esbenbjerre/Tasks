namespace Tasks

open Microsoft.AspNetCore.Http
open Giraffe
open Microsoft.Extensions.Logging
open FSharp.Control.Tasks

module Extensions =
    let tryBindJson<'T> (parsingErrorHandler: string -> HttpHandler) (successHandler: 'T -> HttpHandler): HttpHandler =
        fun (next : HttpFunc) (ctx : HttpContext) ->
            task {
                    try
                        let! model = ctx.BindJsonAsync<'T>()
                        return! successHandler model next ctx
                    with ex ->
                        let logger = ctx.GetLogger()
                        logger.LogWarning (ex |> string)
                        return! parsingErrorHandler "Malformed request or missing field in request body" next ctx
                }