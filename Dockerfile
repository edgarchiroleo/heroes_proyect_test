FROM node:14.15.0

ARG WORK_DIR=/heroes
ENV PATH ${WORK_DIR}/node_modules/.bin:$PATH

RUN mkdir ${WORK_DIR}
WORKDIR ${WORK_DIR}

COPY package.json ${WORK_DIR}
COPY package-lock.json ${WORK_DIR}

RUN npm install

COPY . ${WORK_DIR}

EXPOSE 4200

CMD ng serve --host 0.0.0.0

