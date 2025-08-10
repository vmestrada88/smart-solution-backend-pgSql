const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const Invoice = require('../models/Invoice');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Crear nueva propuesta
router.post('/', auth, async (req, res) => {
  try {
    const proposalData = {
      ...req.body,
      createdBy: req.user._id
    };

    const proposal = new Proposal(proposalData);
    await proposal.save();
    
    await proposal.populate([
      { path: 'client', select: 'name email phone address' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Propuesta creada exitosamente',
      data: proposal
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear la propuesta',
      error: error.message
    });
  }
});

// Obtener todas las propuestas (solo admin)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { 
      status, 
      client, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10,
      search 
    } = req.query;
    
    let filter = {};
    
    if (status) filter.status = status;
    if (client) filter.client = client;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { proposalNumber: { $regex: search, $options: 'i' } },
        { 'clientInfo.name': { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const proposals = await Proposal.find(filter)
      .populate('client', 'name email phone address')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Proposal.countDocuments(filter);

    res.json({
      success: true,
      data: {
        proposals,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las propuestas',
      error: error.message
    });
  }
});

// Convertir propuesta a factura
router.post('/:id/convert-to-invoice', auth, adminAuth, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Propuesta no encontrada'
      });
    }

    if (proposal.status === 'cancelado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede convertir una propuesta cancelada'
      });
    }

    const invoiceData = {
      client: proposal.client,
      clientInfo: proposal.clientInfo,
      items: proposal.items,
      subtotal: proposal.subtotal,
      tax: proposal.tax,
      total: proposal.total,
      notes: proposal.notes,
      createdBy: req.user._id
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();
    
    await invoice.populate([
      { path: 'client', select: 'name email phone address' },
      { path: 'createdBy', select: 'name email' }
    ]);

    // Actualizar estado de la propuesta
    proposal.status = 'archivado';
    await proposal.save();
    
    res.status(201).json({
      success: true,
      message: 'Propuesta convertida a factura exitosamente',
      data: invoice
    });
  } catch (error) {
    console.error('Error converting proposal to invoice:', error);
    res.status(400).json({
      success: false,
      message: 'Error al convertir la propuesta',
      error: error.message
    });
  }
});

// Obtener propuesta por ID
router.get('/:id', auth, adminAuth, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('client', 'name email phone address')
      .populate('createdBy', 'name email');
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Propuesta no encontrada'
      });
    }

    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la propuesta',
      error: error.message
    });
  }
});

// Actualizar propuesta
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('client createdBy');
    
    if (!proposal) {
      return res.status(404).json({ message: 'Propuesta no encontrada' });
    }
    
    res.json(proposal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Actualizar estado de propuesta
router.patch('/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['creado', 'enviado', 'archivado', 'cancelado'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }

    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('client', 'name email phone address');
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Propuesta no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: proposal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar el estado',
      error: error.message
    });
  }
});

// Eliminar propuesta
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndDelete(req.params.id);
    if (!proposal) {
      return res.status(404).json({ message: 'Propuesta no encontrada' });
    }
    res.json({ message: 'Propuesta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;