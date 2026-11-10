import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles, Heart, Flame, BookOpen, ChevronRight, ChevronLeft, Volume2, VolumeX, LockKeyhole, Zap, Terminal, Check, X, RotateCcw, Shield } from 'lucide-react';
import './style.css';
import './azur-sprite.css';
import './battle-arena.css';

const questions = [
  { prompt: 'La bruja dejó una tabla de usuarios infectados. Encuentra a los que siguen activos.', table: 'usuarios', options: ['SELECT * FROM usuarios WHERE estado = "activo";', 'FIND usuarios WHEN estado IS activo;', 'SELECT usuarios IF estado = activo;'], answer: 0, hint: 'SELECT elige datos; WHERE filtra las filas.' },
  { prompt: 'El grimorio guarda secretos. Trae solo los nombres de las brujas.', table: 'brujas', options: ['SELECT nombre FROM brujas;', 'SHOW nombre IN brujas;', 'GET brujas.nombre;'], answer: 0, hint: 'Después de SELECT va la columna; después de FROM, la tabla.' },
  { prompt: 'La sombra clonó un registro. Elimina el duplicado con el ID 13.', table: 'hechizos', options: ['DELETE FROM hechizos WHERE id = 13;', 'REMOVE hechizos id 13;', 'DROP hechizos WHERE id = 13;'], answer: 0, hint: 'DELETE FROM indica qué tabla modificar. WHERE limita el cambio.' },
];

const sqlMoves = [
  { id: 'select', name: 'SELECT', level: 'DAÑO BAJO', damage: 20, effect: 'Escanea a Goti y reduce un 25% el siguiente golpe.', challenge: { table: 'runas', prompt: 'Trae las runas de nivel 3 o superior.', options: ['SELECT nombre FROM runas WHERE nivel >= 3;', 'GET nombre FROM runas IF nivel >= 3;', 'SELECT runas WHERE nivel >= 3;'], answer: 0, hint: 'SELECT nombra la columna, FROM la tabla y WHERE filtra filas.' } },
  { id: 'insert', name: 'INSERT INTO', level: 'DAÑO MEDIO', damage: 34, effect: 'Inserta un sello inestable en el núcleo.', challenge: { table: 'sellos', prompt: 'Inserta el sello inestable para Goti (id 7).', options: ['UPDATE sellos SET goti_id = 7;', "INSERT INTO sellos (goti_id, estado) VALUES (7, 'inestable');", "INSERT sellos SET goti_id = 7 AND estado = 'inestable';"], answer: 1, hint: 'INSERT INTO tabla (columnas) VALUES (valores).' } },
  { id: 'join', name: 'INNER JOIN', level: 'DAÑO ALTO', damage: 50, effect: 'Golpea fuerte, pero te deja expuesto: Goti suma 6 de daño al siguiente golpe.', challenge: { table: 'grimorio + brujas', prompt: 'Relaciona hechizos y brujas por bruja_id y encuentra a Goti.', options: ["SELECT hechizos.nombre FROM hechizos INNER JOIN brujas ON hechizos.bruja_id = brujas.id WHERE brujas.nombre = 'Goti';", "SELECT hechizos.nombre FROM hechizos JOIN brujas WHERE brujas.nombre = 'Goti';", "SELECT * FROM hechizos INNER JOIN brujas ON hechizos.id = brujas.id;"], answer: 0, hint: 'INNER JOIN une por una clave; ON define la relación y WHERE busca a Goti.' } },
];

