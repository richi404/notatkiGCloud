FROM node:16

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 8080

ENV BUCKET_NAME=image_notes_bucket
ENV SQL_IP=35.195.169.112
ENV DATABASEUSER=myuser
ENV DATABASENAME=mydatabase
ENV INSTANCECONN=golden-index-410209:europe-west1:notes-sql-database
ENV DATABASEACESS=projects/545866246045/secrets/database-password/versions/1

CMD ["node", "index.js"]
