# How to use server

## Start server locally

### Install server

To install `server` run

```bash
npm install node-static
npm install http-proxy
```

### Run server

To start `server` run
 
```bash
. ./server.sh
```


## Use nginx dynamic proxy

Use [nginx configuration](nginx)

or add following configuration:
 
```bash
  # Proxy configuration
  location /cors-proxy {
    set $request_url $request_uri;
    if ($request_uri ~ ^/cors-proxy/(.*)$ ) {
      set $request_url $1;
    }
    proxy_pass $request_url;
    add_header X-uri $request_url;
    proxy_hide_header 'www-authenticate';
    proxy_redirect    off;
   }
```