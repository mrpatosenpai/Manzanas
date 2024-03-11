const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const path = require('path');
const session = require('express-session');
//const session = require('express-session');
const app = express();
// configurar middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.use(session({
    secret: 'lol',
    resave: false,
    saveUninitialized:false
}));

app.use(express.static(path.join(__dirname)));
const db = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'manzanas'
};

//Crear usuario
app.post('/crear', async (req, res) => {
    const { tipo_documento, nombre, documento, id_M1 } = req.body;
    try {
        //Verificador de usuario
        const conect = await mysql.createConnection(db)
        const [indicador] = await conect.execute('SELECT * FROM usuario WHERE documento = ? AND tipo_documento = ?', [documento, tipo_documento])
        if (indicador.length > 0) {
            res.status(401).send(
                `<script>
            window.onload = function(){
                alert('El usuario ya existe');
                window.location.href = 'http://localhost:3000/vistas/registrarse.html';
            }
            </script>
            `
            )
        } else {
            await conect.execute('INSERT INTO usuario(tipo_documento,nombre,documento, id_M1) VALUES(?,?,?,?)',
                [tipo_documento, nombre, documento, id_M1]);
            res.status(201).send(
                `<script>
                window.onload = function(){
                    alert('Datos guardados');
                    window.location.href = 'http://localhost:3000/vistas/Inicio.html';
                }
                </script>
                `)
        }
        await conect.end()
    } catch (error) {
        console.error('error en el servidor', error);
        res.status(500).send(
            `<script>
                window.onload = function(){
                    alert(' Pailas mi perro');
                    window.location.href = 'http://localhost:3000/vistas/index.html';
                }
                </script>
                `
        )

    }
});

//Ruta para manejar un login

app.post('/Inicio', async (req, res) => {
    const { tipo_documento, documento } = req.body
    try {
        //verifique las credenciales
        const conect = await mysql.createConnection(db)
        const [indicador] = await conect.execute('SELECT * FROM usuario WHERE documento = ? AND tipo_documento = ?',
            [documento, tipo_documento])
        console.log(indicador)
        if (indicador.length > 0) {
            req.session.usuario = indicador[0].nombre;
            req.session.documento = documento;

            if(indicador[0].rol=="admin"){
                const usuario = {nombre: indicador[0].nombre};
                console.log(usuario);
                res.locals.usuario = usuario;
                res.sendFile(path.join(__dirname,'/vistas/admin.html'));
            }else{
                const usuario = {nombre: indicador[0].nombre};
                console.log(usuario);
                res.locals.usuario = usuario;
                res.sendFile(path.join(__dirname,'/vistas/usuario.html'));
            }
        } else {
            res.status(401).send('<script>window.onload = function(){alert("Usuario no encontrado"); window.location.href = "http://localhost:3000/vistas/Inicio.html";}</script>')
        }
        await conect.end()
    } catch (error) {
        console.error('Error en el servidor:', error)
        res.status(500).send(`
        <script>
                window.onload = function(){
                    alert('Error en el servidor');
                    window.location.href = 'http://localhost:3000/vistas/index.html';
                }
                </script>
        `)
    }
});
app.post('/imprimir-usuario', (req,res)=>{
    const usuario = req.session.usuario;
    if(usuario){
        res.json({nombre: usuario});
    }
    else{
        res.status(401).send("Usuario no encontrado")
    }
    res.sendFile(__dirname,'/vistas/usuario.html');
});

