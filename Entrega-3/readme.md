# Server.js

very raw file, just have the /join, /leave and register. the users are stored in the `users.json`file.



# To run

### installation

```shell
npm install express
```



### run

```shell
node server.js
```



## Example of a request

```
POST: http://localhost:3000/leave
```

```json
BODY: 
{"nick": "rick",
"password":
"morty", "game":
"WsEnUH2Q" }
```

```json
{
    "message": "Player left the game successfully"
}
```


