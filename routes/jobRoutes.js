/**
 * Express router for Job-related endpoints.
 * Handles CRUD operations for jobs.
 * @module routes/Job
 */

const express = require('express');
const router = express.Router();
const Job = require('../models/Job'); // Import Job model

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new job
router.post('/', async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update a job
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Job.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Job not found' });
    const job = await Job.findByPk(req.params.id);
    res.json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a job
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Job.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Job not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export the router for use in the main app
module.exports = router;
