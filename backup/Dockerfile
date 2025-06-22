FROM alpine:latest

RUN apk add --no-cache postgresql-client zip bash curl

WORKDIR /app

COPY backup.sh /app/backup.sh
COPY crontab /etc/crontabs/root

RUN chmod +x /app/backup.sh

CMD ["crond", "-f", "-l", "2"]
