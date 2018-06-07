'use strict'

const util = require('util');
const dbus = require('dbus');
const EventEmitter = require('events').EventEmitter;
const handler = module.exports = new EventEmitter();

// send speech event to webapp
const webAppNotify = new DbusEvent({
    remoteObjectPath: '/rokidos/webapp',
    remoteIfaceName: 'com.rokidos.webapp'
});

handler.on('voice info', (data) => {
    // data.energy 当前语音的能量值
});
handler.on('voice coming', (data) => {
    // 语音寻向
});
handler.on('voice accept', (data) => {
    // 语音仲裁结果：接受
    webAppNotify.send('speech', [JSON.stringify({
        event: 'voice-accept'
    })]);
});
handler.on('voice reject', (data) => {
    // 语音仲裁结果：拒绝
})
handler.on('voice local sleep', (data) => {
    // 本地休眠事件
    webAppNotify.send('speech', [JSON.stringify({
        event: 'voice-sleep'
    })]);
});
handler.on('voice error', (err) => {
    // 报错
});
handler.on('speech', (data) => {
    // 通过`data.text`获取文本
    // 通过`data.state`获取识别状态：complete, pending

    webAppNotify.send('speech', [JSON.stringify({
        event: 'speech',
        state: data.state,
        asr: data.text
    })]);
});
handler.on('tts start', (text) => {
    // TTS开始事件，并返回TTS的语句
    webAppNotify.send('speech', [JSON.stringify({
        event: 'tts-start',
        tts: text
    })]);
});
handler.on('tts end', () => {
    // TTS结束事件
    webAppNotify.send('speech', [JSON.stringify({
        event: 'tts-end'
    })]);
});
handler.on('pickup start', (data) => {
    // 拾音开始
});
handler.on('pickup end', (data) => {
    // 拾音结束
});


function DbusEvent(options) {
    this.options = options
    this.dbusClient = dbus.getBus('session')
}
util.inherits(DbusEvent, EventEmitter)

DbusEvent.prototype.send = function (name, args) {
    this.dbusClient._dbus.emitSignal(
        this.dbusClient.connection,
        this.options.remoteObjectPath,
        this.options.remoteIfaceName,
        name,
        args,
        args.map(() => {
            return 's'
        })
    );
}