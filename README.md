# RokidOS Web Panel

RokidOS Web 面板基于 [ShadowNode](https://github.com/Rokid/ShadowNode) 开发，目前支持如下功能：

- [x] 系统升级
- [ ] 语音控制
  - [x] TextToSpeech
  - [ ] 文本指令
- [ ] Dashboard
  - [ ] 播放状态
  - [ ] 应用状态
  - [ ] 蓝牙状态
- [ ] 远程控制

## 如何使用

如果是家庭环境，直接通过 http://rokid.local 访问即可。若发现上述地址不可用，需要执行以下操作：

```sh
$ adb shell ifconfig
# 找到当前开发板的 IP 地址
```

然后按照这个地址在浏览器中进行访问即可。

## 如何构建

```sh
$ npm install
$ npm run build
```

## 如何开发

```sh
$ npm run dev
```

## RokidOS 安装

因为使用了 EventHandler.js，需要把 `EventHandler.js` 复制到 rokidOS

cp lib/EventHandler.js /data/plugins/

## License

Apeach v2.0
