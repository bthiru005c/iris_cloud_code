FROM ubuntu:14.04

Maintainer Harsha Bellur

RUN apt-get update
RUN apt-get -y install curl
RUN apt-get -y install git

# Install Stable Go
WORKDIR /opt
RUN curl -O https://nodejs.org/dist/v4.6.0/node-v4.6.0-linux-x64.tar.gz && tar -C /usr/local -xzf /opt/node-v4.6.0-linux-x64.tar.gz
ENV PATH /usr/local/node-v4.6.0-linux-x64/bin:/usr/local/bin:$PATH

# SSH key for github account
# The expectation is that the directory which has the "Dockerfile" must also contain 
# a directory named "keys" which contains the SSH key file for the github account 
COPY keys/id_rsa /root/.ssh/id_rsa
RUN chmod 700 /root/.ssh/id_rsa && echo "Host github.com\n\tStrictHostKeyChecking no\n" >> /root/.ssh/config

# Install Event Manager
WORKDIR /usr/local
#RUN git clone git@github.com:Comcast/iris_cloud_code.git
RUN git clone -b v1.0.11 git@github.com:Comcast/iris_cloud_code.git
WORKDIR /usr/local/iris_cloud_code
RUN npm install
