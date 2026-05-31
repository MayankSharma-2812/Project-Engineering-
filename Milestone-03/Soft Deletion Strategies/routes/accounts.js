const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all accounts in the system (active only, and owner user is active)
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.* FROM accounts a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.deleted_at IS NULL AND u.deleted_at IS NULL`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database execution error' });
  }
});

// GET user accounts by user_id (active only, and owner user is active)
router.get('/user/:userId', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.* FROM accounts a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.user_id = $1 AND a.deleted_at IS NULL AND u.deleted_at IS NULL`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database retrieval error' });
  }
});

// CREATE a new account for a user
router.post('/', async (req, res) => {
  const { user_id, account_type, balance } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO accounts (user_id, account_type, balance) VALUES ($1, $2, $3) RETURNING *',
      [user_id, account_type, balance]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Account creation failed' });
  }
});

// DELETE single account (soft delete) from the system
router.delete('/:id', async (req, res) => {
  try {
    // Soft DELETE from accounts table
    const { rowCount } = await db.query(
      'UPDATE accounts SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Cascade soft-delete transactions for this account
    await db.query(
      'UPDATE transactions SET deleted_at = NOW() WHERE account_id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );
    
    res.json({ message: 'Account soft-deleted from LedgerApp' });
  } catch (err) {
    res.status(500).json({ error: 'Delete operation failed' });
  }
});

module.exports = router;
