FROM mysql:latest

ENV MYSQL_ROOT_PASSWORD=root_password
ENV MYSQL_DATABASE=mydatabase
ENV MYSQL_USER=myuser
ENV MYSQL_PASSWORD=mypassword

COPY ./init.sql /docker-entrypoint-initdb.d/

EXPOSE 3306

CMD ["mysqld"]
