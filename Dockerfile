# LIU Computer Repairs Tracker - Dockerfile
# Lightweight nginx-based container for serving the static web app

FROM nginx:alpine

# Set maintainer
LABEL maintainer="LIU IT Department"
LABEL description="LIU Computer Repairs Tracker - Static Web Application"
LABEL version="1.0"

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy application files to nginx document root
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY README.md /usr/share/nginx/html/
COPY resources/ /usr/share/nginx/html/resources/

# Create nginx cache directories and set proper permissions
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown nginx:nginx /var/run && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Use nginx user for security
USER nginx

# Start nginx
CMD ["nginx", "-g", "daemon off;"]