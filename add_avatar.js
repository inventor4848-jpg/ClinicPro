const db = require('./api/db.js');

async function run() {
    try {
        await db.query('ALTER TABLE doctors ADD COLUMN IF NOT EXISTS avatar TEXT;');
        console.log('Successfully added avatar column to doctors table');
    } catch (err) {
        console.error('Error adding avatar column:', err);
    } finally {
        process.exit(0);
    }
}

run();
