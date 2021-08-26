FROM alpine:3.12
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories
RUN apk add --no-cache tzdata moreutils git nodejs npm curl bash
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo "Asia/Shanghai" > /etc/timezone

RUN date

WORKDIR /
RUN mkdir /logs
COPY custom.list /custom.list
COPY cron_wrapper /cron_wrapper
COPY jd_scripts /jd_scripts
WORKDIR /jd_scripts
RUN npm install
RUN crontab /custom.list
CMD crontab -l && crond -f
