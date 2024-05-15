FROM node:lts AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:lts

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./
COPY --from=builder package.json package-lock.json ./

EXPOSE 3000

CMD ["npm", "run", "start"]