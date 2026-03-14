FROM nginx:alpine
COPY . /usr/share/nginx/html
# Rename index.html to home.html
RUN mv /usr/share/nginx/html/index.html /usr/share/nginx/html/home.html
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
\n\
    # Redirect bare domain to /home\n\
    location = / {\n\
        return 301 /home;\n\
    }\n\
\n\
    # /home serves home.html\n\
    location = /home {\n\
        try_files /home.html =404;\n\
    }\n\
\n\
    # All other pages without .html\n\
    location / {\n\
        try_files $uri $uri.html $uri/ =404;\n\
    }\n\
\n\
    # Block direct .html access, redirect to clean URL\n\
    if ($request_uri ~ ^/(.*)\.html$) {\n\
        return 301 /$1;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
