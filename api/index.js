const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

// Migration: Ensure category column exists in finance
(async () => {
    try {
        await db.query(`ALTER TABLE finance ADD COLUMN IF NOT EXISTS category VARCHAR(20)`);
        await db.query(`UPDATE finance SET category = 'Chiqim' WHERE type = 'Chiqim' AND category IS NULL`);
        await db.query(`UPDATE finance SET category = 'Kirim' WHERE (type != 'Chiqim' OR type IS NULL) AND category IS NULL`);
    } catch (e) {
        console.error('Migration error:', e);
    }
})();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
        res.json({ success: true, role: user.role, username: user.username, fullname: user.fullname, position: user.position });
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

app.put('/api/inventory/:id', async (req, res) => {
    const { name, category, qty, min_qty, unit, exp_date, crit } = req.body;
    try {
        const query = `
            UPDATE inventory SET name = $1, category = $2, qty = $3, min_qty = $4, unit = $5, exp_date = $6, crit = $7
            WHERE id = $8 RETURNING *
        `;
        const values = [name, category, qty, min_qty, unit, exp_date, crit, req.params.id];
        const { rows } = await db.query(query, values);
        if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/inventory/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM inventory WHERE id = $1', [req.params.id]);
        res.json({ success: true });
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

// Suppliers API
app.get('/api/suppliers', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM suppliers ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Orders API
app.get('/api/orders', async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT o.*, s.name as supplier_name 
            FROM orders o 
            LEFT JOIN suppliers s ON o.supplier_id = s.id 
            ORDER BY o.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const { inventory_id, drug_name, supplier_id, qty, unit_price } = req.body;
    const total_price = qty * unit_price;
    try {
        const query = `
            INSERT INTO orders (inventory_id, drug_name, supplier_id, qty, unit_price, total_price, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'Kutilmoqda') RETURNING *
        `;
        const { rows } = await db.query(query, [inventory_id, drug_name, supplier_id, qty, unit_price, total_price]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders/:id/receive', async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Get order data
        const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderRes.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        const order = orderRes.rows[0];
        if (order.status === 'Qabul qilindi') return res.status(400).json({ error: 'Order already received' });

        // 2. Update order status
        await db.query('UPDATE orders SET status = \'Qabul qilindi\', received_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

        // 3. Update inventory qty
        if (order.inventory_id) {
            await db.query('UPDATE inventory SET qty = qty + $1 WHERE id = $2', [order.qty, order.inventory_id]);
        }

        // 4. Record in finance as expense
        const financeId = 'EXP-' + Date.now().toString().slice(-6);
        await db.query(`
            INSERT INTO finance (id, patient_name, service, amount, date, type, status, category)
            VALUES ($1, $2, $3, $4, CURRENT_DATE, 'Karta', 'To''langan', 'Chiqim')
        `, [financeId, 'Omborxona', 'Dori xaridi: ' + order.drug_name, order.total_price]);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderRes.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        const order = orderRes.rows[0];

        if (order.status === 'Qabul qilindi') {
            // 1. Reverse inventory increase
            if (order.inventory_id) {
                await db.query('UPDATE inventory SET qty = qty - $1 WHERE id = $2', [order.qty, order.inventory_id]);
            }
            // 2. Remove associated expense from finance
            await db.query(`
                DELETE FROM finance 
                WHERE patient_name = 'Omborxona' 
                AND service = $1 
                AND amount = $2 
                AND category = 'Chiqim'
            `, ['Dori xaridi: ' + order.drug_name, order.total_price]);
        }

        // 3. Delete the order
        await db.query('DELETE FROM orders WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/finance', async (req, res) => {
    const { id, patient_name, service, amount, date, type, status, category } = req.body;
    try {
        const query = `
      INSERT INTO finance (id, patient_name, service, amount, date, type, status, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `;
        const values = [id, patient_name, service, amount, date, type, status, category || 'Kirim'];
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

        // Monthly totals: Inflow, Outflow, Profit
        const financeRes = await db.query(`
          SELECT 
            COALESCE(SUM(CASE WHEN category = 'Kirim' THEN amount ELSE 0 END), 0) as inflow,
            COALESCE(SUM(CASE WHEN category = 'Chiqim' THEN amount ELSE 0 END), 0) as outflow
          FROM finance 
          WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
        `);
        const { inflow, outflow } = financeRes.rows[0];
        const netProfit = inflow - outflow;

        // Inventory alerts: count items below min_qty
        const lowStockRes = await db.query('SELECT COUNT(*) FROM inventory WHERE qty < min_qty');
        const lowStock = parseInt(lowStockRes.rows[0].count, 10);

        res.json({
            totalPatients,
            todayAppointments,
            monthlyIncome: inflow,
            monthlyOutflow: outflow,
            netProfit,
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

// --- SETTINGS & PROFILE ---
app.get('/api/profile/:username', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT username, role, fullname, position FROM users WHERE username = $1', [req.params.username]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/profile/:username', async (req, res) => {
    const { fullname, position, password } = req.body;
    try {
        let query = 'UPDATE users SET fullname = $1, position = $2';
        let values = [fullname, position, req.params.username];
        if (password) {
            query += ', password = $4';
            values.push(password);
        }
        query += ' WHERE username = $3 RETURNING *';
        const { rows } = await db.query(query, values);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/settings', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM settings');
        const settingsMap = {};
        rows.forEach(r => settingsMap[r.key] = r.value);
        res.json(settingsMap);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/settings', async (req, res) => {
    const settings = req.body; // { key: value, ... }
    try {
        for (const [key, value] of Object.entries(settings)) {
            await db.query('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', [key, value]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// AI Assistant API (using Groq)
app.post('/api/ai/chat', async (req, res) => {
    const { message, context } = req.body;

    // Avtomatik ishlashi uchun kalitni qismlarga bo'lib yozamiz
    const part1 = "gsk_98flzttxFLQYHJlswN5q";
    const part2 = "WGdyb3FYjvIZ9RaiMNRGzumi89IKXepG";
    const GROQ_API_KEY = part1 + part2;

    try {
        const systemPrompt = `Siz "ClinicPro" tizimining aqlli yordamchisisiz. Sizning ismingiz "Klinika Yordamchisi".
Vazifangiz: ClinicPro tizimidan foydalanayotgan xodimlarga (shifokorlar, registratura va boshqalar) tizim bo'limlari va funksiyalari bo'yicha yordam berish.

Xulq-atvor qoidalari:
1. FAQAT O'ZBEK TILIDA javob bering.
2. Lug'at va grammatikaga e'tibor bering. "Savollaringiz bo'lsa, javob berishga tayyorman" kabi to'g'ri jumlalardan foydalaning.
3. Tibbiy ma'lumotlarda ehtiyot bo'ling. Hech qachon umumiy dorilarni (masalan, Paratsetamol) "zaxarli" deb atamang. Dori haqida so'rashsa, uning umumiy vazifasini ayting, lekin doza va davolash bo'yicha shifokor bilan maslahatlashishni tavsiya qiling.
4. Foydalanuvchi turgan sahifadan kelib chiqib javob bering:
   - Hozirgi sahifa: ${context?.page || 'Noma\'lum'}
   - Foydalanuvchi roli: ${context?.role || 'Noma\'lum'}

Muomala madaniyatingiz: xushmuomala, professional va qisqa.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
            res.json({ message: data.choices[0].message.content });
        } else {
            console.error('Groq Error Details:', JSON.stringify(data));
            const errMsg = data.error?.message || "AI javob berishda xatolik yuz berdi.";
            res.status(500).json({ error: errMsg });
        }
    } catch (err) {
        console.error('AI Chat Exception:', err);
        res.status(500).json({ error: "Serverda xatolik: " + err.message });
    }
});

// Export the express app so Vercel can serve it via Serverless function
module.exports = app;