app.post('/imprimir-admin',(req,res)=>{
    const usuario = req.session.usuario;
    if(usuario){
        res.json({nombre: usuario});
    }
    else{
        res.status(401).send("Usuario no encontrado")
    }
    res.sendFile(__dirname,'/vistas/admin.html');
});
app.post('/obtener-servicios-usuario', async (req, res) => {
    const usuario= req.session.usuario;
    const documento = req.session.documento;
    console.log(usuario, documento);
    try {
        const conect = await mysql.createConnection(db)
        const [servicio] = await conect.execute('SELECT servicios.nombre_servicio, usuario.nombre FROM usuario INNER JOIN manzanas on manzanas.id_manzanas = usuario.id_M1 INNER JOIN servicios_manzanas on servicios_manzanas.id_M1 = manzanas.id_manzanas INNER JOIN servicios on servicios.id_servicio = servicios_manzanas.id_S1 WHERE usuario.documento = ?', [documento]);
        console.log(servicio);
        res.json({ servicio: servicio.map(row => row.nombre_servicio) })
        await conect.end()
    }
    catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).send('error en el servidor');
    }
});
app.post('/guardar-servicios-usuario', async (req, res) => {
    const usuario = req.session.usuario;
    const documento = req.session.documento;
    console.log(usuario,documento);
    const {servicios, fechahora } = req.body;
    const conect = await mysql.createConnection(db)
    const [consulID] = await conect.execute('SELECT usuario.codigo FROM usuario WHERE usuario.nombre=?', [usuario]);
    console.log(consulID);
    const [IDservici] = await conect.query('SELECT servicios.id_servicio FROM solicitudes INNER JOIN usuario ON usuario.codigo = solicitudes.id1 INNER JOIN manzanas ON manzanas.id_manzanas = usuario.id_M1 INNER JOIN servicios_manzanas ON servicios_manzanas.id_M1 = manzanas.id_manzanas INNER JOIN servicios ON servicios.id_servicio = servicios_manzanas.id_S1 WHERE servicios.nombre_servicio = ?', [servicios]);
    console.log('guardados', IDservici);
    try {
        for (const servicio of servicios) {
            await conect.execute('INSERT INTO solicitudes (`fecha`,`id1`,`codigoS`) VALUES (?,?,?)', [fechahora, consulID[0].codigo, IDservici[0].id_servicio]);
        }
        await conect.end()
    } catch (error) {
        console.error('Error en el servidor', error);
        res.status(500).send('Error en el servidor');
    }
});
app.post('/mostrar-servicios-usuario', async (req, res) => {
    const usuario= req.session.usuario;
    const documento = req.session.documento;
    console.log(usuario,documento);
    try {
        const conect = await mysql.createConnection(db)
        const [solicitude] = await conect.execute('SELECT solicitudes.fecha, servicios.nombre_servicio FROM solicitudes INNER JOIN usuario ON usuario.codigo = solicitudes.id1 INNER JOIN manzanas on manzanas.id_manzanas = usuario.id_M1 INNER JOIN servicios_manzanas on servicios_manzanas.id_M1 = manzanas.id_manzanas INNER JOIN servicios on servicios.id_servicio = servicios_manzanas.id_S1 WHERE usuario.nombre = ? AND solicitudes.codigoS = servicios.id_servicio;', [usuario]);
        console.log(solicitude);
        res.json({ solicitude: solicitude.map(raw => ([raw.fecha, raw.nombre_servicio])) });
        await conect.end()
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).send('error en el servidor');
    }
});
app.post('/eliminar-servicios-usuario', async (req, res) => {
    const usuario= req.session.usuario;
    const documento = req.session.documento;
    console.log(usuario,documento);
    const conect = await mysql.createConnection(db)
    const [idsoli] = await conect.execute('SELECT solicitudes.codigo_soli FROM solicitudes INNER JOIN usuario ON usuario.codigo = solicitudes.id1 INNER JOIN manzanas on manzanas.id_manzanas = usuario.id_M1 INNER JOIN servicios_manzanas on servicios_manzanas.id_M1 = manzanas.id_manzanas INNER JOIN servicios on servicios.id_servicio = servicios_manzanas.id_S1 WHERE usuario.nombre = ?;', [usuario]);
    console.log(idsoli);
    try {
            await conect.execute('DELETE FROM solicitudes WHERE solicitudes.codigo_soli = ?', [idsoli[0].codigo_soli]);
        await conect.end()
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).send('error en el servidor');
    }

});

app.post('/obtener-usuarios', async (req, res) => {
  
    try {
        const conect = await mysql.createConnection(db)
        const [usuari] = await conect.execute('SELECT * FROM usuario;');
        console.log(usuari);
        res.json({ usuari: usuari.map(rxw => ([rxw.codigo, rxw.nombre, rxw.tipo_documento, rxw.documento, rxw.id_M1])) });
        await conect.end()
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).send('error en el servidor');
    }


})

