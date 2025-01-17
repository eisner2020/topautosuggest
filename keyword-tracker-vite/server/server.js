import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

app.use(cors());
app.use(express.json());

// Ensure data file exists
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ keywords: [] }));
  }
}

// Read keywords from file
async function readKeywords() {
  const data = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(data).keywords;
}

// Write keywords to file
async function writeKeywords(keywords) {
  await fs.writeFile(DATA_FILE, JSON.stringify({ keywords }, null, 2));
}

// Load settings from file
async function loadSettings() {
  try {
    await fs.access(SETTINGS_FILE);
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    let settings = JSON.parse(data);
    console.log('Settings loaded:', settings);
    return settings;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No existing settings file, creating new one');
      let settings = {
        agencyEmails: [],
        emailTemplate: {
          subject: 'Keyword Match Found - {{platform}}',
          message: 'Hello,\n\nWe found a target result in {{platform}}\'s search suggestions!\n\nCompany: {{companyName}}\nBase Keyword: {{baseKeyword}}\nTarget Result: {{targetResult}}\nFirst Found: {{foundDate}}\n\nBest regards,\nKeyword Verification System'
        }
      };
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
      return settings;
    } else {
      console.error('Error loading settings:', error);
      throw error;
    }
  }
}

// Save settings to file
async function saveSettings(settings) {
  try {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    console.log('Settings saved successfully');
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

// Get all keywords
app.get('/api/keywords', async (req, res) => {
  try {
    await ensureDataFile();
    const keywords = await readKeywords();
    res.json(keywords);
  } catch (error) {
    console.error('Error reading keywords:', error);
    res.status(500).json({ error: 'Failed to read keywords' });
  }
});

// Add new keyword
app.post('/api/keywords', async (req, res) => {
  try {
    const { keyword, expectedResult } = req.body;
    if (!keyword || !expectedResult) {
      return res.status(400).json({ error: 'Keyword and expected result are required' });
    }

    await ensureDataFile();
    const keywords = await readKeywords();
    
    const newKeyword = {
      id: uuidv4(),
      keyword,
      expectedResult,
      lastChecked: new Date().toISOString(),
      isFound: false
    };

    keywords.push(newKeyword);
    await writeKeywords(keywords);
    
    res.status(201).json(newKeyword);
  } catch (error) {
    console.error('Error adding keyword:', error);
    res.status(500).json({ error: 'Failed to add keyword' });
  }
});

// Delete keyword
app.delete('/api/keywords/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await ensureDataFile();
    const keywords = await readKeywords();
    
    const updatedKeywords = keywords.filter(k => k.id !== id);
    await writeKeywords(updatedKeywords);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting keyword:', error);
    res.status(500).json({ error: 'Failed to delete keyword' });
  }
});

// Settings routes
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await loadSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    let settings = req.body;
    await saveSettings(settings);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const BUILD_DIR = path.join(__dirname, '../dist');
  app.use(express.static(BUILD_DIR));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
