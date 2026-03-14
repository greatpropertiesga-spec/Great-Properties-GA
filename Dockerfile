FROM nginx:alpine
COPY . /usr/share/nginx/html
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    # Redirect .html URLs to clean URLs\n\
    if ($request_uri ~ ^/(.*)\.html$) {\n\
        return 301 /$1;\n\
    }\n\
\n\
    location / {\n\
        try_files $uri $uri.html $uri/ =404;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
