Server
=========================================

This server is based on [ShadowNode](https://github.com/Rokid/ShadowNode) which provides a HTTP
service.

### Get the server up

```sh
$ iotjs index.js
```

### APIS

##### Get information

```
GET /apis/ping

{
  "device": {
    "id": "..."
  },
  "version": "...",
  "platform": "..."
}
```

##### Download image from internet

```
GET /apis/image/download?image_url=xxx

{
  "status": "complete"
}
```

##### Upload the image from local

```
POST /apis/image/upload

<...file=[binary data]>
```

##### Operate the upgrade command

This request would do upgrade system from `/data/upgrade/upgrade.img` and restarts
it in respond `delay` timeout.

```
PATCH /apis/image/upgrade

{
  "status": "complete",
  "delay": 1000
}
```


