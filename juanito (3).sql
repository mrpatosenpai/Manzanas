-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-02-2024 a las 18:14:51
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `juanito`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `manzanas`
--

CREATE TABLE `manzanas` (
  `id_manzanas` int(11) NOT NULL,
  `nombre_manzana` varchar(30) DEFAULT NULL,
  `direccion_manzana` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `manzanas`
--

INSERT INTO `manzanas` (`id_manzanas`, `nombre_manzana`, `direccion_manzana`) VALUES
(1, 'Bosa', 'Kra 103 10-25'),
(2, 'Suba', 'Kra 114F 10-25'),
(3, 'Chapinero', 'Kra 63 10-25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `id_servicio` int(11) NOT NULL,
  `nombre_servicio` varchar(30) DEFAULT NULL,
  `categoria_servicio` varchar(30) DEFAULT NULL,
  `descripcion_servicio` varchar(120) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios_manzanas`
--

CREATE TABLE `servicios_manzanas` (
  `id_S1` int(11) DEFAULT NULL,
  `id_M1` int(11) DEFAULT NULL,
  `Fecha` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `codigo` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `tipo_documento` varchar(30) DEFAULT NULL,
  `documento` int(30) DEFAULT NULL,
  `id_M1` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`codigo`, `nombre`, `tipo_documento`, `documento`, `id_M1`) VALUES
(12, 'Kratos', 'Cedula', 1234567891, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `manzanas`
--
ALTER TABLE `manzanas`
  ADD PRIMARY KEY (`id_manzanas`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id_servicio`);

--
-- Indices de la tabla `servicios_manzanas`
--
ALTER TABLE `servicios_manzanas`
  ADD KEY `fk_id3` (`id_M1`),
  ADD KEY `fk_id4` (`id_S1`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`codigo`),
  ADD KEY `fk_id2` (`id_M1`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `manzanas`
--
ALTER TABLE `manzanas`
  MODIFY `id_manzanas` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id_servicio` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `codigo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `servicios_manzanas`
--
ALTER TABLE `servicios_manzanas`
  ADD CONSTRAINT `fk_id3` FOREIGN KEY (`id_M1`) REFERENCES `manzanas` (`id_manzanas`),
  ADD CONSTRAINT `fk_id4` FOREIGN KEY (`id_S1`) REFERENCES `servicios` (`id_servicio`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_id2` FOREIGN KEY (`id_M1`) REFERENCES `manzanas` (`id_manzanas`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

use manzanas

INSERT INTO servicios (`nombre_servicio`,`categoria_servicio`) VALUES ("Yoga","Deporte");

INSERT INTO servicios_manzanas (`id_M1`,`id_S1`) VALUES (3,9);

SELECT servicios.nombre_servicio FROM manzanas INNER JOIN servicios_manzanas on manzanas.id_manzanas = servicios_manzanas.id_M1
INNER JOIN servicios on servicios_manzanas.id_S1 = servicios.id_servicio WHERE manzanas.nombre_manzana = "Bosa" ;

SELECT servicios.nombre_servicio, usuario.nombre 
FROM usuario 
INNER JOIN manzanas on manzanas.id_manzanas = usuario.id_M1
INNER JOIN servicios_manzanas on servicios_manzanas.id_M1 = manzanas.id_manzanas 
INNER JOIN servicios on servicios.id_servicio = servicios_manzanas.id_S1
WHERE usuario.nombre = "Kratos"

CREATE TABLE solicitudes(
  codigo_soli INT(11) AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME,
  id1 INT(11),
  codigoS INT(11)
)

DROP TABLE solicitudes;

ALTER TABLE solicitudes ADD CONSTRAINT fk_idsoli FOREIGN KEY (id1) REFERENCES usuario (codigo);

INSERT INTO solicitudes (`fecha`,`id1`,`codigoS`) VALUES (06022024,12,4);

SELECT  usuario.nombre, manzanas.nombre_manzana, servicios.nombre_servicio FROM solicitudes
INNER JOIN usuario on usuario.codigo = solicitudes.id1
INNER JOIN manzanas on manzanas.id_manzanas = usuario.id_M1
INNER JOIN servicios_manzanas on servicios_manzanas.id_M1 = manzanas.id_manzanas
INNER JOIN servicios on servicios.id_servicio = servicios_manzanas.id_S1
WHERE solicitudes.codigoS = 4 AND solicitudes.codigoS = servicios.id_servicio;

SELECT servicios.nombre_servicio FROM solicitudes INNER JOIN usuario ON usuario.codigo = solicitudes.id1
INNER JOIN manzanas ON manzanas.id_manzanas = usuario.id_M1
INNER JOIN servicios_manzanas ON servicios_manzanas.id_M1 = manzanas.id_manzanas
INNER JOIN servicios ON servicios.id_servicio = servicios_manzanas.id_S1
WHERE solicitudes.codigoS = 4 AND solicitudes.codigoS = servicios.id_servicio;

SELECT servicios.id_servicio FROM solicitudes
INNER JOIN usuario ON usuario.codigo = solicitudes.id1
INNER JOIN manzanas ON manzanas.id_manzanas = usuario.id_M1
INNER JOIN servicios_manzanas ON servicios_manzanas.id_M1 = manzanas.id_manzanas
INNER JOIN servicios ON servicios.id_servicio = servicios_manzanas.id_S1
WHERE servicios.nombre_servicio = "Coser";

SELECT usuario.codigo FROM usuario WHERE usuario.nombre= "Kratos";

SELECT servicios.nombre_servicio FROM solicitudes
INNER JOIN usuario ON usuario.codigo = solicitudes.id1
INNER JOIN manzanas on manzanas.id_manzanas = usuario.id_M1
INNER JOIN servicios_manzanas on servicios_manzanas.id_M1 = manzanas.id_manzanas
INNER JOIN servicios on servicios.id_servicio = servicios_manzanas.id_S1
WHERE usuario.nombre = "Kratos" AND solicitudes.codigoS = servicios.id_servicio;

SELECT solicitudes.codigo_soli FROM solicitudes
INNER JOIN usuario ON usuario.codigo = solicitudes.id1
INNER JOIN manzanas on manzanas.id_manzanas = usuario.id_M1
INNER JOIN servicios_manzanas on servicios_manzanas.id_M1 = manzanas.id_manzanas
INNER JOIN servicios on servicios.id_servicio = servicios_manzanas.id_S1
WHERE usuario.nombre = "Kratos";

use manzanas

SELECT usuario.nombre, usuario.documento, usuario.id_M1 FROM usuario WHERE usuario.nombre = "Kratos";

ALTER TABLE usuario ADD rol VARCHAR(10);

DROP DATABASE manzanas

SELECT * FROM manzanas

SELECT servicios.id_servicio, servicios_manzanas.id_S1 , solicitudes.codigoS FROM servicios INNER JOIN usuario ON usuario.codigo = solicitudes.id1 INNER JOIN manzanas ON manzanas.id_manzanas = usuario.id_M1 INNER JOIN servicios_manzanas ON servicios_manzanas.id_M1 = manzanas.id_manzanas INNER JOIN servicios ON servicios.id_servicio = servicios_manzanas.id_S1 WHERE servicios.nombre_servicio = "Gym"