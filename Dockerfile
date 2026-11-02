FROM mcr.microsoft.com/playwright:v1.64.1-noble

ARG APP_COMMIT=dca70562c010156b05cc8b54e641f67c0063d5dc
LABEL org.opencontainers.image.description="Kitchen Sink ToDo assessment with Playwright and Allure"
LABEL assessment.application.commit="${APP_COMMIT}"

RUN apt-get update && apt-get install -y --no-install-recommends git openjdk-21-jre-headless \
    && rm -rf /var/lib/apt/lists/*
RUN git init /opt/kitchensink \
    && cd /opt/kitchensink \
    && git remote add origin https://github.com/cypress-io/cypress-example-kitchensink.git \
    && git fetch --depth 1 origin "${APP_COMMIT}" \
    && git checkout --detach FETCH_HEAD \
    && test "$(git rev-parse HEAD)" = "${APP_COMMIT}" \
    && npm ci --omit=dev --ignore-scripts \
    && rm -rf .git

WORKDIR /work
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV CI=1 START_APP=1 OUTPUT_DIR=/artifacts
CMD ["sh", "scripts/container-test.sh"]
