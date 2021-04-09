# Server API documentation

**WIP**

## REST API

Needs <code>.env</code> in root folder, example below.
```
PORT=3000

DB_HOST=localhost
DB_PORT=33061
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=team-chat-app

TOKEN_PRIVATE=FwF4DIJcOs5dqRFfIbwPryyIi3GjiaeBJydlszOyywoHeEaTKE2MbtxJztu20TIV    #maybe 64bit
TOKEN_REFRESH=LpIerAclzm5cpU8SHx2M1ERp100Tlm1evYLVY5pkALtlfDkMA8niyPhI0xMEfkAD    #maybe 64bit, in this moment unused
```

<i>Soubor <b>'accounts.js'</b></i>

### ✔ POST /login
post - login

***Body:***
```
{
  username: '',
  password: ''
}
```
return jwt or cookie ???
also return full user object

***Return:***
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
➜ status 403 - Forbidden
```
### ✔ POST /register
post - register

***Body:***
```
{
  code: '',
  name: '',
  username: '',
  password: ''
}
```
***Return:***
```
➜ status 200 - OK
➜ status 500 - Internal Server Error
➜ status 400 - unknown-code
➜ status 400 - user-exists
```

### ✔ PUT /updateAccount
**➜ needs token authentication**<br/>
**➜ role: ALL**<br/>
Pouze admin může změnit role.

put - update user account

***Body:***
```
{
  userId: 1,
  name: 'Name,            // OPTIONAL, at least 1 of folowing
  username: 'username',   // OPTIONAL, at least 1 of folowing
  newPassword: ':)',      // OPTIONAL, at least 1 of folowing
  role: 'MODERATOR'       // OPTIONAL, at least 1 of folowing
}
```
***Return:***
```
➜ status 200 - OK
➜ status 500 - Internal Server Error
➜ status 400 - Bad Request
➜ status 403 - Forbidden
```

### ✔ PUT /updateAccountRole  -> MAYBE WILL GO AWAY
**➜ needs token authentication**<br/>

put - update user role

***Body:***
```
{
  userId: 1,
  role: 'role1'
}
```
maybe merge with user update endpoint???

***Return:***
```
➜ status 200 - OK
➜ status 500 - Internal Server Error
➜ status 400 - Bad Request
```

### ✔ GET /getAllAccounts
**➜ needs token authentication**<br/>

get - list of all users

***Return:***
```
➜ status 200 - OK
[
  {
    id: id,
    name: name,
    username: username,
    role: role
  },
]

➜ status 500 - Internal Server Error
➜ status 403 - Forbidden
```
{ 
text: 'Lukáš',
value: 1
}
or full user objects





<hr/>





<i>Soubor <b>'channels.js'</b></i>



### ✔ POST /createChannel  -> WILL BE CHANGED TO /createChannel
**➜ needs token authentication**<br/>
**➜ role: ALL**<br/>
Moderator, Admin - PUBLIC_CHANNEL<br/>
ALL - PRIVATE_CHANNEL<br/>

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
➜ status 403 - Forbidden
```

### ✔ PUT /updateChannel
**➜ needs token authentication**<br/>
**➜ role: ALL**<br/>
Moderator, Admin - PUBLIC_CHANNEL<br/>
ALL - PRIVATE_CHANNEL<br/>

put - edit channel/group

***Body:*** - ZMĚNA! (přidáno ID channelu)
```
{
  id: '12'
  name: 'channel',        // OPTIONAL, at least 1 of folowing
  description: 'desc'     // OPTIONAL, at least 1 of folowing
}
```
***Return:***
```
➜ status 200 - OK
➜ status 500 - Internal Server Error
➜ status 400 - Bad Request
➜ status 403 - Forbidden
```

### ✔ GET /getChannels
**➜ needs token authentication**<br/>
**➜ Gets logged in user's ID.**<br/>

get - list of all user's channels