const challengeBanks = {
  select: [
    { table: 'runas', prompt: 'Trae las runas de nivel 3 o superior.', correct: 'SELECT nombre FROM runas WHERE nivel >= 3;', wrong: ['GET nombre FROM runas IF nivel >= 3;', 'SELECT runas WHERE nivel >= 3;'], hint: 'SELECT nombra columnas, FROM la tabla y WHERE filtra filas.' },
    { table: 'brujas', prompt: 'Busca las brujas cuyo rango sea mayor que 2.', correct: 'SELECT nombre FROM brujas WHERE rango > 2;', wrong: ['SELECT nombre FROM brujas HAVING rango > 2;', 'GET nombre FROM brujas WHERE rango > 2;'], hint: 'WHERE filtra registros antes de agrupar resultados.' },
    { table: 'hechizos', prompt: 'Muestra los hechizos con costo menor o igual a 10.', correct: 'SELECT nombre FROM hechizos WHERE costo <= 10;', wrong: ['SELECT hechizos WHERE costo <= 10;', 'FETCH nombre IN hechizos IF costo <= 10;'], hint: 'Usa <= para incluir también el valor 10.' },
    { table: 'usuarios', prompt: 'Encuentra los usuarios activos de la tabla.', correct: "SELECT nombre FROM usuarios WHERE estado = 'activo';", wrong: ['GET nombre FROM usuarios WHERE estado = activo;', 'SELECT usuarios.nombre estado = activo;'], hint: 'Compara el texto con comillas y filtra con WHERE.' },
    { table: 'hechizos', prompt: 'Muestra todos los datos del hechizo con id 12.', correct: 'SELECT * FROM hechizos WHERE id = 12;', wrong: ['SELECT hechizos IF id = 12;', 'GET * hechizos WHERE id = 12;'], hint: 'El asterisco representa todas las columnas.' },
    { table: 'guardianes', prompt: 'Busca guardianes cuyo nivel sea exactamente 5.', correct: 'SELECT nombre FROM guardianes WHERE nivel = 5;', wrong: ['SELECT nombre guardianes IF nivel = 5;', 'SELECT nombre FROM guardianes HAVING nivel = 5;'], hint: 'FROM indica la tabla y WHERE compara el nivel.' },
    { table: 'misiones', prompt: 'Lista las misiones que aún no están completas.', correct: "SELECT nombre FROM misiones WHERE estado <> 'completa';", wrong: ["SELECT nombre FROM misiones IF estado <> 'completa';", "SELECT nombre FROM misiones WHERE estado NOT 'completa';"], hint: '<> significa distinto de.' },
    { table: 'reliquias', prompt: 'Encuentra las reliquias con poder entre 10 y 20.', correct: 'SELECT nombre FROM reliquias WHERE poder BETWEEN 10 AND 20;', wrong: ['SELECT nombre FROM reliquias BETWEEN poder 10 AND 20;', 'SELECT reliquias WHERE poder >= 10 AND <= 20;'], hint: 'BETWEEN establece un rango inclusivo dentro de WHERE.' },
    { table: 'usuarios', prompt: 'Busca usuarios cuyo nombre empiece con A.', correct: "SELECT nombre FROM usuarios WHERE nombre LIKE 'A%';", wrong: ["SELECT nombre FROM usuarios WHERE nombre STARTS 'A';", "SELECT nombre FROM usuarios LIKE 'A%';"], hint: 'LIKE permite patrones; % representa cualquier continuación.' },
    { table: 'runas', prompt: 'Muestra las runas ordenadas por poder de mayor a menor.', correct: 'SELECT nombre FROM runas ORDER BY poder DESC;', wrong: ['SELECT nombre FROM runas SORT poder DESC;', 'SELECT nombre FROM runas ORDER BY poder;'], hint: 'ORDER BY ordena resultados; DESC invierte a mayor primero.' },
    { table: 'hechizos', prompt: 'Cuenta cuántos hechizos hay registrados.', correct: 'SELECT COUNT(*) FROM hechizos;', wrong: ['COUNT hechizos;', 'SELECT TOTAL(*) FROM hechizos;'], hint: 'COUNT(*) cuenta las filas de la tabla.' },
  ],
  insert: [
    { table: 'sellos', prompt: 'Inserta un sello inestable para Goti (id 7).', correct: "INSERT INTO sellos (goti_id, estado) VALUES (7, 'inestable');", wrong: ['UPDATE sellos SET goti_id = 7;', "INSERT sellos SET goti_id = 7 AND estado = 'inestable';"], hint: 'INSERT INTO tabla (columnas) VALUES (valores).' },
    { table: 'pociones', prompt: 'Añade una poción curativa con 30 puntos.', correct: "INSERT INTO pociones (tipo, poder) VALUES ('cura', 30);", wrong: ["INSERT pociones SET tipo = 'cura', poder = 30;", "UPDATE pociones (tipo, poder) VALUES ('cura', 30);"], hint: 'INSERT INTO nombra la tabla y las columnas; VALUES aporta cada valor.' },
    { table: 'aliados', prompt: 'Registra a Azur como aliado del equipo 2.', correct: "INSERT INTO aliados (nombre, equipo_id) VALUES ('Azur', 2);", wrong: ["INSERT INTO aliados VALUES nombre = 'Azur' AND equipo_id = 2;", "ADD INTO aliados (nombre, equipo_id) VALUES ('Azur', 2);"], hint: 'Cada valor debe corresponder, en orden, a una columna.' },
    { table: 'inventario', prompt: 'Agrega una llave con cantidad 1 al inventario.', correct: "INSERT INTO inventario (objeto, cantidad) VALUES ('llave', 1);", wrong: ["INSERT inventario (objeto, cantidad) VALUES ('llave', 1);", "UPDATE inventario SET objeto = 'llave', cantidad = 1;"], hint: 'Recuerda escribir INTO después de INSERT.' },
    { table: 'runas', prompt: 'Añade la runa eclipse de nivel 4.', correct: "INSERT INTO runas (nombre, nivel) VALUES ('eclipse', 4);", wrong: ["INSERT runas (nombre, nivel) VALUES ('eclipse', 4);", "UPDATE runas SET nombre = 'eclipse', nivel = 4;"], hint: 'Las columnas y los valores deben ir en el mismo orden.' },
    { table: 'misiones', prompt: 'Registra una misión llamada Rescate con estado nueva.', correct: "INSERT INTO misiones (nombre, estado) VALUES ('Rescate', 'nueva');", wrong: ["INSERT INTO misiones SET nombre = 'Rescate' AND estado = 'nueva';", "ADD INTO misiones (nombre, estado) VALUES ('Rescate', 'nueva');"], hint: 'VALUES contiene un valor por cada columna indicada.' },
    { table: 'usuarios', prompt: 'Crea el usuario Nox con id 9.', correct: "INSERT INTO usuarios (id, nombre) VALUES (9, 'Nox');", wrong: ["INSERT INTO usuarios (id, nombre) VALUE (9, 'Nox');", "CREATE ROW usuarios (9, 'Nox');"], hint: 'La palabra clave correcta es VALUES, incluso para una fila.' },
    { table: 'inventario', prompt: 'Agrega tres fragmentos al inventario de Azur.', correct: "INSERT INTO inventario (usuario_id, objeto, cantidad) VALUES (1, 'fragmento', 3);", wrong: ["INSERT INTO inventario (usuario_id, objeto, cantidad) VALUES ('fragmento', 3, 1);", "INSERT inventario VALUES (1, 'fragmento', 3);"], hint: 'Alinea usuario_id, objeto y cantidad con sus valores.' },
    { table: 'guardianes', prompt: 'Añade a Lira como guardiana de nivel 6.', correct: "INSERT INTO guardianes (nombre, nivel) VALUES ('Lira', 6);", wrong: ["INSERT INTO guardianes (nombre, nivel) SET ('Lira', 6);", "UPDATE guardianes VALUES ('Lira', 6);"], hint: 'INSERT INTO seguido de columnas y luego VALUES.' },
    { table: 'sellos', prompt: 'Registra un sello activo con duración 100.', correct: "INSERT INTO sellos (estado, duracion) VALUES ('activo', 100);", wrong: ["INSERT INTO sellos (estado, duracion) VALUES (activo, 100);", "INSERT sellos SET estado = 'activo', duracion = 100;"], hint: 'Los valores de texto deben escribirse entre comillas.' },
    { table: 'pociones', prompt: 'Añade dos pociones de tipo escudo.', correct: "INSERT INTO pociones (tipo, cantidad) VALUES ('escudo', 2);", wrong: ["INSERT INTO pociones (tipo, cantidad) VALUE ('escudo', 2);", "INSERT pociones (tipo, cantidad) VALUES ('escudo', 2);"], hint: 'No olvides INTO y la S final en VALUES.' },
  ],
  join: [
    { table: 'hechizos + brujas', prompt: 'Une hechizos con brujas por bruja_id y busca a Goti.', correct: "SELECT hechizos.nombre FROM hechizos INNER JOIN brujas ON hechizos.bruja_id = brujas.id WHERE brujas.nombre = 'Goti';", wrong: ["SELECT hechizos.nombre FROM hechizos JOIN brujas WHERE brujas.nombre = 'Goti';", 'SELECT * FROM hechizos INNER JOIN brujas ON hechizos.id = brujas.id;'], hint: 'INNER JOIN une por una clave; ON define la relación y WHERE filtra a Goti.' },
    { table: 'misiones + guardianes', prompt: 'Une misiones y guardianes por guardian_id para ver las misiones de Lira.', correct: "SELECT misiones.nombre FROM misiones INNER JOIN guardianes ON misiones.guardian_id = guardianes.id WHERE guardianes.nombre = 'Lira';", wrong: ["SELECT misiones.nombre FROM misiones INNER JOIN guardianes WHERE guardianes.nombre = 'Lira';", 'SELECT misiones.nombre FROM misiones JOIN guardianes ON misiones.id = guardianes.id;'], hint: 'La clave foránea guardian_id debe apuntar al id del guardián.' },
    { table: 'objetos + inventario', prompt: 'Relaciona objetos con inventario usando objeto_id.', correct: 'SELECT objetos.nombre FROM objetos INNER JOIN inventario ON inventario.objeto_id = objetos.id;', wrong: ['SELECT objetos.nombre FROM objetos INNER JOIN inventario WHERE inventario.objeto_id;', 'SELECT objetos.nombre FROM objetos JOIN inventario ON objetos.id = inventario.id;'], hint: 'ON compara la clave objeto_id con la llave primaria objetos.id.' },
    { table: 'usuarios + equipos', prompt: 'Une usuarios con equipos mediante equipo_id.', correct: 'SELECT usuarios.nombre FROM usuarios INNER JOIN equipos ON usuarios.equipo_id = equipos.id;', wrong: ['SELECT usuarios.nombre FROM usuarios INNER JOIN equipos WHERE usuarios.equipo_id;', 'SELECT usuarios.nombre FROM usuarios JOIN equipos ON usuarios.id = equipos.id;'], hint: 'Relaciona la columna equipo_id del usuario con equipos.id.' },
    { table: 'hechizos + grimorios', prompt: 'Une cada hechizo con su grimorio usando grimorio_id.', correct: 'SELECT hechizos.nombre FROM hechizos INNER JOIN grimorios ON hechizos.grimorio_id = grimorios.id;', wrong: ['SELECT hechizos.nombre FROM hechizos INNER JOIN grimorios WHERE hechizos.grimorio_id;', 'SELECT hechizos.nombre FROM hechizos JOIN grimorios ON hechizos.id = grimorios.id;'], hint: 'ON conecta la clave foránea grimorio_id con grimorios.id.' },
    { table: 'brujas + núcleos', prompt: 'Encuentra el núcleo de Goti mediante la relación nucleo_id.', correct: "SELECT nucleos.nombre FROM brujas INNER JOIN nucleos ON brujas.nucleo_id = nucleos.id WHERE brujas.nombre = 'Goti';", wrong: ["SELECT nucleos.nombre FROM brujas INNER JOIN nucleos WHERE brujas.nombre = 'Goti';", "SELECT nucleos.nombre FROM brujas JOIN nucleos ON brujas.id = nucleos.id WHERE brujas.nombre = 'Goti';"], hint: 'Combina INNER JOIN, una condición ON correcta y el filtro WHERE.' },
    { table: 'objetos + cofres', prompt: 'Lista los objetos del cofre con id 3.', correct: 'SELECT objetos.nombre FROM objetos INNER JOIN cofres ON objetos.cofre_id = cofres.id WHERE cofres.id = 3;', wrong: ['SELECT objetos.nombre FROM objetos INNER JOIN cofres WHERE cofres.id = 3;', 'SELECT objetos.nombre FROM objetos JOIN cofres ON objetos.id = cofres.id WHERE cofres.id = 3;'], hint: 'Relaciona cofre_id con cofres.id y filtra el cofre 3.' },
    { table: 'jugadores + partidas', prompt: 'Muestra las partidas de Azur usando jugador_id.', correct: "SELECT partidas.id FROM partidas INNER JOIN jugadores ON partidas.jugador_id = jugadores.id WHERE jugadores.nombre = 'Azur';", wrong: ["SELECT partidas.id FROM partidas INNER JOIN jugadores WHERE jugadores.nombre = 'Azur';", "SELECT partidas.id FROM partidas JOIN jugadores ON partidas.id = jugadores.id WHERE jugadores.nombre = 'Azur';"], hint: 'La tabla partidas guarda jugador_id, que apunta a jugadores.id.' },
    { table: 'armas + héroes', prompt: 'Une armas con héroes por heroe_id para hallar a Goti.', correct: "SELECT armas.nombre FROM armas INNER JOIN heroes ON armas.heroe_id = heroes.id WHERE heroes.nombre = 'Goti';", wrong: ["SELECT armas.nombre FROM armas INNER JOIN heroes WHERE heroes.nombre = 'Goti';", "SELECT armas.nombre FROM armas JOIN heroes ON armas.id = heroes.id WHERE heroes.nombre = 'Goti';"], hint: 'ON debe usar heroe_id; WHERE identifica a Goti.' },
    { table: 'hechizos + elementos', prompt: 'Muestra el elemento de cada hechizo con elemento_id.', correct: 'SELECT hechizos.nombre, elementos.tipo FROM hechizos INNER JOIN elementos ON hechizos.elemento_id = elementos.id;', wrong: ['SELECT hechizos.nombre, elementos.tipo FROM hechizos INNER JOIN elementos WHERE hechizos.elemento_id;', 'SELECT hechizos.nombre FROM hechizos JOIN elementos ON hechizos.id = elementos.id;'], hint: 'Puedes seleccionar columnas de ambas tablas después del JOIN.' },
    { table: 'misiones + recompensas', prompt: 'Busca la recompensa de la misión con id 8.', correct: 'SELECT recompensas.objeto FROM misiones INNER JOIN recompensas ON recompensas.mision_id = misiones.id WHERE misiones.id = 8;', wrong: ['SELECT recompensas.objeto FROM misiones INNER JOIN recompensas WHERE misiones.id = 8;', 'SELECT recompensas.objeto FROM misiones JOIN recompensas ON recompensas.id = misiones.id WHERE misiones.id = 8;'], hint: 'La clave mision_id conecta recompensas con misiones.id.' },
  ],
  firewall: [
    { table: 'firewall', prompt: 'Activa la regla del firewall para el puerto 443.', correct: 'UPDATE firewall SET activo = TRUE WHERE puerto = 443;', wrong: ['SELECT firewall SET activo = TRUE WHERE puerto = 443;', 'INSERT INTO firewall (activo) VALUES (TRUE) WHERE puerto = 443;'], hint: 'UPDATE cambia columnas existentes; WHERE limita qué regla modificar.' },
    { table: 'firewall', prompt: 'Desactiva la regla del puerto 80.', correct: 'UPDATE firewall SET activo = FALSE WHERE puerto = 80;', wrong: ['DELETE firewall SET activo = FALSE WHERE puerto = 80;', 'UPDATE firewall activo = FALSE IF puerto = 80;'], hint: 'La estructura es UPDATE tabla SET columna = valor WHERE condición.' },
    { table: 'firewall', prompt: 'Cambia a seguro el estado de la regla con id 4.', correct: "UPDATE firewall SET estado = 'seguro' WHERE id = 4;", wrong: ["UPDATE firewall estado = 'seguro' WHERE id = 4;", "INSERT INTO firewall SET estado = 'seguro' WHERE id = 4;"], hint: 'SET asigna el nuevo valor y WHERE apunta solo a la regla 4.' },
    { table: 'firewall', prompt: 'Bloquea la dirección que coincide con 10.0.0.8.', correct: "UPDATE firewall SET estado = 'bloqueado' WHERE ip = '10.0.0.8';", wrong: ["UPDATE firewall estado = 'bloqueado' WHERE ip = '10.0.0.8';", "INSERT INTO firewall (estado) VALUES ('bloqueado') WHERE ip = '10.0.0.8';"], hint: 'UPDATE usa SET para cambiar el estado de la fila filtrada.' },
    { table: 'firewall', prompt: 'Aumenta a 90 el nivel de seguridad de la regla 2.', correct: 'UPDATE firewall SET seguridad = 90 WHERE id = 2;', wrong: ['UPDATE firewall seguridad = 90 WHERE id = 2;', 'SELECT firewall SET seguridad = 90 WHERE id = 2;'], hint: 'Escribe UPDATE tabla SET columna = valor WHERE condición.' },
    { table: 'firewall', prompt: 'Permite el puerto 22 poniendo activo en TRUE.', correct: 'UPDATE firewall SET activo = TRUE WHERE puerto = 22;', wrong: ['UPDATE firewall SET activo == TRUE WHERE puerto = 22;', 'UPDATE firewall WHERE puerto = 22 SET activo = TRUE;'], hint: 'En SET usa un solo signo igual y coloca WHERE al final.' },
    { table: 'firewall', prompt: 'Cambia a nivel 3 todas las reglas de la zona norte.', correct: "UPDATE firewall SET nivel = 3 WHERE zona = 'norte';", wrong: ["UPDATE firewall SET nivel = 3 IF zona = 'norte';", "UPDATE firewall nivel = 3 WHERE zona = 'norte';"], hint: 'WHERE también puede filtrar por una columna de texto.' },
    { table: 'firewall', prompt: 'Marca como revisada la regla identificada con id 11.', correct: "UPDATE firewall SET estado = 'revisada' WHERE id = 11;", wrong: ["UPDATE firewall estado = 'revisada' WHERE id = 11;", "UPDATE firewall SET estado = 'revisada' IF id = 11;"], hint: 'No omitas SET y usa WHERE para limitar el cambio.' },
  ],
};

