const { Client, Contact, Job } = require('../models');
const auth = require('../middleware/auth'); // Verifica la ruta

const VALID_CLIENT_STATUSES = ['prospect', 'active', 'inactive'];

// Create new client (with contacts)
const createClient = async (req, res) => {
  const { companyName, address, city, state, zip, status, contacts } = req.body;
  try {
    const normalizedStatus = status || 'active';
    if (!VALID_CLIENT_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Invalid client status' });
    }

    const client = await Client.create(
      {
        companyName,
        address,
        city,
        state,
        zip,
        status: normalizedStatus,
        contacts: contacts || [],
      },
      {
        include: [{ model: Contact, as: 'contacts' }],
      }
    );
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all clients (with contacts and jobs)
const getClients = async (req, res) => {
  try {
    const clients = await Client.findAll({
      include: [
        { model: Contact, as: 'contacts' },
        { model: Job, as: 'jobs' },
      ],
    });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get client by ID (with contacts and jobs)
const getClientById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [
        { model: Contact, as: 'contacts' },
        { model: Job, as: 'jobs' },
      ],
    });
    if (!client) {
      return res.status(404).json({ message: 'Client no found' });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get client by contact email
const getClientByContactEmail = async (req, res) => {
  const { email } = req.params;
  try {
    // Primero, buscar el contacto por email
    const contact = await Contact.findOne({ where: { email } });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found for this email' });
    }
    // Luego, obtener el cliente usando el clientId del contacto
    const client = await Client.findByPk(contact.clientId, {
      include: [
        { model: Contact, as: 'contacts' },
        { model: Job, as: 'jobs' },
      ],
    });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update client and contacts
const updateClient = async (req, res) => {
  try {
    const { companyName, address, city, state, zip, status, contacts } = req.body;
    const client = await Client.findByPk(req.params.id, {
      include: [{ model: Contact, as: 'contacts' }],
    });
    if (!client) {
      return res.status(404).json({ message: 'Client no found' });
    }

    if (status && !VALID_CLIENT_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid client status' });
    }

    await client.update({
      companyName: companyName ?? client.companyName,
      address: address ?? client.address,
      city: city ?? client.city,
      state: state ?? client.state,
      zip: zip ?? client.zip,
      status: status ?? client.status,
    });
    // Si se envían contactos, actualizarlos (borrar y crear nuevos por simplicidad)
    if (contacts) {
      await Contact.destroy({ where: { clientId: client.id } });
      const newContacts = contacts.map(c => ({ ...c, clientId: client.id }));
      await Contact.bulkCreate(newContacts);
    }
    const updatedClient = await Client.findByPk(client.id, {
      include: [{ model: Contact, as: 'contacts' }],
    });
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add job to client
const addJobToClient = async (req, res) => {
  try {
    const { date, description, equipmentInstalled, images, notes, invoiceId } = req.body;
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client no found' });
    }
    const job = await Job.create({
      date: date ? new Date(date) : new Date(),
      description,
      equipmentInstalled: equipmentInstalled || [],
      images: images || [],
      notes: notes || '',
      invoiceId: invoiceId || null,
      clientId: client.id,
    });

    if (client.status !== 'active') {
      await client.update({ status: 'active' });
    }

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  getClientByContactEmail,
  updateClient,
  addJobToClient,
};
