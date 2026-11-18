# Bitácora del proyecto Azur

Recopilación cronológica de las solicitudes del proyecto y de las respuestas o cambios realizados. Las respuestas están resumidas para que la bitácora sea práctica; no son una transcripción literal del chat.

## Inicio y concepto

### 1. Idea del juego

**Solicitud:** Crear un juego en React de historia con bifurcaciones. El protagonista es Azur, un programador que despierta de un largo sueño y enfrenta a las brujas del malware usando SQL, con un estilo didáctico parecido a Duolingo, animaciones, sprites y videos.

**Respuesta/acción:** Se comenzó a construir el proyecto React como una aventura interactiva de código. El proyecto quedó organizado como una aplicación Vite y se fue ampliando con escenas, combate y recursos visuales.

### 3. Abrir la aplicación

**Solicitud:** “No está abierto”.

**Respuesta/acción:** Se intentó continuar desde la aplicación local. La vista de desarrollo terminó disponible en `http://127.0.0.1:5173/`.

## Personajes, fondos y combate

### 4. Sprite idle de Azur

**Solicitud:** Usar el GIF “Ninja neón en ciclo animado.gif” como sprite idle de Azur.

**Respuesta/acción:** Se incorporó el sprite de Azur para su animación de espera.

### 5. Resolución del fondo de batalla

**Solicitud:** Consultar si la resolución del fondo estaba bien y aclarar que los combates serían al estilo de *Epic Seven*.

**Respuesta/acción:** Se evaluó el fondo como escenario de combate y se tomó *Epic Seven* como referencia para una batalla visual con personajes sobre el campo.

### 6. Fondo con círculos para los personajes

**Solicitud:** Usar la segunda imagen como fondo y colocar a Azur y a la bruja en los círculos del escenario.

**Respuesta/acción:** Se preparó el campo de batalla con las posiciones de ambos personajes.

### 7. Sprite de ataque de Azur

**Solicitud:** Usar el GIF “personaje_sin_fondo (4).gif” como imagen de ataque de Azur.

**Respuesta/acción:** Se conectó el sprite a la animación de ataque.

### 8. Mantener visible la pantalla de pelea durante los ataques

**Solicitud:** La pantalla de juego debe seguir presente mientras Azur ataca, siguiendo la idea de *Epic Seven*.

**Respuesta/acción:** Se mantuvo el escenario de combate visible y se añadieron estados de animación para los ataques.

### 9. Combate bilateral con menú estilo Pokémon

**Solicitud:** Hacer que el menú de pelea se parezca al de Pokémon y permitir que la bruja también ataque; el combate no debía ser unilateral.

**Respuesta/acción:** Se organizó el combate por turnos, con acciones para Azur y contraataques de Goti.

### 10. Menús de inicio y selección

**Solicitud:** Crear los menús para jugar, elegir personaje y elegir dificultad. Después de seleccionar, debía comenzar la animación del video enviado.

**Respuesta/acción:** Se implementaron las pantallas de inicio, selección de personaje y dificultad, seguidas por la cinemática de apertura.

## Historia y diálogos

### 11. Diálogo estilo novela visual

**Solicitud:** Usar las imágenes enviadas para los retratos y sprites de Goti y Azur: presentación de Goti, sprite de Goti y respuestas de Azur.

**Respuesta/acción:** Se añadieron diálogos de primer contacto, retratos de los personajes y una presentación narrativa antes del combate.

### 12. Dificultad y diálogo en primer plano

**Solicitud:** La dificultad difícil era demasiado fácil; debía convertirse en la dificultad fácil actual y aumentar la exigencia según la dificultad. También se pidió que los diálogos aparecieran en primer plano sobre el campo de batalla, adaptados al ejemplo de novela visual, y buscar referencias.

**Respuesta/acción:** Se ajustó el escalado de vida, daño, armadura y sobrecargas de Goti. La conversación se superpuso al escenario y se consultaron referencias sobre avisos de ataques y telegráficos de jefes.

## Sistema de combate y finales

### 13. Ataques SQL, Cortafuegos y finales

**Solicitud:** El Cortafuegos debía requerir una consulta SQL; atacar debía abrir un submenú con `SELECT` (daño bajo), `INSERT INTO` (medio) e `INNER JOIN` (alto). El jefe debía durar más de tres turnos y ser alcanzable. Tras derrotar a Goti, elegir una consulta debía llevar a uno de tres finales: `DELETE` la mata (con el desenlace oculto hasta elegir), una subconsulta la sella por mil años, o `INNER JOIN` hace que Azur se sacrifique y quede sellado con ella en una lucha eterna.

**Respuesta/acción:** Se implementaron las tres acciones SQL con daño y riesgos distintos, la consulta de Cortafuegos, dificultades escalonadas y una pantalla de elección de final que revela la consecuencia después de seleccionar la consulta.

### 14. Cortafuegos con curación y recarga; preguntas aleatorias

**Solicitud:** Hacer que Cortafuegos sea más útil, que cure y tenga tiempo de recarga; generar preguntas SQL al azar en vez de limitarse a las predeterminadas.

**Respuesta/acción:** Cortafuegos pasó a curar 30 PV y proteger contra dos golpes si la consulta es correcta. Tiene una recarga de tres turnos de Goti. Se añadieron bancos aleatorios de preguntas y se mezcló la posición de las respuestas.

### 15. Ampliar la cantidad de preguntas

**Solicitud:** Crear varias preguntas con sus respuestas, no solo las que ya estaban.

**Respuesta/acción:** Se amplió el banco a 44 ejercicios: 12 de `SELECT`, 12 de `INSERT INTO`, 12 de `INNER JOIN` y 8 para Cortafuegos. Cada ejercicio tiene consigna, respuesta correcta, distractores y pista.

## Cinemáticas y presentación

### 16. Cinemática de derrota y pantalla GAME OVER

**Solicitud:** Al morir ante Goti, reproducir el video enviado y, al final, mostrar un panel centralizado con “GAME OVER” en letras grandes y las opciones “Continuar” o “Rendirse”.

**Respuesta/acción:** Se integró el video de derrota. Al terminar, aparece el panel; “Continuar” reinicia el combate y “Rendirse” vuelve al menú.

### 17. Audio de los videos

**Solicitud:** Hacer que los videos tengan audio.

**Respuesta/acción:** Se activó el audio por defecto en las cinemáticas de apertura y derrota, conectado al control de sonido del juego.

### 18. Campo de batalla más grande y controles abajo

**Solicitud:** Dar más espacio a la pantalla de pelea para apreciar el escenario y dejar la consigna y los botones abajo, conservando calidad y evitando que se pierdan al usar pantalla completa.

**Respuesta/acción:** Se reorganizó el combate con el campo a todo lo ancho y más alto, y con las acciones y la consigna en una franja inferior adaptable. En pantallas bajas o móviles, esa franja puede desplazarse para que los controles sigan accesibles.

## Revisión de nombres

### 19. Revisar menciones de Nix

**Solicitud:** Revisar todo el proyecto porque todavía había partes que llamaban Nix al personaje.

**Respuesta/acción:** Se buscó el nombre en el código y los recursos. Se encontró una pregunta SQL que todavía lo mencionaba.

### 20. Cambiar Nix por Goti

**Solicitud:** Aclarar que donde decía Nix debía decir Goti.

**Respuesta/acción:** Se actualizó el enunciado, la consulta SQL y la pista de esa pregunta para que se refieran a Goti.
