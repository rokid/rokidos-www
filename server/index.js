'use strict';

var http = require('http');
var url = require('url');
var fs = require('fs');
var exec = require('child_process').exec;
var property = require('./property.node');
var recovery = require('./recovery.node');

var localImagePathname = '/data/upgrade';
var webroot = '/opt/www';

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
        fs.readFile(localUrl, (err, data) => {
          response.end(data);
        });
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

