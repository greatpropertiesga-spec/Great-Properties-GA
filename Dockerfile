FROM php:8.2-apache

# Enable Apache modules
RUN a2enmod rewrite headers

# Install PHP extensions
RUN docker-php-ext-install mysqli

# Apache config - allow .htaccess and enable PHP
RUN echo '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/site.conf \
 && a2enconf site

# Copy files
COPY . /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
 && find /var/www/html -type f -exec chmod 644 {} \; \
 && find /var/www/html -type d -exec chmod 755 {} \;

EXPOSE 80
