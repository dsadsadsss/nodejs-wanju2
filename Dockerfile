# 使用 Node.js的 Alpine 版本
FROM node:alpine

# 设置 NODE_ENV 环境变量为 production
ENV NODE_ENV=production

# 设置 FLIE_PATH 环境变量为 /tmp
ENV FLIE_PATH=/tmp/

# 设置 PORT 环境变量为默认值 3000
ENV PORT=3000

# 暴露容器监听的端口
EXPOSE ${PORT}

# 设置工作目录
WORKDIR /app

# 创建用户 10016 并赋予 root 权限,抱脸改为1000
RUN adduser -u 10016 -D myuser && \
    echo "myuser ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# 复制应用程序代码和依赖项清单
COPY . .

# 安装应用程序依赖
RUN apk update \
    && apk add --no-cache bash curl zsh sudo \
    && chmod 777 start.sh \
    && npm install \
    && rm -rf /var/lib/apt/lists/*

# 切换到用户 10016 运行应用程序
USER 10016

# 启动应用程序
CMD node index.js
