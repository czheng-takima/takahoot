# 2023 Takahoot server

This project runs with Nest 9, node 16.  

Its purpose is to manage Kahoot game sessions pool.

## Get started

Inside `app.module.ts`, document the path to your firebase secrets file

```ts
@Module({
  imports: [
    FirebaseModule.forRoot({
      googleApplicationCredential: ,// insert the path to your firebase-secrets-here.json
      databaseURL: 'https://takima-takahoot.firebaseio.com',
    }),
  ],
  ...
})
export class AppModule {}

```

```bash
npm install
npm run start
```

The application starts on port 3000 by default.

## API details

There are only a few basic endpoints:

```http
POST /kahoot?sessionId=123456&playerName=Target+1
```

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `sessionId` | `string` | **Required**. Game pin |  
| `playerName` | `string` | **Required**. Player name in game |  

---

```http
DELETE /kahoot?sessionId=123456&playerName=Target+1
```

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `sessionId` | `string` | **Required**. Game pin |  
| `playerName` | `string` | **Required**. Player name in game |  

---

```http
PUT /kahoot?sessionId=123456&playerName=player+1&answer=1

```

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `sessionId` | `string` | **Required**. Game pin |  
| `playerName` | `string` | **Required**. Player name in game |  
| `playerName` | `number` | **Required**. Accepted values: 0, 1, 2, 3 |  

Endpoints can return the session state

```json
{
  "acceptingAnswers": true,
  "gameState": "disconnected",
  "ongoingQuestion": 2,
  "sessionKey": "1097055 Target 1"
}
```

All the sessions state are stored inside a Firebase Real Time Database, as a JSON file:

```json
{
  "sessions": {
    "1097055 Target 1": {
      "acceptingAnswers": true,
      "gameState": "disconnected",
      "ongoingQuestion": 2,
      "sessionKey": "1097055 Target 1"
    },
    "441055 Target 2": {
      "acceptingAnswers": true,
      "gameState": "quiz",
      "ongoingQuestion": 0,
      "sessionKey": "441055 Target 2"
    },
    "1056055 Target 3": {
      "acceptingAnswers": false,
      "gameState": "lobby",
      "ongoingQuestion": 9,
      "sessionKey": "1056055 Target 3"
    },
    ...
  }
}
```
