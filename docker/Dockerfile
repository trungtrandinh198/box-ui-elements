FROM almalinux:9.1

ENV TZ Asia/Tokyo

# RUN mkdir /app
# COPY ./src-front-end/package.json /var/www/src-front-end/package.json

# install
RUN curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - \
  && dnf -y update \
  && dnf install -y \
  nodejs \
  git \
  openssh-server \
  && dnf clean all \
  && npm update -g npm \
  && mkdir /var/run/sshd

RUN npm install -g yarn

ENV NOTVISIBLE "in users profile"

EXPOSE 22 3000
CMD ["/usr/sbin/sshd"]
