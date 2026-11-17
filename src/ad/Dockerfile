# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0


FROM --platform=${BUILDPLATFORM} docker.io/library/eclipse-temurin:24.0.2_12-jdk@sha256:7493205ffe6caa8074fa8a06a276bb1c5ac41d3dd0fd43a0db66d7f776e80b3e AS builder
WORKDIR /usr/src/app/

COPY ./src/ad/gradlew* ./src/ad/settings.gradle* ./src/ad/build.gradle ./
COPY ./src/ad/gradle ./gradle

RUN chmod +x ./gradlew
RUN ./gradlew
RUN ./gradlew downloadRepos

COPY ./src/ad/ ./
COPY ./pb/ ./proto
RUN chmod +x ./gradlew
RUN ./gradlew installDist -PprotoSourceDir=./proto

# -----------------------------------------------------------------------------

FROM docker.io/library/eclipse-temurin:24.0.2_12-jre@sha256:8cb2387a28af84cf0db0948d9c67d4480192f4e567027a3963f145d218e8b4f2

ARG OTEL_JAVA_AGENT_VERSION
ARG PYROSCOPE_AGENT_VERSION=2.9.2

WORKDIR /usr/src/app/

COPY --from=builder /usr/src/app/ ./
ADD --chmod=644 https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v$OTEL_JAVA_AGENT_VERSION/opentelemetry-javaagent.jar /usr/src/app/opentelemetry-javaagent.jar
ADD --chmod=644 https://repo1.maven.org/maven2/io/pyroscope/agent/$PYROSCOPE_AGENT_VERSION/agent-$PYROSCOPE_AGENT_VERSION.jar /usr/src/app/pyroscope-javaagent.jar
# Continuous profiling pushes to the estate Pyroscope when PYROSCOPE_SERVER_ADDRESS is
# set (deploy/telemetry-env-patches.yaml); without it the agent idles harmlessly.
ENV JAVA_TOOL_OPTIONS="-javaagent:/usr/src/app/opentelemetry-javaagent.jar -javaagent:/usr/src/app/pyroscope-javaagent.jar -Xmx200m"

ARG AD_PORT=9555
ARG AD_PROMETHEUS_PORT=9465
EXPOSE ${AD_PORT}
EXPOSE ${AD_PROMETHEUS_PORT}
ENTRYPOINT [ "./build/install/opentelemetry-demo-ad/bin/Ad" ]
