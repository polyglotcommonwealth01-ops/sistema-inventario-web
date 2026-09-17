# =======================================================
# DOCKERFILE ROBUSTO PARA DESPLIEGUE EN RENDER.COM
# Sistema de Gestión de Inventarios - SENA ADSO
# =======================================================

# Etapa 1: Compilación con Maven y Java 17
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copiar configuración Maven y código fuente
COPY pom.xml .
COPY src ./src

# Compilar y empaquetar la aplicación en archivo JAR
RUN mvn clean package -DskipTests

# Etapa 2: Imagen ligera de ejecución (JRE 17)
FROM eclipse-temurin:17-jre
WORKDIR /app

# Crear directorio para base de datos embebida persistente
RUN mkdir -p /app/data

# Copiar el archivo JAR generado desde la etapa de compilación
COPY --from=builder /app/target/*.jar app.jar

# Puerto y perfil por defecto
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=cloud
EXPOSE 8080

# Iniciar la aplicación enlazando al puerto dinámico de Render
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -Dspring.profiles.active=cloud -jar app.jar"]