function drawChallenge(type) {
  const bank = challengeBanks[type];
  const template = bank[Math.floor(Math.random() * bank.length)];
  const answers = [{ text: template.correct, correct: true }, ...template.wrong.map(text => ({ text, correct: false }))];
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }
  return { table: template.table, prompt: template.prompt, hint: template.hint, options: answers.map(item => item.text), answer: answers.findIndex(item => item.correct) };
}

const finaleOptions = [
  { id: 'delete', name: 'DELETE', hint: 'Eliminar una fila concreta.', query: 'DELETE FROM brujas WHERE id = 7;' },
  { id: 'subquery', name: 'SUBCONSULTA', hint: 'Resolver una consulta dentro de otra.', query: 'INSERT INTO sellos (bruja_id, duracion) VALUES ((SELECT id FROM brujas WHERE id = 7), 1000);' },
  { id: 'join', name: 'INNER JOIN', hint: 'Vincular dos registros por una clave.', query: 'INSERT INTO sellos (goti_id, guardian_id) SELECT brujas.id, guardianes.id FROM brujas INNER JOIN guardianes ON guardianes.nucleo_id = brujas.nucleo_id WHERE brujas.id = 7;' },
];

const endingStories = {
  delete: { title: 'La última fila.', text: 'La consulta borra el registro de Goti. Su cuerpo se deshace en datos y la señal de la bruja desaparece para siempre. La red queda libre, pero algo en Azur sabe que esa victoria tuvo un precio.' },
  subquery: { title: 'Mil años de silencio.', text: 'La subconsulta encuentra el núcleo de Goti y lo encierra en un sello que durará mil años. Azur cierra la base de datos mientras la bruja queda atrapada, consciente, dentro del grimorio.' },
  join: { title: 'Un vínculo eterno.', text: 'El INNER JOIN une los destinos de Azur y Goti. Azur se sacrifica y ambos quedan sellados en el núcleo, luchando juntos en una batalla que no tendrá final.' },
};

