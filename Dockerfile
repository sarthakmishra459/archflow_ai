# Multi-stage Dockerfile for building and running the Spring Boot backend

FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /workspace/app

# Copy only the files needed for a Maven build to leverage layer caching
COPY pom.xml .
COPY src ./src

# Build the project (skip tests for faster image builds; remove -DskipTests if desired)
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the fat JAR from the build stage
COPY --from=build /workspace/app/target/*.jar /app/app.jar

EXPOSE 8080
ENV JAVA_OPTS=""

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
