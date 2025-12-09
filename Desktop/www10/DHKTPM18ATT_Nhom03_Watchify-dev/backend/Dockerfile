# Build stage
FROM gradle:8.5-jdk21 AS build

WORKDIR /app

COPY build.gradle settings.gradle gradlew gradlew.bat ./
COPY gradle ./gradle

RUN ./gradlew dependencies --no-daemon

COPY src ./src

RUN ./gradlew build --no-daemon -x test

# Production stage
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8888

CMD ["java", "-jar", "app.jar"]