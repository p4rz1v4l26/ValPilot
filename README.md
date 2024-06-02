# ValPilot
ValPilot is a api program that provides various functionalities for Valorant and YouTube data retrieval using the [HenrikDev API](https://henrikdev.xyz/) and [YouTube Data API](https://console.cloud.google.com/apis/library/youtube.googleapis.com).

<hr>

## YouTube

### uptime

```
/yt/uptime?channelId=<channelid>
```

<br>

### Subscriber Count

<br>

###### With channelid

```
/yt/subscribers?channel=<channelId>&useID=true
```

###### Without channelid

```
/yt/subscribers?channel=<channelname>&useID=false
```

<hr>

## StreamElements/NightBot Usage

Replace `region` with your account's region code, `username` with your Valorant username and `id` with your hashtag.


## Region Codes

| Region Code | Corresponding Region |
| ----------- | -------------------- |
| ap          | Asia/Pacific         |
| br          | Brazil               |
| eu          | Europe               |
| kr          | Korea                |
| latam       | Latin America        |
| na          | North America        |




## Rank

```
/val/rank/<region>/<username>/<id>

```

## HeadShot Percentage

```
/val/hs/<region>/<username>/<id>

```

## MMR Rating

```
/val/mmr/<region>/<username>/<id>

```

<br>
<em>will update the other commands soon (after developing them) </em>

<hr>

## API Credits

This project utilizes the [HenrikDev API](https://app.swaggerhub.com/apis-docs/Henrik-3/HenrikDev-API/3.0.0#/). Please refer to their documentation for more information.

<hr>

## Contact Details

If you have any questions or inquiries, please feel free to get in touch:

- Email: avinash.warale@yandex.com
- Discord: [@p4rz1v4l26](https://discordapp.com/users/896411007797325824/)

or you can join

- [Discord server](https://discord.gg/vFWB2KGcH9)
