# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0


FROM --platform=${BUILDPLATFORM} docker.io/library/eclipse-temurin:24.0.2_12-jdk@sha256:7493205ffe6caa8074fa8a06a276bb1c5ac41d3dd0fd43a0db66d7f776e80b3e AS builder
WORKDIR /usr/src/app/

COPY ./src/recommendation/gradlew* ./src/recommendation/settings.gradle* ./src/recommendation/build.gradle ./
COPY ./src/recommendation/gradle ./gradle

RUN chmod +x ./gradlew
RUN ./gradlew --no-daemon downloadRepos

COPY ./src/recommendation/src ./src
COPY ./pb/ ./proto
RUN ./gradlew --no-daemon bootJar -PprotoSourceDir=./proto

# -----------------------------------------------------------------------------

FROM docker.io/library/eclipse-temurin:24.0.2_12-jre@sha256:8cb2387a28af84cf0db0948d9c67d4480192f4e567027a3963f145d218e8b4f2

ARG PYROSCOPE_AGENT_VERSION=2.9.2

WORKDIR /usr/src/app/

ADD --chmod=644 https://repo1.maven.org/maven2/io/pyroscope/agent/$PYROSCOPE_AGENT_VERSION/agent-$PYROSCOPE_AGENT_VERSION.jar /usr/src/app/pyroscope-javaagent.jar
# Continuous profiling pushes to the estate Pyroscope when PYROSCOPE_SERVER_ADDRESS is
# set (deploy/telemetry-env-patches.yaml); without it the agent idles harmlessly.
ENV JAVA_TOOL_OPTIONS="-Xmx300m -XX:+ExitOnOutOfMemoryError -javaagent:/usr/src/app/pyroscope-javaagent.jar"

COPY --from=builder /usr/src/app/build/libs/recommendation.jar ./recommendation.jar

ARG RECOMMENDATION_PORT=9001
EXPOSE ${RECOMMENDATION_PORT}
ENTRYPOINT [ "java", "-jar", "recommendation.jar" ]
