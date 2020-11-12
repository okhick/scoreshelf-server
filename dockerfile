FROM node:latest

RUN apt-get update
RUN yes | apt-get install graphicsmagick 
RUN yes |apt-get install ghostscript