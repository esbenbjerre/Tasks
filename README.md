# tasks

You will probably need to create a self-signed certificate (see [this](https://docs.microsoft.com/en-us/dotnet/core/additional-tools/self-signed-certificates-guide)) and edit the location and password of the HTTPS certificate in `docker-compose.yml` accordingly (see [this](https://docs.microsoft.com/en-us/aspnet/core/security/docker-compose-https?view=aspnetcore-5.0)).
```
- ASPNETCORE_Kestrel__Certificates__Default__Password=secret
- ASPNETCORE_Kestrel__Certificates__Default__Path=/https/server.pfx
```

```
$ docker-compose build
$ docker-compose up
```

## Example data

Example data is in `/server/data.db`. Try logging in with `sebastian:1234`.