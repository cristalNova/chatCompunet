# Proyecto chat (Versión III) 

### Integrantes:

- Juan Pablo Serrano - A00404067
- Maria Cristina Angulo - A00404027
- Giuseppe Portocarrero - A00404257
- Sebastian Matienko - A00404822

### Instrucciones para ejecución:

1. Compilar y ejecutar clase server.
   
   - Localizarse en la carpeta raíz:
  
                chatCompunet
        
   - Realizar:
  
            .\gradlew build
     
   Esto compilará el proyecto y generará el archivo .jar en build/libs/.
   - Ejecutamos
     
      ```bash
      .\gradlew :server:run
    
2. Ejecutar el cliente
    
    - Abrir otra terminal

    - Ingresar a carpeta destino:
  
             cd web-client

    - Para primer uso del programa se deben instalar dependencias. Ejecutar el comando:
  
                npm install

    - Construir el proyecto mediante WebPack:
  
                npm run build

    - Para desplegar la parte cliente ejecutar en consola:
  
            npm run dev


        El anterior comando abre automáticamente una ventana en el navegador con el cliente ya funcionando.

    El frontend se levantara y será accesible en:
            http://localhost:3000

  
  
3. Una vez ejecutado el cliente, dirígase a su navegador, a la dirección: http://localhost:3000

### Instrucciones generales para uso:

- En el login debe ingresar el nombre de usuario por el que será reconocido, posteriormente presione el botón *Conectar*.
- **Barra de contactos:**
    - En la barra lateral izquierda encontrará los usuarios conectados y grupos existentes en el chat.
    - Para crear un grupo, usar el botón de + en la sección de grupos.
    - Para hacer envío de mensajes ya sea de forma grupal o a un usuario en específico se debe de hacer click en el nombre de usuario o grupo destino y una vez lo haya seleccionado puede enviar un mensaje.
- **Barra de estado:**
    - En la barra superior encontrará el nombre con el que se encuentra conectado.
    - El botón *Desconectar* hace que se desconecte del servidor, por lo que posterior a presionar el botón su historial ya no será guardado.
    - Al dar click a un usuario o grupo destino la barra superior se actualizara con el nombre del chat destino que ha seleccionado.
- **Barra de acciones:**
    - En la barra inferior encontrara el espacio para ingresar el mensaje a enviar. Posterior a escribir el mensaje debe presionar el botón <img src="web-client/src/assets/icons/send.svg" width="15" />.
    - Para realizar una llamada debe presionar el botón <img src="web-client/src/assets/icons/phone.svg" width="15" />. Para concluir la llamada vuelva a presionar el botón.
    - Para envío de notas de voz debe presionar el botón <img src="web-client/src/assets/icons/microphone.svg" width="15" />. Para enviar la notas vuelva a presionar el botón.
- **Apartado de mensajes:**
    - Entre la barra superior de estado y la barra inferior de acciones se encontrará el espacio donde aparecerán nuevos mensajes automáticos según el chat en el que se encuentre.


## Descripción del Sistema

Este proyecto implementa un sistema de chat con soporte para mensajes individuales y de grupos. La comunicación sigue este flujo:

1. **Cliente (frontend)**: interfaz en Node.js donde los usuarios pueden enviar y recibir mensajes, realizar llamadas y envío de notas de voz. Además, muestra historial de mensajes.
2. **Proxy / API**: maneja las peticiones del frontend y las traduce a mensajes que el servidor Java puede entender.
3. **Servidor Backend (Java)**: administra usuarios, grupos y mantiene el historial de mensajes en un archivo JSON. También envía mensajes a los clientes correspondientes (individuales o grupos).
4. **Servidor Backend (ICE)**: El backend implementado con ICE (Internet Communications Engine) actúa como la capa central de comunicación distribuida del sistema. Utiliza interfaces definidas en archivos .ice para exponer servicios remotos que pueden ser invocados por los clientes a través del proxy/API.
   
   - Su función principal es gestionar la lógica de comunicación en tiempo real -mediante WebSocket ICE- entre usuarios y grupos, garantizando un transporte eficiente y bidireccional.

   - Este servidor no solo gestiona usuarios, grupos y mensajes, sino que además se apoya en funcionalidades provistas por el servidor Java, delegando en él tareas de gestión de datos, validación y persistencia.

5. **Flujo (Gráfico)**:
   - Cliente → Servidor:
        IceDelegate envía llamadas RPC → Servidor procesa → devuelve resultado.

   - Servidor → Cliente:
        Servidor activa un callback → llama al Subscriber → IceDelegate despacha los eventos → UI se actualiza.
---