***Return:***
```
➜ status 200 - OK
  [
    {
      id: 1,
      name: 'Kanál A',
      description: 'Lorem ipsum',
      type: 'PUBLIC_CHANNEL'
    }
  ]

➜ status 500 - Internal Server Error
➜ status 403 - Forbidden
```

### ✔ GET /getChannelInvitations
**➜ needs token authentication**<br/>
**➜ Gets logged in user's ID.**<br/>


get - list of all user's channel invitations


***Return:***
```
➜ status 200 - OK
  [
    {
      id: 1,
      channelName: 'Kanál F'
    }
  ]
  
➜ status 500 - Internal Server Error
➜ status 403 - Forbidden
```

### ✔ POST /acceptChannelInvitation
**➜ needs token authentication**<br/>

post - accept channel invitation

***Body:***
```
{
  userId: 1,
  channelId: 2
}
```

***Return:***
```
➜ status 200 - OK
➜ status 500 - Internal Server Error
➜ status 400 - Bad Request
➜ status 403 - Forbidden
```

### ✔ POST /createChannelInvitation
**➜ needs token authentication**<br/>
**➜ role: ALL**<br/>
Moderator, Admin - PUBLIC_CHANNEL<br/>
ALL - PRIVATE_CHANNEL<br/>
...OVĚŘIT, ZDA JE V CHANNELU<br/>

??? post - submit new channel invitations ???

***Body:***
```
{
  channelId: 1,
  userIds: []
}
```

***Return:***
```
➜ status 200 - OK
➜ status 500 - Internal Server Error
➜ status 400 - Bad Request
➜ status 403 - Forbidden
```


### ✔ GET /getChannelsInvitableAccounts
get - list of users invitable to channel
**➜ role: ALL**<br/>
Moderator, Admin - PUBLIC_CHANNEL<br/>
ALL - PRIVATE_CHANNEL<br/>

***Body:***
```
{
  channelId: 1
}
```

***Return:***
```
➜ status 200 - OK
  [
    {
      id: 1,
      name: 'Lukáš',
      username: 'Lukas'
    }
  ]
  
➜ status 500 - Internal Server Error
➜ status 400 - Bad Request
➜ status 403 - Forbidden
```
or full user objects






<hr/>





<i>Soubor <b>'registrationInvitations.js'</b></i>


### ✔ GET /getAllRegistrationInvitations
**➜ needs token authentication**<br/>
**➜ role: ADMIN**<br/>

get - list all registration invitations

***Return:***
```
➜ status 200 - OK
  [
    {
      id: "1",
      code: "aa",
      accepted: "false"
    }
  ]

➜ status 500 - Internal Server Error
➜ status 403 - Forbidden
```


### ✔ POST /generateRegistrationInvitation
**➜ needs token authentication**<br/>
**➜ role: ADMIN**<br/>

post - generate new registration invitation

***Body: (can be empty)*** 
```
  {
    amount: "3"   // OPTIONAL
  }
```

***Return:***
```
➜ status 200 - OK
➜ status 500 - Internal Server Error
➜ status 403 - Forbidden
```






<hr/>




<i>Soubor <b>'registrationInvitations.js'</b></i>


### ✔ GET /getAllMessages
**➜ needs token authentication**<br/>
**➜ role: ALL**<br/>
...OVĚŘIT, ZDA JE V CHANNELU<br/>

get - list of all messages

seřazeno podle data

***Body:***
```
{
  channelsId: '5',
}
```

***Return:***
```
➜ status 200 - OK
  {
    id: 1,
    threadId: 10,
    creator: {
      id: 1,
      name: 'Pepa'
    },
    created: Date.now(),
    content: 'samotná zpava'
  }
  
➜ status 500 - Internal Server Error
➜ status 400 - Bad Request
➜ status 403 - Forbidden
```
or full user objects




<br/>
<br/>
<br/>
<br/>
<br/>
<br/>























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
