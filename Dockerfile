FROM nginx:alpine
COPY . /usr/share/nginx/html
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index home;\n\
\n\
    # Remove .html extension from URLs\n\
    location / {\n\
        try_files $uri $uri.html $uri/ /index.html =404;\n\
    }\n\
\n\
    # Redirect /index.html -> /\n\
    location = /index.html {\n\
        return 301 /;\n\
    }\n\
\n\
    # Redirect /page.html -> /page\n\
    if ($request_uri ~ ^/(.*)\.html$) {\n\
        return 301 /$1;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
