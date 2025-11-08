# Proyecto chat (Versión II) 

### Integrantes:

- Juan Pablo Serrano - A00404067
- Maria Cristina Angulo - A00404027

### Instrucciones para ejecución:

1. Compilar y ejecutar clase server.
   
   - Ingresar a carpete raiz:
   - Realizar:
  
            .\gradlew build
     
   Esto compilará el proyecto y generará el archivo .jar en build/libs/.
   - Ejecutamos
     
      ```bash
      java -jar build/libs/server.jar
    
2. Ejecutar el proxy
    
    -Abrir otra terminal
    - Ingresar a carpete destino:
  
             cd chatCompunet\web-client\proxy 
    - Ejecutar en consola:
  
            node index.js
    El frontend se levantara y será accesible en:
            http://localhost:3000

  
1. Una vez ejecutado el proxy, dirígase a http://localhost:3000

### Instrucciones generales para uso:

- En el login debe ingresar el nombre de usuario por el que será reconocido, posteriormente presione el botón *Conectar*.
- En la barra lateral izquierda encontrará los usuarios conectados y grupos existentes en el chat.
- Para hacer envío de mensajes ya sea de forma grupal o a un usuario en específico se debe de hacer click en el nombre de usuario o grupo destino y una vez lo haya seleccionado puede enviar un mensaje.
