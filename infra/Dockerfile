FROM ubuntu:latest

# Définition des arguments de construction
ARG PRODUCT="terraform"
ARG VERSION="1.9.8"

# Installation des dépendances et du binaire Terraform
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    gnupg \
    curl \
    python3 && \
    wget https://releases.hashicorp.com/${PRODUCT}/${VERSION}/${PRODUCT}_${VERSION}_linux_amd64.zip && \
    unzip ${PRODUCT}_${VERSION}_linux_amd64.zip && \
    mv ${PRODUCT} /usr/local/bin/${PRODUCT} && \
    rm ${PRODUCT}_${VERSION}_linux_amd64.zip

# Installation de Google Cloud SDK
RUN curl -sSL https://sdk.cloud.google.com | bash

# Ajout du SDK Google Cloud au PATH
ENV PATH=$PATH:/root/google-cloud-sdk/bin