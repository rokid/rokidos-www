'use strict'

var logger = console
var util = require('util')
var dbus = require('dbus')
var path = require('path')
var EventEmitter = require('events').EventEmitter

var DBUS_SERVICE = 'com.rokid.AmsExport'
var DBUS_PATH = '/rokidos/webapp'
var DBUS_INTERFACE = 'com.rokidos.webapp'

var DBUS_TARGET_PATH = '/activation/extapp'
var DBUS_TARGET_INTERFACE = 'com.rokid.activation.extapp'

var webappId = 'rokidos-app'

function Media() {
    EventEmitter.call(this)
    this._bus = dbus.getBus('session')
    this.start()
}
util.inherits(Media, EventEmitter)

Media.prototype.start = function () {
    return this.listen()
    .then(() => {
        this.register(DBUS_PATH, DBUS_INTERFACE, webappId)
    })
    .then(() => {
        this.on('onTtsComplete', (id) => {
            this.emit(`tts:complete:${id}`)
        })
        this.on('onMediaComplete', (id) => {
            this.emit(`media:complete:${id}`)
        })
    })
}

Media.prototype.listen = function () {
    return new Promise((resolve, reject) => {
        this._bus.getUniqueServiceName(DBUS_SERVICE, (err, uniqueName) => {
            if (err) return reject(err)
            resolve(uniqueName)
        })
    })
    .then((uniqueName) => {
        return Promise.all([
            this.addSignalFilter(uniqueName, DBUS_PATH, DBUS_INTERFACE)
        ])
    })
    .then((names) => {
        // 监听signal
        var uniqueName = names[0]
        var channel = `${uniqueName}:${DBUS_PATH}:${DBUS_INTERFACE}`
        this._bus.on(channel, (message) => {
            var name = message.name
            var args = message.args
            this.emit.apply(this, [name].concat(args))
        })
    })
}

Media.prototype.addSignalFilter = function (uniqueName, object, dbusInterface) {
    return new Promise((resolve, reject) => {
        this._bus.addSignalFilter(uniqueName, object, dbusInterface, (err) => {
            if (err) return reject(err)
            resolve(uniqueName)
        })
    })
}

Media.prototype.remoteCall = function (method, args, objectPath, ifaceName, appId) {
    return new Promise((resolve, reject) => {
        args = [appId].concat(args)
        var sig = args.map(() => 's').join('')
        this._bus.callMethod(DBUS_SERVICE, objectPath, ifaceName, method, sig, args, (err, res) => {
            if (err) {
                logger.info('dbus error', method, err)
                reject(err)
            } else {
                logger.info('dbus success', method, args, res)
                resolve(res)
            }
        })
    })
}

Media.prototype.register = function (object, iface, appId) {
    return this.remoteCall('register', [object, iface], DBUS_TARGET_PATH, DBUS_TARGET_INTERFACE, appId)
}

Media.prototype.say = function (text, option) {
    option = option || {}
    if (!text) { return Promise.reject(new Error('text is required.')) }
    if (option.speed) { text = `<speed=${option.speed}>${text}</speed>` }
    return new Promise((resolve, reject) => {
        this.remoteCall('tts', [text], DBUS_TARGET_PATH, DBUS_TARGET_INTERFACE, webappId)
        .then((id) => {
            this.once(`tts:complete:${id}`, resolve)
        })
        .catch(reject)
    })
}

Media.prototype.play = function (url) {
    return new Promise((resolve, reject) => {
        this.remoteCall('media', [url], DBUS_TARGET_PATH, DBUS_TARGET_INTERFACE, webappId)
        .then((id) => {
            this.once(`media:complete:${id}`, resolve);
        })
        .catch(reject)
    })
}

module.exports = Media