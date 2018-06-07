'use strict';

var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var property = require('./property.node');
var recovery = require('./recovery.node');
var Media = require('./modules/media/index.js');

var media = new Media();

var localImagePathname = '/data/upgrade';
var webroot = '/opt/www';

var mimeTypes = {
  "css": "text/css; charset=UTF-8",
  "gif": "image/gif",
  "html": "text/html; charset=UTF-8",
  "ico": "image/x-icon",
  "jpeg": "image/jpeg",
  "png": "image/png",
  "js": "application/javascript; charset=UTF-8"
};

var lookupMine = function (pathName) {
  var ext = path.extname(pathName);
  ext = ext.split('.').pop();
  return mimeTypes[ext] || mimeTypes['txt'];
}

var routes = {

  '/apis/ping': (request, response) => {
    response.json({
      device: {
        id: property.get('ro.boot.serialno'),
      },
      version: property.get('ro.build.version.release'),
      platform: property.get('ro.rokid.build.platform'),
      lang: property.get('ro.product.locale'),
    });
  },

  '/apis/image/download': (request, response) => {
    var params = url.parse(request.url, true);
    var command = `rm -rf ${localImagePathname}/upgrade.img && ` +
                  `curl ${params.query.image_url} > ${localImagePathname}/upgrade.img`;

    exec(command, (err, stdout, stderr) => {
      console.log(err, stdout, stderr);
      if (err) {
        response.writeHead(500);
        response.json({
          message: err.message,
        });
        return;
      }
      response.json({ status: 'complete' });
    });
  },

  '/apis/image/upload': (request, response) => {
    var imageFile = fs.createWriteStream(`${localImagePathname}/upgrade.img`);
    imageFile.on('finish', () => {
      response.json({ status: 'complete' });
    });
    request.pipe(imageFile);
  },

  '/apis/image/upgrade': (request, response) => {
    fs.exists(`${localImagePathname}/upgrade.img`, (exists) => {
      if (!exists) {
        response.writeHead(400);
        response.json({
          message: 'image download/upload required',
        });
        return;
      }

      var timeout = 1000;
      setTimeout(() => {
        recovery.upgrade();
      }, timeout);
      recovery.verify();
      recovery.prepare();
      response.json({ status: 'complete', delay: timeout });
    });
  },

  '/apis/media/say': (request, response) => {
    var params = url.parse(request.url, true);
    if (params.query.text) {
      media.say(params.query.text).then(() => {
        response.json({
          status: 'complete'
        })
      }).catch(() => {
        response.json({
          status: 'error',
          message: 'tts error'
        })
      })
    }else{
      response.json({
        status: 'error',
        message: 'text was expected'
      })
    }
  },
  '/apis/media/play': (request, response) => {
    var params = url.parse(request.url, true);
    if (params.query.url) {
      media.play(params.query.url).then(() => {
        response.json({
          status: 'complete'
        })
      }).catch(() => {
        response.json({
          status: 'error',
          message: 'play error'
        })
      })
    }else{
      response.json({
        status: 'error',
        message: 'url was expected'
      })
    }
  },
  '/apis/sse/speech': (request, response) => {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
      "Connection": "keep-alive"
    })
    var padding = new Array(2049);
    response.write(":" + padding.join(" ") + "\n"); // 2kB padding for IE
    response.write("retry: 2000\n");
    var t = setInterval(() => {
      response.write(': keep-alive\n')
    }, 10000)
    function handle(e) {
      var data = JSON.parse(e || '{}')
      if (data.event) {
        response.write(`event: ${data.event}\n`)
        response.write('data: ' + JSON.stringify(data) + '\n\n')
      }
    }
    media.on('speech', handle)
    response.on('close', () => {
      clearInterval(t)
      media.removeListener('speech', handle)
    })
  }
};

var server = http.createServer((request, response) => {
  console.log('got request', request.method, request.url);
  var route = routes[request.url.replace(/\?.*$/, '')];

  /**
   * @method json
   */
  response.json = function(obj) {
    return response.end(JSON.stringify(obj, null, 2));
  };

  if (!route) {
    // just bypass to the index html if got homepage routing.
    if (request.url === '/') {
      fs.createReadStream(`${webroot}/index.html`).pipe(response);
    } else {
      // try load from file system
      var localUrl = webroot + request.url;
      fs.exists(localUrl, (exists) => {
        if (!exists) {
          response.writeHead(404, 'Resource not found');
          response.end();
          return;
        }
        response.writeHead(200, {
          "Content-Type": lookupMine(localUrl)
        });
        
        fs.readFile(localUrl, (error, data) => {
          response.write(data);
          response.end();
        })
      });
    }
  } else {
    // use routes config
    route(request, response);
  }
});

// make sure if upgrade dir is exists
exec(`rm -rf ${localImagePathname} && mkdir -p ${localImagePathname}`, () => {
  server.listen(process.env.PORT || 80);
});

