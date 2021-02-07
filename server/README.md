# Usage

```
dotnet restore
dotnet run
```

## Examples

### Get a list of all tasks
```
curl http://localhost:5000/api/tasks
```

### Add a task
```
curl http://localhost:5000/api/tasks/create --data '{"description": "Clean server room", "completed": false, "deadline": 1609495200, "recurring": false, "interval": 0, "assignedGroup": null, "assignedUser": 0}'
```

### Complete a task with error (not assigned to user)
```
curl http://localhost:5000/api/tasks/complete/0 --data '' -H "X-API-Key: eaebc863-3182-4e1d-99d5-16ec7c65ccf7"
```

### Complete a task successfully
```
curl http://localhost:5000/api/tasks/complete/0 --data '' -H "X-API-Key: a5598889-fb30-425a-b056-3998d79d3700"
```