const firstContactDialogues = [
  { speaker: 'GOTI · BRUJA DEL MALWARE', portrait: '/portraits/goti-speaking.jpg', text: 'Me llaman Goti, guardiana del firewall. En esta ciudad no sale ni entra un dato sin que yo lo permita.' },
  { speaker: 'AZUR · PROGRAMADOR', portrait: '/portraits/azur-reply.png', text: 'Soy Azur. Si controlas los datos, también debe existir una tabla de permisos. Voy a descubrir qué escondes.' },
  { speaker: 'GOTI · BRUJA DEL MALWARE', portrait: '/portraits/goti-speaking.jpg', text: 'Entonces demuéstrame que tus consultas valen más que mis defensas, programador.' },
];

function BattleArena({ scene, attackActive, witchAttackActive, playerHit, witchHit, playerHp, witchHp, witchMaxHp = 100, inCombat = false, showBattlefield = false }) {
  return <div className={`scene-art ${scene >= 2 || showBattlefield ? 'battle-arena' : ''}`}>
    <div className="stars">✦ <span>·</span> ✧ <span>·</span> ✦</div>
    <div className="moon"/><div className="city city-back"/><div className="city city-front"/><div className="terminal-glow"/>
    {inCombat && <div className="combat-hud">
      <div className="hp-card player-hp"><div className="hp-caption"><b>AZUR</b><span>{playerHp} PV</span></div><div className="hp-track"><div className="hp-fill" style={{ width: `${Math.min(100, playerHp / 140 * 100)}%` }}/></div></div>
      <div className="hp-card witch-hp"><div className="hp-caption"><b>GOTI</b><span>{witchHp} PV</span></div><div className="hp-track"><div className="hp-fill" style={{ width: `${Math.min(100, witchHp / witchMaxHp * 100)}%` }}/></div></div>
    </div>}
    <div className={`character azur idle-sprite ${scene >= 2 || showBattlefield ? 'battle-player' : ''} ${attackActive ? 'attacking' : ''} ${playerHit ? 'player-hit' : ''}`}>
      <img src={attackActive ? '/sprites/azur-attack.gif' : '/sprites/azur-idle.gif'} alt={attackActive ? 'Azur atacando' : 'Azur en animación idle'} />
    </div>
    {scene >= 2 && <div className={`character witch battle-witch ${witchAttackActive ? 'enemy-attacking' : ''} ${witchHit ? 'enemy-hit' : ''}`}><img src="/sprites/goti-idle.gif" alt="Goti, bruja del malware"/></div>}
    <div className="pixel-spark s1">✦</div><div className="pixel-spark s2">✧</div>
    <div className="scene-label"><span className="live-dot"/> ESCENA {String(scene + 1).padStart(2,'0')} <span>·</span> NOCHE 01</div>
  </div>;
}

