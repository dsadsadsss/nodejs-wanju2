# 使用 Node.js的 Alpine 版本
FROM node:alpine

# 设置 NODE_ENV 环境变量为 production
ENV NODE_ENV=production

# 设置 PORT 环境变量为默认值 3000
ENV PORT=3000

# 暴露容器监听的端口
EXPOSE ${PORT}

# 设置工作目录
WORKDIR /app

# 复制应用程序代码和依赖项清单

COPY . .

# 安装应用程序依赖
    
RUN apk update \
    && apk add --no-cache bash curl \
    && chmod 777 start.sh \
    && npm install \
    && rm -rf /var/lib/apt/lists/*

# 启动应用程序
CMD node /app/index.js
