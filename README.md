# tasks

You will probably need to edit the password and location of the HTTPS certificate in `docker-compose.yml` (see [this](https://docs.microsoft.com/en-us/aspnet/core/security/docker-compose-https?view=aspnetcore-5.0)).
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
