# 使用 Node.js的 Alpine 版本
FROM node:alpine

# 设置 NODE_ENV 环境变量为 production
ENV NODE_ENV=production

# 设置 FLIE_PATH 环境变量为 /tmp
ENV FLIE_PATH=/tmp/files/

# 设置 PORT 环境变量为默认值 3000
ENV PORT=3000

# 设置用户 ID 的变量，默认值为 1000
ARG USER_ID=1000

# 如果环境变量 OPT 存在，将 USER_ID 设置为 10016
ENV USER_ID=${USER_ID}
ARG CHOREO_COMPONENT_ID
RUN if [ -n "$CHOREO_COMPONENT_ID" ]; then USER_ID=10016; fi

# 暴露容器监听的端口
EXPOSE ${PORT}

# 设置工作目录
WORKDIR /app

# 创建用户并赋予 root 权限
RUN adduser -u ${USER_ID} -D myuser && \
    echo "myuser ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# 复制应用程序代码和依赖项清单
COPY . .

# 安装应用程序依赖
RUN apk update \
    && apk add --no-cache bash curl zsh sudo \
    && chmod 777 start.sh \
    && npm install \
    && rm -rf /var/lib/apt/lists/*

# 切换到创建的用户运行应用程序
USER ${USER_ID}

# 启动应用程序
CMD node index.js
