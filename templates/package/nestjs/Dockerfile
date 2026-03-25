# BUILD
FROM public.ecr.aws/docker/library/node:22 AS build
WORKDIR /src

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# IMAGE
FROM public.ecr.aws/docker/library/node:22-alpine
WORKDIR /app

COPY --from=build /src/dist ./dist
COPY --from=build /src/node_modules ./node_modules
COPY --from=build /src/package.json ./package.json
COPY ./config ./config

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