function App() {
  const [screen, setScreen] = useState('menu');
  const [hero, setHero] = useState('azur');
  const [difficulty, setDifficulty] = useState('normal');
  const [scene, setScene] = useState(0);
  const [choice, setChoice] = useState(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [dialogueComplete, setDialogueComplete] = useState(false);
  const [q, setQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [selectedMoveId, setSelectedMoveId] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [endingChoice, setEndingChoice] = useState(null);
  const [defeatVideoDone, setDefeatVideoDone] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(1);
  const [showHint, setShowHint] = useState(false);
  const [muted, setMuted] = useState(false);
  const [attackActive, setAttackActive] = useState(false);
  const [witchAttackActive, setWitchAttackActive] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [witchHit, setWitchHit] = useState(false);
  const [playerHp, setPlayerHp] = useState(100);
  const [witchHp, setWitchHp] = useState(100);
  const [witchTurns, setWitchTurns] = useState(0);
  const [firewallReady, setFirewallReady] = useState(false);
  const [combatPanel, setCombatPanel] = useState('menu');
  const [combatMessage, setCombatMessage] = useState('Goti bloquea el paso. Elige una acción.');
  const [guarding, setGuarding] = useState(false);
  const [potions, setPotions] = useState(1);
  const [firewallCooldown, setFirewallCooldown] = useState(0);
  const [turnBusy, setTurnBusy] = useState(false);

  const difficultySettings = {
    easy: { playerHp: 140, witchHp: 160, damage: 18, armor: 0, guardDamageMultiplier: 0.5, surgeEvery: 0, surgeBonus: 0, label: 'INICIACIÓN' },
    normal: { playerHp: 140, witchHp: 195, damage: 22, armor: 0.05, guardDamageMultiplier: 0.5, surgeEvery: 3, surgeBonus: 8, label: 'OPERATIVO' },
    hard: { playerHp: 140, witchHp: 240, damage: 24, armor: 0.12, guardDamageMultiplier: 0.5, surgeEvery: 3, surgeBonus: 10, label: 'PESADILLA' },
  };
  const currentDifficulty = difficultySettings[difficulty];

  useEffect(() => {
    if (screen === 'lesson' && playerHp <= 0) setScreen('defeat');
    if (screen === 'lesson' && witchHp <= 0) setScreen('final-choice');
  }, [playerHp, witchHp, screen]);

  const scenes = [
    { tag: 'CAPÍTULO 01 · EL DESPERTAR', title: 'El último reinicio', who: 'AZUR', copy: 'El zumbido de un servidor te arranca del sueño. Abres los ojos en una habitación que huele a polvo y electricidad. En tu pantalla parpadea un mensaje: “La red ha caído. No confíes en las brujas”.', next: 'Incorporarme y revisar la terminal', alt: 'Buscar quién dejó el mensaje' },
    { tag: 'CAPÍTULO 01 · EL DESPERTAR', title: 'Una señal en la estática', who: 'AZUR', copy: choice === 'Buscar quién dejó el mensaje' ? 'Encuentras una nota de voz dañada. Una voz susurra: “El archivo de usuarios… está en el núcleo”. Desde el pasillo, algo raspa la puerta.' : 'La terminal aún responde. Alguien dejó una base de datos abierta y una advertencia: las brujas del malware ya están dentro. Una luz roja tiñe el pasillo.', next: 'Abrir la base de datos', alt: 'Seguir la señal hacia el pasillo' },
    { tag: 'CAPÍTULO 01 · PRIMER CONTACTO', title: 'La guardiana del firewall', who: 'GOTI · BRUJA DEL MALWARE', copy: 'Una figura emerge entre píxeles rotos. “¿Despierto, programador? Qué tierno. A ver si tus consultas son mejores que tus defensas”. El firewall vibra: tienes una sola oportunidad para abrirte paso.', next: 'Enfrentarla con una consulta SQL', alt: 'Intentar negociar con Goti' },
  ];
  const startBattle = (path) => {
    setChoice(path);
    setScreen('lesson');
    setCombatPanel('menu');
    setPlayerHp(currentDifficulty.playerHp); setWitchHp(currentDifficulty.witchHp); setWitchTurns(0); setGuarding(false); setFirewallReady(false);
    setPotions(1); setFirewallCooldown(0); setActiveChallenge(null); setTurnBusy(false);
    setEndingChoice(null); setSelectedMoveId(null); setDefeatVideoDone(false);
    setCombatMessage(path === scenes[2].alt ? 'Goti rechaza la negociación. ¡Elige tu movimiento!' : 'Goti bloquea el paso. ¡Elige tu movimiento!');
    setQ(0); setSelected(null); setShowHint(false);
  };
  const chooseStory = (path) => {
    if (scene < 2) {
      if (scene === 1) { setDialogueIndex(0); setDialogueComplete(false); }
      setScene(scene + 1);
      setChoice(path);
    } else startBattle(path);
  };
  const continueDialogue = () => {
    if (dialogueIndex < firstContactDialogues.length - 1) setDialogueIndex(dialogueIndex + 1);
    else setDialogueComplete(true);
  };
  const resolveWitchTurn = ({ protectedTurn = guarding, incomingMultiplier = 1, incomingBonus = 0, preserveFirewall = false } = {}) => {
    setWitchAttackActive(true);
    const turnNumber = witchTurns + 1;
    const surging = currentDifficulty.surgeEvery > 0 && turnNumber % currentDifficulty.surgeEvery === 0;
    const firewallShield = firewallReady;
    setWitchTurns(turnNumber);
    setCombatMessage(surging ? 'Goti concentra la Sobrecarga. Defiendete o activa Cortafuegos.' : 'Goti prepara Malware en cadena...');
    window.setTimeout(() => {
      setWitchAttackActive(false);
      const rawDamage = currentDifficulty.damage + (surging ? currentDifficulty.surgeBonus : 0) + incomingBonus;
      const protectedNow = protectedTurn || firewallShield;
      const damage = Math.ceil(rawDamage * incomingMultiplier * (protectedNow ? currentDifficulty.guardDamageMultiplier : 1));
      setPlayerHp(current => Math.max(0, current - damage));
      setPlayerHit(true);
      window.setTimeout(() => setPlayerHit(false), 450);
      setGuarding(false);
      if (!preserveFirewall) setFirewallReady(false);
      setFirewallCooldown(current => Math.max(0, current - 1));
      setCombatMessage((surging ? 'Sobrecarga! ' : '') + (protectedNow ? 'Azur reduce el golpe: -' : 'Goti alcanza a Azur: -') + damage + ' PV.');
      setCombatPanel('menu');
      setTurnBusy(false);
    }, 680);
  };
  const beginSqlAttack = () => {
    if (turnBusy) return;
    setCombatPanel('sql-menu'); setSelected(null); setShowHint(false);
  };
  const chooseSqlMove = (moveId) => {
    if (turnBusy) return;
    setSelectedMoveId(moveId); setActiveChallenge(drawChallenge(moveId)); setSelected(null); setShowHint(false); setCombatPanel('sql-challenge');
  };
  const defend = () => {
    if (turnBusy) return;
    setTurnBusy(true); setGuarding(true);
    setCombatMessage('Azur levanta un escudo: el proximo golpe de Goti hara la mitad de dano.');
    window.setTimeout(() => resolveWitchTurn({ protectedTurn: true }), 300);
  };
  const useFirewall = () => {
    if (turnBusy || firewallCooldown > 0) return;
    setActiveChallenge(drawChallenge('firewall')); setSelected(null); setShowHint(false); setCombatPanel('firewall');
  };
  const usePotion = () => {
    if (turnBusy || potions <= 0 || playerHp >= currentDifficulty.playerHp) return;
    setTurnBusy(true); setPotions(potions - 1);
    setPlayerHp(current => Math.min(currentDifficulty.playerHp, current + 30));
    setCombatMessage('Azur usa un parche curativo y recupera 30 PV.');
    window.setTimeout(() => resolveWitchTurn({}), 300);
  };
  const submit = () => {
    const challenge = activeChallenge;
    if (selected === null || !challenge || turnBusy) return;
    setTurnBusy(true);
    const correct = selected === challenge.answer;
    if (!correct) {
      setHearts(current => Math.max(0, current - 1)); setStreak(1);
      setCombatMessage('Consulta incorrecta. Goti aprovecha el error.');
      setSelected(null);
      window.setTimeout(() => resolveWitchTurn({}), 320);
      return;
    }
    setXp(current => current + 10); setStreak(current => current + 1);
    setSelected(null); setShowHint(false);
    if (combatPanel === 'firewall') {
      setFirewallCooldown(4);
      setFirewallReady(true);
      setPlayerHp(current => Math.min(currentDifficulty.playerHp, current + 30));
      setCombatMessage('Consulta correcta. Cortafuegos cura 30 PV y reduce a la mitad este golpe y el siguiente. Recarga: 3 turnos.');
      window.setTimeout(() => resolveWitchTurn({ protectedTurn: true, preserveFirewall: true }), 300);
      return;
    }
    const move = selectedMove;
    const damage = Math.max(1, Math.round(move.damage * (1 - currentDifficulty.armor)));
    const nextWitchHp = Math.max(0, witchHp - damage);
    setWitchHp(nextWitchHp); setQ(current => (current + 1) % sqlMoves.length);
    setWitchHit(true); setAttackActive(true);
    setCombatMessage('Consulta correcta: ' + move.name + ' inflige ' + damage + ' PV.');
    const incomingMultiplier = move.id === 'select' ? 0.75 : 1;
    const incomingBonus = move.id === 'join' ? 6 : 0;
    window.setTimeout(() => {
      setAttackActive(false); setWitchHit(false);
      if (nextWitchHp > 0) resolveWitchTurn({ incomingMultiplier, incomingBonus });
      else setTurnBusy(false);
    }, 760);
  };
  const selectedMove = sqlMoves.find(move => move.id === selectedMoveId);
  const question = activeChallenge || questions[q];
  const dialogueLine = firstContactDialogues[dialogueIndex];
  const endingStory = endingChoice ? endingStories[endingChoice] : null;
  const nextGotiTurn = witchTurns + 1;
  const nextSurge = currentDifficulty.surgeEvery > 0 && nextGotiTurn % currentDifficulty.surgeEvery === 0;
  const nextGotiDamage = currentDifficulty.damage + (nextSurge ? currentDifficulty.surgeBonus : 0);
  const showingSqlAttack = combatPanel === 'sql-challenge' && selectedMove;
  const incomingPreview = Math.ceil((nextGotiDamage + (showingSqlAttack && selectedMove.id === 'join' ? 6 : 0)) * (showingSqlAttack && selectedMove.id === 'select' ? 0.75 : 1) * (firewallReady ? currentDifficulty.guardDamageMultiplier : 1));
  const beginOpening = () => {
    if (!hero) return;
    setScreen('intro');
  };
  const finishOpening = () => {
    setScreen('story');
    setScene(0);
    setChoice(null);
  };
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#" onClick={e => {e.preventDefault(); setScreen('menu'); setScene(0);}}><span className="brand-mark">A</span><span>AZUR<span className="brand-sub"> / CÓDIGO DE LAS SOMBRAS</span></span></a>{screen !== "menu" && screen !== "character" && screen !== "difficulty" && <div className="stats"><div className="stat"><Flame size={17} fill="#ff9b58" color="#ff9b58"/><b>{streak}</b><span>RACHA</span></div><div className="stat"><Sparkles size={17} color="#c7a8ff"/><b>{xp}</b><span>XP</span></div><div className="stat"><Heart size={17} fill="#ff718b" color="#ff718b"/><b>{hearts}</b></div><button className="icon-btn" aria-label="Activar o silenciar sonido" onClick={() => setMuted(!muted)}>{muted ? <VolumeX size={17}/> : <Volume2 size={17}/>}</button></div>}</header>
    <main>
      {screen === 'menu' && <section className="game-menu"><div className="menu-backdrop"><div className="menu-grid"/><div className="menu-rune rune-one">✳</div><div className="menu-rune rune-two">⌘</div><img src="/sprites/azur-idle.gif" alt="Azur, listo para comenzar"/></div><div className="menu-copy"><div className="menu-eyebrow"><span/> UNA AVENTURA DE CÓDIGO <span/></div><h1>AZUR<span>:</span><br/><em>CÓDIGO DE<br/>LAS SOMBRAS</em></h1><p>Despierta. Aprende. Sobrevive a las brujas del malware.</p><button className="play-button" onClick={() => setScreen('character')}><span>JUGAR</span><ChevronRight size={21}/></button><div className="menu-footnote">UNA HISTORIA INTERACTIVA <b>·</b> EPISODIO 01</div></div><div className="menu-version">BUILD 01.07 <span>●</span> EN LÍNEA</div></section>}
      {screen === 'character' && <section className="setup-screen"><div className="setup-heading"><span className="setup-step">01 / 02 · SELECCIÓN</span><h1>Elige tu personaje</h1><p>Tu historia comienza con quien despierta.</p></div><div className="character-select-grid"><button className="hero-card selected-hero" onClick={() => setHero('azur')}><span className="hero-card-top"><b>PERSONAJE PRINCIPAL</b><span>DISPONIBLE</span></span><img src="/sprites/azur-idle.gif" alt="Azur"/><span className="hero-card-name">AZUR</span><span className="hero-card-role">Programador · Espadachín de datos</span><span className="hero-card-stats"><i>⚔ AGILIDAD</i><i>⌘ SQL</i><i>◈ SOMBRA</i></span>{hero === 'azur' && <span className="hero-selected-mark">✓ SELECCIONADO</span>}</button><div className="hero-lore"><span className="chapter-label"><Sparkles size={14}/> EL ÚLTIMO REINICIO</span><h2>Un sistema.<br/>Una última oportunidad.</h2><p>Tras un largo sueño, Azur despierta en una ciudad tomada por las brujas del malware. Sus únicas armas: una espada y el código que aún recuerda.</p><div className="selection-count">01 <span>/</span> 01 <small>HÉROE DISPONIBLE</small></div></div></div><div className="setup-actions"><button className="setup-back" onClick={() => setScreen('menu')}><ChevronLeft size={17}/> VOLVER</button><button className="setup-next" onClick={() => setScreen('difficulty')}>ELEGIR DIFICULTAD <ChevronRight size={18}/></button></div></section>}
      {screen === 'difficulty' && <section className="setup-screen difficulty-screen"><div className="setup-heading"><span className="setup-step">02 / 02 · PREPARACIÓN</span><h1>Elige la dificultad</h1><p>La amenaza cambia. La historia, no.</p></div><div className="difficulty-grid">{[{id:'easy',name:'INICIACIÓN',desc:'El punto de partida: Goti ya es peligrosa.',detail:'Goti 160 PV · golpe de 18 · sin armadura',sigil:'◇'},{id:'normal',name:'OPERATIVO',desc:'Armadura y sobrecargas ocasionales.',detail:'Goti 195 PV · golpe de 22 · armadura 5% · sobrecarga +8 cada 3 turnos',sigil:'⌘'},{id:'hard',name:'PESADILLA',desc:'Solo gana quien gestione cada turno.',detail:'Goti 240 PV · golpe de 24 · armadura 12% · sobrecarga +10 cada 3 turnos',sigil:'☠'}].map((level,index)=><button key={level.id} className={`difficulty-card ${difficulty === level.id ? 'difficulty-selected' : ''}`} onClick={() => setDifficulty(level.id)}><span className="difficulty-index">0{index+1} <i>{level.sigil}</i></span><b>{level.name}</b><span className="difficulty-desc">{level.desc}</span><span className="difficulty-detail">{level.detail}</span><span className="difficulty-radio">{difficulty === level.id ? '✓' : ''}</span></button>)}</div><div className="difficulty-summary"><span>SELECCIÓN</span><b>{hero.toUpperCase()} <i>·</i> {currentDifficulty.label}</b><span className="difficulty-summary-note">AZUR {currentDifficulty.playerHp} PV <i>·</i> GOTI {currentDifficulty.witchHp} PV <i>·</i> {currentDifficulty.damage} DAÑO</span></div><div className="setup-actions"><button className="setup-back" onClick={() => setScreen('character')}><ChevronLeft size={17}/> PERSONAJE</button><button className="setup-next" onClick={beginOpening}>INICIAR AVENTURA <ChevronRight size={18}/></button></div></section>}
      {screen === 'intro' && <section className="opening-cinematic"><video className="opening-video" src="/cinematics/azur-opening.mp4" autoPlay muted={muted} playsInline onEnded={finishOpening} onError={finishOpening}/><div className="cinematic-shade"/><div className="cinematic-caption"><span>AZUR · CÓDIGO DE LAS SOMBRAS</span><b>El último reinicio</b><i>EPISODIO 01</i></div><button className="skip-cinematic" onClick={finishOpening}>OMITIR INTRO <ChevronRight size={16}/></button></section>}
      <div className="lesson-head"><button className="back-btn" onClick={() => { setScreen('story'); setScene(Math.min(scene, 2)); }} aria-label="Volver"><ChevronLeft size={21}/></button><div className="progress-track"><div className="progress-fill" style={{width: screen === 'lesson' ? `${(q / questions.length) * 100}%` : screen === 'ending' ? '100%' : '12%'}}/></div><div className="hearts-inline"><Heart size={16} fill="#ff718b" color="#ff718b"/> {hearts}</div></div>
      {screen === 'story' && <section className="story-layout visual-novel-scene">
        <BattleArena scene={scene} attackActive={attackActive} witchAttackActive={witchAttackActive} playerHit={playerHit} witchHit={witchHit} playerHp={playerHp} witchHp={witchHp} showBattlefield />
        <div className={`story-panel visual-novel-panel ${scene >= 2 ? 'first-contact-panel' : ''}`}>
          <div className="chapter-label"><BookOpen size={13}/>{scenes[scene].tag}</div>
          <h1>{scenes[scene].title}</h1>
          <div className="novel-dialogue-row">
            <div className={`novel-portrait ${scene >= 2 && dialogueLine.speaker.startsWith('GOTI') ? 'goti-portrait' : 'azur-portrait'}`}><img key={scene >= 2 ? dialogueLine.portrait : '/portraits/azur-intro.png'} src={scene >= 2 ? dialogueLine.portrait : '/portraits/azur-intro.png'} alt={scene >= 2 ? dialogueLine.speaker : 'Azur'}/><span>{scene >= 2 ? dialogueLine.speaker : 'AZUR / PROGRAMADOR'}</span></div>
            <div className="novel-dialogue-box" aria-live="polite">
              <div className="novel-speaker">{scene >= 2 ? dialogueLine.speaker : 'AZUR / PROGRAMADOR'}<span/></div>
              <p>{scene >= 2 ? dialogueLine.text : scenes[scene].copy}</p>
              {scene >= 2 && !dialogueComplete && <button className="novel-continue" onClick={continueDialogue}>{dialogueIndex === firstContactDialogues.length - 1 ? 'VER OPCIONES' : 'CONTINUAR'} <ChevronRight size={16}/></button>}
            </div>
          </div>
          {(scene < 2 || dialogueComplete) && <div className="choices novel-choices"><button className="choice primary" onClick={() => chooseStory(scenes[scene].next)}><span className="choice-key">1</span><span>{scenes[scene].next}</span><ChevronRight size={18}/></button><button className="choice secondary" onClick={() => chooseStory(scenes[scene].alt)}><span className="choice-key">2</span><span>{scenes[scene].alt}</span><ChevronRight size={18}/></button></div>}
          <div className="branch-note"><span className="branch-icon">›</span> Tus decisiones cambian la historia <span className="branch-line"/></div>
        </div>
      </section>}
            {screen === 'lesson' && <section className="quiz-layout">
        <BattleArena scene={scene} attackActive={attackActive} witchAttackActive={witchAttackActive} playerHit={playerHit} witchHit={witchHit} playerHp={playerHp} witchHp={witchHp} witchMaxHp={currentDifficulty.witchHp} inCombat />
        <div className="combat-lower"><div className="quiz-copy">
          {combatPanel === 'menu' && <>
            <div className="chapter-label"><Terminal size={14}/> TURNO DE AZUR</div>
            <h1>Elige tu movimiento.</h1>
            <div className="combat-actions">
              <button className="combat-action fight-action" disabled={turnBusy} onClick={beginSqlAttack}><Terminal size={18}/><span>LUCHAR<small>Elegir ataque SQL</small></span></button>
              <button className="combat-action" disabled={turnBusy} onClick={defend}><Shield size={18}/><span>DEFENDER<small>Mitad de dano este turno</small></span></button>
              <button className="combat-action" disabled={turnBusy || firewallCooldown > 0} onClick={useFirewall}><Zap size={18}/><span>CORTAFUEGOS<small>{firewallCooldown > 0 ? `Recarga · ${firewallCooldown} turnos` : 'SQL · cura 30 + escudo'}</small></span></button>
              <button className="combat-action" disabled={turnBusy || potions === 0 || playerHp >= currentDifficulty.playerHp} onClick={usePotion}><Heart size={18}/><span>MOCHILA<small>Pocion · {potions}</small></span></button>
            </div>
            <div className="combat-log" role="status">{combatMessage}</div>
          </>}
          {combatPanel === 'sql-menu' && <div className="sql-move-menu">
            <div className="chapter-label"><Terminal size={14}/> ATAQUES SQL · ELIGE UNA CONSULTA</div>
            <h1>¿Cómo golpeará Azur?</h1>
            <div className="sql-move-list">{sqlMoves.map(move => <button key={move.id} className="sql-move-card" disabled={turnBusy} onClick={() => chooseSqlMove(move.id)}><span className="sql-move-meta"><i>{move.level}</i><b>{move.damage} PV</b></span><strong>{move.name}</strong><small>{move.effect}</small><ChevronRight size={17}/></button>)}</div>
            <button className="return-actions" disabled={turnBusy} onClick={() => setCombatPanel('menu')}>← Volver al menu</button>
          </div>}
          {['sql-challenge','firewall'].includes(combatPanel) && <>
            <div className="chapter-label"><Terminal size={14}/> {combatPanel === 'firewall' ? 'CORTAFUEGOS SQL' : 'ATAQUE SQL · ' + selectedMove?.name}</div>
            <h1>{combatPanel === 'firewall' ? 'Activa la defensa.' : 'Prepara la consulta.'}</h1>
            <p className="quiz-prompt">{question.prompt}</p>
            <button className="hint-link" onClick={() => setShowHint(!showHint)}><Zap size={14}/> {showHint ? question.hint : 'Dame una pista'}</button>
            <button className="return-actions" disabled={turnBusy} onClick={() => { setCombatPanel(combatPanel === 'firewall' ? 'menu' : 'sql-menu'); setSelected(null); }}>← Volver</button>
          </>}
        </div>
        {combatPanel === 'menu' || combatPanel === 'sql-menu' ? <div className="opponent-panel">
          <div className="chapter-label"><Zap size={14}/> TURNO ENEMIGO</div>
          <h2>Goti prepara un contraataque</h2>
          <p>SELECT amortigua su respuesta; INSERT golpea sin exponerte. INNER JOIN hace más daño, pero suma 6 al contraataque. Un Cortafuegos correcto cura 30 PV, protege dos golpes y recarga durante tres turnos.</p>
          <div className="enemy-intent"><span className="enemy-pulse"/> {nextSurge ? 'GOTI CARGA SOBRECARGA' : 'SIGUIENTE CONTRAATAQUE'} <b>{nextGotiDamage} de daño</b></div>
          <div className="turn-order"><span className="turn-active">AZUR</span><ChevronRight size={15}/><span>GOTI</span><ChevronRight size={15}/><span>AZUR</span></div>
        </div> : <div className="editor-card">
          <div className="editor-head"><div><span className="window-dot red"/><span className="window-dot yellow"/><span className="window-dot green"/></div><span className="editor-title">CONSOLA DE AZUR <span>· SQL</span></span><span className="db-status"><i/> CONECTADO</span></div>
          <div className={`sql-intent-banner ${nextSurge ? 'surge-warning' : ''}`}><span className="enemy-pulse"/>{nextSurge ? 'GOTI CARGA SOBRECARGA' : 'GOTI PREPARA CONTRAATAQUE'}{showingSqlAttack && selectedMove.id === 'join' ? ' · +6 por exposición' : showingSqlAttack && selectedMove.id === 'select' ? ' · SELECT reduce su golpe' : ''}<b>{incomingPreview} PV</b></div>
          <div className="table-preview"><div className="table-name"><span>▦</span> {question.table}<span className="table-rows">3 registros</span></div><div className="table-cols"><span>id</span><span>{q === 0 ? 'nombre' : q === 1 ? 'nombre' : 'hechizo'}</span><span>{q === 0 ? 'estado' : 'nivel'}</span></div><div className="table-row"><span>01</span><span>{q === 0 ? 'Azura' : q === 1 ? 'Goti' : 'sombra.sql'}</span><span className="row-muted">● {q === 0 ? 'activo' : '3'}</span></div><div className="table-row faded"><span>02</span><span>{q === 0 ? 'Hex' : q === 1 ? 'Mora' : 'clon.exe'}</span><span className="row-muted">● {q === 0 ? 'infectado' : '5'}</span></div></div>
          <div className="editor-question"><span className="line-no">01</span><span>{question.prompt}</span></div>
          <div className="code-options">{question.options.map((opt, i) => <button key={opt} className={`code-option ${selected === i ? 'selected' : ''}`} disabled={turnBusy} onClick={() => setSelected(i)}><span className="option-radio">{String.fromCharCode(65 + i)}</span><code>{opt}</code></button>)}</div>
          <div className="feedback">{combatPanel === 'firewall' ? 'Acierta para recuperar 30 PV y activar el escudo de dos golpes.' : 'Una respuesta incorrecta desperdicia el turno y Goti contraataca.'}</div>
          <button className="submit-btn" disabled={selected === null || turnBusy} onClick={submit}>{turnBusy ? 'TURNO EN CURSO…' : 'LANZAR CONSULTA'}<ChevronRight size={17}/></button>
          <div className="editor-foot"><span><LockKeyhole size={12}/> MODO SEGURO</span><span>POSTGRESQL · NIVEL 01</span></div>
        </div>}</div>
      </section>}
      {screen === 'defeat' && <section className="defeat-cinematic" aria-label="Cinemática de derrota"><video className="defeat-video" src="/cinematics/goti-defeat.mp4" autoPlay muted={muted} playsInline onEnded={() => setDefeatVideoDone(true)} onError={() => setDefeatVideoDone(true)}/><div className="defeat-shade"/>{defeatVideoDone && <div className="game-over-panel"><span className="game-over-kicker">AZUR HA CAÍDO</span><h1>GAME OVER</h1><div className="game-over-actions"><button className="game-over-continue" onClick={() => startBattle(choice || scenes[2].next)}><RotateCcw size={17}/> CONTINUAR</button><button className="game-over-surrender" onClick={() => {setScreen('menu');setScene(0);setChoice(null);setDefeatVideoDone(false);}}>RENDIRSE</button></div></div>}</section>}
      {screen === 'final-choice' && <section className="final-choice-screen"><div className="ending-art"><div className="end-orb">✦</div><div className="ending-azur">A</div></div><div className="chapter-label"><Sparkles size={14}/> GOTI HA CAIDO · ULTIMA CONSULTA</div><h1>Elige una operacion.</h1><p>La batalla termino. Ejecuta una de estas consultas para decidir el destino del nucleo.</p><div className="final-choice-grid">{finaleOptions.map(option => <button key={option.id} className="final-query-card" onClick={() => { setEndingChoice(option.id); setScreen('ending'); }}><span className="final-query-label">OPERACION FINAL</span><strong>{option.name}</strong><code>{option.query}</code><small>{option.hint}</small><span className="final-query-run">EJECUTAR CONSULTA <ChevronRight size={15}/></span></button>)}</div></section>}
      {screen === 'ending' && endingStory && <section className="ending"><div className="ending-art"><div className="end-orb">✦</div><div className="ending-azur">A</div></div><div className="chapter-label"><Sparkles size={14}/> FINAL · {endingChoice.toUpperCase()}</div><h1>{endingStory.title}</h1><p>{endingStory.text}</p><div className="reward-row"><span><Sparkles size={17}/> +{xp} XP</span><span><Flame size={17}/> RACHA ×{streak}</span></div><button className="choice primary ending-btn" onClick={() => {setScreen('menu');setScene(0);setChoice(null);setPlayerHp(currentDifficulty.playerHp);setWitchHp(currentDifficulty.witchHp);setHearts(5);setXp(0);setStreak(1);setEndingChoice(null);}}>Jugar de nuevo <RotateCcw size={16}/></button></section>}
      </main><footer><span>AZUR <b>✦</b> CÓDIGO DE LAS SOMBRAS</span><span>EPISODIO 01 &nbsp;·&nbsp; LA SEÑAL <i>●</i> GUARDADO</span></footer>
    </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