//crear manzana
app.post('/crearmanzana', async (req, res) => {
    const { nombre_manzana, direccion_manzana } = req.body;
    try {
        const conect = await mysql.createConnection(db)
        await conect.execute('INSERT INTO manzanas(nombre_manzana,direccion_manzana) VALUES(?,?)',
            [nombre_manzana, direccion_manzana]);
        res.status(201).send(
            `<script>
                window.onload = function(){
                    alert('Datos de Manzana guardados');
                    window.location.href ='http://localhost:3000/vistas/admin.html';
                }
                </script>
                `)
        await conect.end()
    } catch (error) {
        console.error('error en el servidor', error);
        res.status(500).send(
            `<script>
                window.onload = function(){
                    alert(' Pailas mi perro');
                }
                </script>
                `
        )

    }
});

//crear servicio
app.post('/crearservi', async (req, res) => {
    const { nombre_servicio, categoria_servicio } = req.body;
    try {
        const conect = await mysql.createConnection(db)
        await conect.execute('INSERT INTO servicios(nombre_servicio, categoria_servicio) VALUES(?,?)',
            [nombre_servicio, categoria_servicio]);
        res.status(201).send(
            `<script>
                window.onload = function(){
                    alert('Datos de servicio guardados');
                    window.location.href = 'http://localhost:3000/vistas/admin.html';
                    
                }
                </script>
                `)

        await conect.end()
    } catch (error) {
        console.error('error en el servidor', error);
        res.status(500).send(
            `<script>
                window.onload = function(){
                    alert(' Pailas mi perro');
                }
                </script>
                `
        )

    }
});
//cerrar sesion de usuarios
app.post('/cerrar-sesion',(req, res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.error('Error al cerrar la sesion', err);
            res.status(500).send("Error al cerrar la sesion")
        }else{
            res.status(200).send("Sesion cerrada")
        }
    })
});
//mostrar manzanas en admin
app.post('/mostrar_manzanas', async (req, res) => {
    try {
        const conect = await mysql.createConnection(db)
        const [manzas] = await conect.execute('SELECT * FROM manzanas;');
        console.log(manzas);
        res.json({ manzas: manzas.map(rxw => ([rxw.id_manzanas, rxw.nombre_manzanas, rxw.direccion_manzana])) });
        await conect.end()
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).send('error en el servidor');
    }


});

app.post('/mostrar_servicios', async (req, res) => {
    try {
        const conect = await mysql.createConnection(db)
        const [servis] = await conect.execute('SELECT * FROM manzanas;');
        console.log(servis);
        res.json({ servis: servis.map(rxw => ([rxw.id_servicio, rxw.nombre_servicio, rxw.categoria_servicio, rxw.descripcion_servicio ])) });
        await conect.end()
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).send('error en el servidor');
    }


});

/* app.post('/eliminar-servicios-admin', async (req, res) => {
    const usuario= req.session.usuario;
    const documento = req.session.documento;
    console.log(usuario,documento);
    const conect = await mysql.createConnection(db)
    const [idserv] = await conect.execute('SELECT servicios.id_servicio, servicios_manzanas.id_S1 , solicitudes.codigoS FROM solicitudes INNER JOIN usuario ON usuario.codigo = solicitudes.id1 INNER JOIN manzanas ON manzanas.id_manzanas = usuario.id_M1 INNER JOIN servicios_manzanas ON servicios_manzanas.id_M1 = manzanas.id_manzanas INNER JOIN servicios ON servicios.id_servicio = servicios_manzanas.id_S1 WHERE servicios.nombre_servicio = ?', [usuario]);
    console.log(idserv);
    try {
            await conect.execute('DELETE FROM servicios WHERE servicios.id_servicio = ?', [idserv[0].id_servicio]);
        await conect.end()
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).send('error en el servidor');
    }

});
 */
app.listen(3000, () => {
    console.log('Servidor escuchando')
})
