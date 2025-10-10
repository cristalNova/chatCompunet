# Proyecto chat 

### Integrantes:

- Juan Pablo Serrano - A00404067
- Maria Cristina Angulo - A00404027

### Instrucciones para ejecución:

1. Ejecutar clase server.
   
   **Opción 1:**
         
     - Ingresar a carpete destino:
  
             cd chatAppCompunet\server\src\main\java\server
    - Realizar:
  
            gradle run
    
    **Opción 2:**

    Desde la raíz del proyecto:

    - Ingresar a carpeta
            
            cd chatCompunet
    - Ejecutar
            
            gradle :server:run
1. Ejecutar la clase ClientApp
    
    **Opción 1:**
         
    - Ingresar a carpete destino:
  
             cd chatAppCompunet\client\src\main\java\client
    - Ejecutar en consola:
  
            gradle run
    
    **Opción 2:**

    Desde la raíz del proyecto:

    - Ingresar a carpeta:
            
            cd chatCompunet
    - Ejecutar:
            
            gradle :client:run
  
1. Una vez ejecutada la clase ClientApp, dirígase a la barra de tareas y selecciona la ventana de la aplicación JavaFX que se ha desplegado. Ábrala para comenzar a utilizar el chat.

### Instrucciones generales para uso:

- En la parte superior debe ingresar el nombre de usuario por el que será reconocido, posteriormente presione el botón *Conectar*.
- En la barra lateral derecha encontrará los comandos para ejecutar acciones en el chat.
- Para hacer envío de mensajes, comenzar llamada o enviar audio ya sea de forma grupal o a un usuario en específico se debe de ingresar en el campo *target* el nombre por el que se reconoce el destino y seleccionar si el comando será tipo *group* o *user*.