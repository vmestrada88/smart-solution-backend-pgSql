const Client = require('../models/Client');

// Create new client
const createClient = async (req, res) => {
  try {
    const { companyName, address, city, state, zip, contacts } = req.body;
    
    const newClient = new Client({
      companyName,
      address,
      city,
      state,
      zip,
      contacts: contacts || []
    });

    const savedClient = await newClient.save();
    res.status(201).json(savedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client no found' });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateClient = async (req, res) => {
  try {
    const { companyName, address, city, state, zip, contacts } = req.body;
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client no found' });
    }

    client.companyName = companyName ?? client.companyName;
    client.address = address ?? client.address;
    client.city = city ?? client.city;
    client.state = state ?? client.state;
    client.zip = zip ?? client.zip;
    client.contacts = contacts ?? client.contacts;

    const updatedClient = await client.save();
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add job to client
const addJobToClient = async (req, res) => {
  try {
    const { date, description, equipmentInstalled, images, notes, invoiceId } = req.body;

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client no found'  });
    }

    const newJob = {
      date: date ? new Date(date) : new Date(),
      description,
      equipmentInstalled: equipmentInstalled || [],
      images: images || [],
      notes: notes || '',
      invoiceId: invoiceId || null,
    };

    client.jobs.push(newJob);
    await client.save();

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  addJobToClient,
};
