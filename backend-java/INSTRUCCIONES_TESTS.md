# Instrucciones para la Ejecución de Pruebas Unitarias y Reporte de Cobertura

Este documento explica de forma rápida cómo ejecutar los tests unitarios y visualizar el reporte de cobertura de código (JaCoCo) para la entrega del TP.

## Prerrequisitos
Asegurarse de tener el motor de base de datos MySQL (por ejemplo, mediante XAMPP) activo y corriendo, ya que el contexto de Spring Boot se inicializa al arrancar las pruebas.

---

## 🚀 Cómo ejecutar los Tests
Abrir una terminal o consola de comandos, posicionarse dentro de la carpeta **`backend-java`** del proyecto.

Puedes ejecutar los tests de dos formas, dependiendo de si tienes Maven instalado en tu sistema o no:

### Opción 1: Usando el Maven Wrapper del proyecto (Recomendado)
Si no tienes Maven instalado de forma global, puedes usar el ejecutable wrapper incluido en el proyecto. Ejecuta este comando desde PowerShell (o la terminal de tu IDE):
```powershell
.\mvnw clean test
```

### Opción 2: Usando Maven Global (Si ya lo tienes instalado en tu PC)
```bash
mvn clean test
```

*Nota: La configuración del archivo `pom.xml` ya cuenta con los parámetros de compatibilidad necesarios para Mockito y JaCoCo en caso de que se esté utilizando Java 24.*

Una vez finalizada la ejecución, la consola deberá indicar que se corrieron los 3 tests unitarios sin fallos:
```text
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 📊 Cómo ver el Reporte de Cobertura (JaCoCo)
Al finalizar el comando de ejecución de pruebas, JaCoCo autogenera un informe visual en HTML. Puedes abrirlo de forma directa desde la terminal (estando dentro de la carpeta `backend-java`) ejecutando alguno de los siguientes comandos:

* **Si estás usando PowerShell (Terminal de VS Code, NetBeans, etc.):**
  ```powershell
  Start-Process "target/site/jacoco/index.html"
  ```
* **Si estás usando Consola de Comandos clásica (CMD):**
  ```cmd
  start target/site/jacoco/index.html
  ```

*Opcionalmente, puedes buscar manualmente la ruta `backend-java/target/site/jacoco/` en tu Explorador de Archivos y abrir el archivo **`index.html`** haciendo doble clic.*

Allí se podrá auditar detalladamente la cobertura de los servicios (`AuthService`, `ResenaService` y `ViajeService`), incluyendo el porcentaje de cobertura y las líneas específicas de código analizadas.
