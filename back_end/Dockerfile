# --- Buil stage
FROM node:18 as build

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY package-lock.json .

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npx prisma generate
RUN npm run build

# --- Production stage
FROM node:18-slim 

# Base smaller node image
RUN apt update && apt install libssl-dev -y --no-install-recommends 

# Add missing dependency needed for prisma
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist  

# Copy de dist folder generated in the previous step
COPY --from=build /usr/src/app/.env .env     

# Copy env variables to use
COPY --from=build /usr/src/app/package.json .
COPY --from=build /usr/src/app/package-lock.json .
RUN npm install --omit=dev 

# Install without dev dependencies to save some space
COPY --from=build /usr/src/app/node_modules/.prisma/client  ./node_modules/.prisma/client 
ENV NODE_ENV production

EXPOSE 8080
CMD ["npm", "run","start:prod"]