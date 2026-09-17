# =======================================================
# DOCKERFILE OPTIMIZADO PARA DESPLIEGUE EN RENDER.COM
# Sistema de Gestión de Inventarios - SENA ADSO
# =======================================================

# Etapa 1: Compilación con Maven y Java 17
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copiar pom.xml y descargar dependencias (aprovechando caché)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar código fuente y recursos web estáticos
COPY src ./src

# Empaquetar la aplicación en archivo JAR
RUN mvn clean package -DskipTests

# Etapa 2: Imagen ligera de ejecución (JRE 17 Alpine)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Crear directorio de datos para la base de datos persistente
RUN mkdir -p /app/data

# Copiar el archivo JAR empaquetado
COPY --from=builder /app/target/*.jar app.jar

# Render asigna el puerto mediante la variable de entorno PORT
ENV PORT=8080
EXPOSE 8080

# Iniciar la aplicación enlazada al puerto de Render
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
