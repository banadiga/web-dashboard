var static = require('node-static'),
    httpProxy = require('http-proxy'),
    proxy = httpProxy.createProxyServer({timeout: 500}),
    port = 1234,
    proxy_path = '/cors-proxy/',
    http = require('http');

// proxy server
proxy.on('proxyRes', function (proxyRes) {
    if (proxyRes.statusCode == 401) {
        delete proxyRes.headers['www-authenticate'];
    }
}).on('error', function (e) {
    console.error('Something was wrong', e);
});

// static server
var file = new static.Server('../src', {
    cache: 3600,
    gzip: true
});

// web server
var server = http.createServer(function (request, response) {
    if (request.url.lastIndexOf(proxy_path, 0) == 0) {
        proxy.web(request, response,
            {target: request.url.substring(proxy_path.length, request.url.length)});
    } else {
        request.addListener('end', function () {
            file.serve(request, response);
        }).resume();
    }
});

console.log('listening on port ', port);
server.listen(port);
