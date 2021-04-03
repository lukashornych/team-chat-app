# Server API documentation

**WIP**

## REST API

<hr/>

<i>Soubor <b>'accounts.js'</b></i>

### ✔ POST /login
post - login

body
```
{
  username: '',
  password: ''
}
```
return jwt or cookie ???
also return full user object

return
```
➜ status 200 - OK
{
  token : tokentokentokentoken
}
      token body
      {
        id: id,
        username: username,
        name: name,
        role: role
      }


➜ status 500 - Internal Server Error
➜ status 400 - Bad Request
```
### ✔ POST /register
post - register

body
```
{
  code: '',
  name: '',
  username: '',
  password: ''
}
```
return
```
➜ status 200 - OK
➜ status 500 - Internal Server Error
➜ status 400 - unknown-code
➜ status 400 - user-exists
```

### ✔ PUT /updateAccount
put - update user account

body
```
{
  userId: 1,
  name: 'Name,
  username: 'username',
  newPassword: ''
}
```
return
```
➜ status 200 - OK
➜ status 500 - Internal Server Error
```

### ✔ PUT /updateAccountRole
put - update user role

body
```
{
  userId: 1,
  role: 'role1'
}
```
maybe merge with user update endpoint???

return
```
➜ status 200 - OK
➜ status 500 - Internal Server Error
```

### ✔ GET /getAllAccounts
get - list of all users

return
```
[
  {
    id: id,
    name: name,
    username: username,
    role: role
  },
]

{   // požadované, NEPLATÍ!
  text: 'Lukáš',
  value: 1
}
```
or full user objects

<hr/>

<i>Soubor <b>'channels.js'</b></i>



### ✔ POST /newChannel
post - new channel/group

body
```
{
  type: 'PRIVATE_GROUP' // or public channel
  name: 'group',
  description: 'desc',
  userIds: [...] // only for group
}
```
return
```
➜ status 200 - OK
➜ status 500 - Internal Server Error
➜ status 400 - Bad Request
```


<hr/>

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>


###??? get - list of users invitable to channel ???
- params
  - channelId

return
```
{
  text: 'Lukáš',
  value: 1
}
```
or full user objects

### post - submit new channel invitations
body
```
{
  channelId: 1,
  userIds: []
}
```


### put - edit channel/group
body
```
{
  name: 'channel',
  description: 'desc'
}
```

### get - list of all user's channels
- params: 
  - userId
  
return
```
{
  id: 1,
  name: 'Kanál A',
  description: 'Lorem ipsum',
  type: 'PUBLIC_CHANNEL'
}
```

### get - list of all user's channel invitations
- params
  - userId
  
return
```
{
  id: 1,
  channelName: 'Kanál F'
}
```

### post - accept channel invitation
body
```
{
  userId: 1,
  channelId: 2
}
```

### get - list all registration invitations
return
```
{
  code: 'aa',
  accepted: false
}
```



### post - generate new registration invitation
body empty



## Socket.io API
### emit new message
event name = `newMessage`
```
{
  channelId: 1,
  threadId: 2, // or null
  creatorId: 3,
  content: 'message'
}
```

### return new message
event name = `newMessage`
return full user object
