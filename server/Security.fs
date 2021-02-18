namespace Tasks

open System

module Security =

    // TODO: Hash passwords
    let verifyPassword (password: string) (hash: string) =
        let toBytes (str: string) = Text.Encoding.UTF8.GetBytes(str)
        Security.Cryptography.CryptographicOperations.FixedTimeEquals(ReadOnlySpan(password |> toBytes), ReadOnlySpan(hash |> toBytes))