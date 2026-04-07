const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const { rows } = await db.query(
            'SELECT * FROM users WHERE username = $1 AND password = $2',
            [username, password]
        );
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Login yoki parol noto\'g\'ri!' });
        }
        const user = rows[0];
        res.json({ success: true, role: user.role, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API route for testing backend
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running!' });
});

// Patients CRUD
app.get('/api/patients', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM patients ORDER BY last_visit DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/patients', async (req, res) => {
    const { id, first_name, last_name, dob, gender, phone, address, complaint, diag, doctor, note, status, last_visit } = req.body;
    try {
        const query = `
      INSERT INTO patients (id, first_name, last_name, dob, gender, phone, address, complaint, diag, doctor, note, status, last_visit)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
    `;
        const values = [id, first_name, last_name, dob, gender, phone, address, complaint, diag, doctor, note, status, last_visit];
        const { rows } = await db.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/patients/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM patients WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/patients/:id', async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE patients SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Appointments CRUD
app.get('/api/appointments', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM appointments ORDER BY appointment_date, appointment_time');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/appointments', async (req, res) => {
    const { patient_name, appointment_date, appointment_time, doctor, type, status, note } = req.body;
    try {
        const query = `
      INSERT INTO appointments (patient_name, appointment_date, appointment_time, doctor, type, status, note)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
        const values = [patient_name, appointment_date, appointment_time, doctor, type, status, note];
        const { rows } = await db.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/appointments/:id', async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE appointments SET status = $1 WHERE id = $2', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/appointments/:id', async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/appointments/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM appointments WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Doctors CRUD
app.get('/api/doctors', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM doctors ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/doctors', async (req, res) => {
    const { name, spec, exp, patients, rating, load, avatar } = req.body;
    try {
        const query = `
      INSERT INTO doctors (name, spec, exp, patients, rating, load, avatar)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
        const values = [name, spec, exp, patients || 0, rating || 5.0, load || 0, avatar || null];
        const { rows } = await db.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/doctors/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM doctors WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Inventory CRUD
app.get('/api/inventory', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM inventory ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventory', async (req, res) => {
    const { name, category, qty, min_qty, unit, exp_date, crit } = req.body;
    try {
        const query = `
      INSERT INTO inventory (name, category, qty, min_qty, unit, exp_date, crit)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
        const values = [name, category, qty || 0, min_qty || 50, unit || 'dona', exp_date || '', crit || false];
        const { rows } = await db.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Finance CRUD
app.get('/api/finance', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM finance ORDER BY date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/finance', async (req, res) => {
    const { id, patient_name, service, amount, date, type, status } = req.body;
    try {
        const query = `
      INSERT INTO finance (id, patient_name, service, amount, date, type, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
        const values = [id, patient_name, service, amount, date, type, status];
        const { rows } = await db.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Stats API
app.get('/api/stats', async (req, res) => {
    try {
        const patientsRes = await db.query('SELECT COUNT(*) FROM patients');
        const appointmentsRes = await db.query('SELECT COUNT(*) FROM appointments WHERE appointment_date = CURRENT_DATE');
        // Using dummy date strings here since we insert dummy datetimes... using actual db logic
        const totalPatients = parseInt(patientsRes.rows[0].count, 10);
        const todayAppointments = parseInt(appointmentsRes.rows[0].count, 10);

        // Monthly income: sum of paid amounts this month
        const incomeRes = await db.query(`
          SELECT COALESCE(SUM(amount), 0) as total FROM finance 
          WHERE status = 'To''langan' AND date >= DATE_TRUNC('month', CURRENT_DATE)
        `);
        const monthlyIncome = incomeRes.rows[0].total;

        // Inventory alerts: count items below min_qty
        const lowStockRes = await db.query('SELECT COUNT(*) FROM inventory WHERE qty < min_qty');
        const lowStock = parseInt(lowStockRes.rows[0].count, 10);

        res.json({
            totalPatients,
            todayAppointments,
            monthlyIncome,
            lowStock
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Notifications API
app.get('/api/notifications', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/notifications', async (req, res) => {
    const { message, type } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO notifications (message, type) VALUES ($1, $2) RETURNING *',
            [message, type || 'info']
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/notifications/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM notifications WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dashboard alerts endpoint
app.get('/api/alerts', async (req, res) => {
    try {
        const lowStock = await db.query('SELECT name, qty FROM inventory WHERE qty <= 10');
        const alerts = lowStock.rows.map(item => ({
            type: 'red',
            message: `💊 ${item.name} zaxirasi tugayapti (${item.qty} dona qoldi)`
        }));
        // We can push other dynamic alerts based on logic
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export the express app so Vercel can serve it via Serverless function
module.exports = app;
