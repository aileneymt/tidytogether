FROM node:lts
# Set working directory
WORKDIR /app/api

# install node modules
COPY ./package*.json ./
RUN npm install

# Copy all files from current directory to working dir in image
COPY . ./

ENV PORT 80

# ENV PORT 3000
# EXPOSE 3000

ENTRYPOINT [ "npm", "start"]