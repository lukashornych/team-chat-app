# Server API documentation

**WIP**

## REST API
### get - list of users invitable to channel
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

### get - list of all users
return
```
{
  text: 'Lukáš',
  value: 1
}
```
or full user objects

### post - new channel/group
body
```
{
  type: 'PRIVATE_GROUP' // or public channel
  name: 'group',
  description: 'desc',
  userIds: [...] // only for group
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

### put - update user account 
body
```
{
  userId: 1,
  name: 'Name,
  username: 'username',
  newPassword: ''
}
```

### put - update user role
body
```
{
  userId: 1,
  role: ''
}
```
maybe merge with user update endpoint???

### post - generate new registration invitation
body empty

### post - login
body
```
{
  username: '',
  password: ''
}
```
return jwt or cookie ???
also return full user object

###  post - register
body
```
{
  code: '',
  name: '',
  username: '',
  password: ''
}
```

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
