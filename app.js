

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ============================
//  USUARIOS (login/registro)
// ============================
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE username = ? AND password = ?', [username, password]);
        if (rows.length > 0) {
            res.json({ success: true, user: username });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        await pool.query('INSERT INTO usuarios (username, password) VALUES (?, ?)', [username, password]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================
//  PRODUCTOS (con instrucciones)
// ============================
app.get('/api/productos', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, u.nombre as unidad_nombre, u.abreviatura as unidad_abreviatura
            FROM productos p
            LEFT JOIN unidades_medida u ON p.unidad_medida_id = u.id
            ORDER BY p.id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/productos', async (req, res) => {
    const { nombre, precio_unitario, precio_docena, costo, pesaje, cantidad_producida, instrucciones, unidad_medida_id } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO productos (nombre, precio_unitario, precio_docena, costo, pesaje, cantidad_producida, instrucciones, unidad_medida_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, precio_unitario, precio_docena || null, costo || null, pesaje || null, cantidad_producida || 1, instrucciones || null, unidad_medida_id || 5]
        );
        const [newProduct] = await pool.query(`
            SELECT p.*, u.nombre as unidad_nombre, u.abreviatura as unidad_abreviatura
            FROM productos p
            LEFT JOIN unidades_medida u ON p.unidad_medida_id = u.id
            WHERE p.id = ?
        `, [result.insertId]);
        res.json(newProduct[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio_unitario, precio_docena, costo, pesaje, cantidad_producida, instrucciones, unidad_medida_id } = req.body;
    try {
        await pool.query(
            'UPDATE productos SET nombre=?, precio_unitario=?, precio_docena=?, costo=?, pesaje=?, cantidad_producida=?, instrucciones=?, unidad_medida_id=? WHERE id=?',
            [nombre, precio_unitario, precio_docena || null, costo || null, pesaje || null, cantidad_producida || 1, instrucciones || null, unidad_medida_id || 5, id]
        );
        const [updated] = await pool.query(`
            SELECT p.*, u.nombre as unidad_nombre, u.abreviatura as unidad_abreviatura
            FROM productos p
            LEFT JOIN unidades_medida u ON p.unidad_medida_id = u.id
            WHERE p.id = ?
        `, [id]);
        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.delete('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM productos WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================
//  UNIDADES DE MEDIDA
// ============================
app.get('/api/unidades', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM unidades_medida ORDER BY id');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================
//  INSUMOS (CRUD)
// ============================
/* app.get('/api/insumos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM insumos ORDER BY id');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
 */
app.get('/api/insumos', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT i.*, u.nombre as unidad_nombre, u.abreviatura as unidad_abreviatura
            FROM insumos i
            LEFT JOIN unidades_medida u ON i.unidad_medida_id = u.id
            ORDER BY i.nombre asc 
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* app.post('/api/insumos', async (req, res) => {
    const { nombre, precio_compra, peso_compra } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO insumos (nombre, precio_compra, peso_compra) VALUES (?, ?, ?)',
            [nombre, precio_compra, peso_compra]
        );
        const [newInsumo] = await pool.query('SELECT * FROM insumos WHERE id = ?', [result.insertId]);
        res.json(newInsumo[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
 */

app.post('/api/insumos', async (req, res) => {
    const { nombre, precio_compra, peso_compra, unidad_medida_id } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO insumos (nombre, precio_compra, peso_compra, unidad_medida_id) VALUES (?, ?, ?, ?)',
            [nombre, precio_compra, peso_compra, unidad_medida_id || 5]
        );
        const [newInsumo] = await pool.query(`
            SELECT i.*, u.nombre as unidad_nombre, u.abreviatura as unidad_abreviatura
            FROM insumos i
            LEFT JOIN unidades_medida u ON i.unidad_medida_id = u.id
            WHERE i.id = ?
        `, [result.insertId]);
        res.json(newInsumo[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* app.put('/api/insumos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio_compra, peso_compra } = req.body;
    try {
        await pool.query(
            'UPDATE insumos SET nombre=?, precio_compra=?, peso_compra=? WHERE id=?',
            [nombre, precio_compra, peso_compra, id]
        );
        const [updated] = await pool.query('SELECT * FROM insumos WHERE id = ?', [id]);
        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}); */

app.put('/api/insumos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio_compra, peso_compra, unidad_medida_id } = req.body;
    try {
        await pool.query(
            'UPDATE insumos SET nombre=?, precio_compra=?, peso_compra=?, unidad_medida_id=? WHERE id=?',
            [nombre, precio_compra, peso_compra, unidad_medida_id || 5, id]
        );
        const [updated] = await pool.query(`
            SELECT i.*, u.nombre as unidad_nombre, u.abreviatura as unidad_abreviatura
            FROM insumos i
            LEFT JOIN unidades_medida u ON i.unidad_medida_id = u.id
            WHERE i.id = ?
        `, [id]);
        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/insumos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM insumos WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================
//  RECETAS (por producto)
// ============================
// Obtener receta de un producto (incluye insumos)
app.get('/api/recetas/:producto_id', async (req, res) => {
    const { producto_id } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT r.*, i.nombre as insumo_nombre, i.precio_por_gramo 
             FROM recetas r 
             JOIN insumos i ON r.insumo_id = i.id 
             WHERE r.producto_id = ?`,
            [producto_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar un insumo a la receta
app.post('/api/recetas', async (req, res) => {
    const { producto_id, insumo_id, cantidad } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO recetas (producto_id, insumo_id, cantidad) VALUES (?, ?, ?)',
            [producto_id, insumo_id, cantidad]
        );
        const [newRec] = await pool.query('SELECT * FROM recetas WHERE id = ?', [result.insertId]);
        res.json(newRec[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar cantidad de un insumo en la receta
app.put('/api/recetas/:id', async (req, res) => {
    const { id } = req.params;
    const { cantidad } = req.body;
    try {
        await pool.query('UPDATE recetas SET cantidad = ? WHERE id = ?', [cantidad, id]);
        const [updated] = await pool.query('SELECT * FROM recetas WHERE id = ?', [id]);
        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un insumo de la receta
app.delete('/api/recetas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM recetas WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================
//  CLIENTES (igual)
// ============================
app.get('/api/clientes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clientes ORDER BY id');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/clientes', async (req, res) => {
    const { nombre, email, telefono, direccion } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO clientes (nombre, email, telefono, direccion) VALUES (?, ?, ?, ?)',
            [nombre, email || null, telefono || null, direccion || null]
        );
        const [newCli] = await pool.query('SELECT * FROM clientes WHERE id = ?', [result.insertId]);
        res.json(newCli[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono, direccion } = req.body;
    try {
        await pool.query(
            'UPDATE clientes SET nombre=?, email=?, telefono=?, direccion=? WHERE id=?',
            [nombre, email, telefono, direccion, id]
        );
        const [updated] = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);
        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================
//  VENTAS (sin cambios relevantes)
// ============================
app.post('/api/ventas', async (req, res) => {
    const { cliente_id, items } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        let total = 0;
        for (const item of items) {
            total += item.cantidad * item.precio_unitario;
        }
        const [ventaResult] = await connection.query(
            'INSERT INTO ventas (cliente_id, total) VALUES (?, ?)',
            [cliente_id || null, total]
        );
        const ventaId = ventaResult.insertId;
        for (const item of items) {
            await connection.query(
                'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, tipo_precio) VALUES (?, ?, ?, ?, ?)',
                [ventaId, item.producto_id, item.cantidad, item.precio_unitario, item.tipo_precio || 'unitario']
            );
        }
        await connection.commit();
        res.json({ success: true, venta_id: ventaId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

app.get('/api/ventas', async (req, res) => {
    const { producto_id, cliente_id, fecha_desde, fecha_hasta } = req.query;
    let query = `
        SELECT v.id, v.fecha, v.total, c.nombre as cliente_nombre,
               JSON_ARRAYAGG(
                   JSON_OBJECT('producto_id', d.producto_id, 'cantidad', d.cantidad, 'precio_unitario', d.precio_unitario, 'tipo_precio', d.tipo_precio)
               ) as detalles
        FROM ventas v
        LEFT JOIN clientes c ON v.cliente_id = c.id
        LEFT JOIN detalle_ventas d ON v.id = d.venta_id
    `;
    const conditions = [];
    const params = [];
    if (cliente_id) { conditions.push('v.cliente_id = ?'); params.push(cliente_id); }
    if (fecha_desde) { conditions.push('v.fecha >= ?'); params.push(fecha_desde); }
    if (fecha_hasta) { conditions.push('v.fecha <= ?'); params.push(fecha_hasta); }
    if (producto_id) { conditions.push('d.producto_id = ?'); params.push(producto_id); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' GROUP BY v.id, c.nombre ORDER BY v.fecha DESC';

    try {
        const [rows] = await pool.query(query, params);
        rows.forEach(row => {
            if (row.detalles) row.detalles = JSON.parse(row.detalles);
        });
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/ventas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [venta] = await pool.query(
            `SELECT v.*, c.nombre as cliente_nombre 
             FROM ventas v 
             LEFT JOIN clientes c ON v.cliente_id = c.id 
             WHERE v.id = ?`,
            [id]
        );
        if (venta.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
        const [detalles] = await pool.query(
            'SELECT d.*, p.nombre as producto_nombre FROM detalle_ventas d JOIN productos p ON d.producto_id = p.id WHERE d.venta_id = ?',
            [id]
        );
        res.json({ ...venta[0], detalles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// ============================
//  INICIAR SERVIDOR
// ============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});