const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const UNSTRUCTURED_API_KEY = process.env.UNSTRUCTURED_API_KEY || '';
const UNSTRUCTURED_URL = process.env.UNSTRUCTURED_URL || 'https://api.unstructured.io/general/v0/general';

// Simple in-memory vector store (swappable with Chroma)
const vectorStore = {
  collection: 'products',
  items: [], // { id, metadata, embedding: number[] }
};

// Cosine similarity
function cosineSim(a, b) {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const na = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const nb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return na && nb ? dot / (na * nb) : 0;
}

// OpenAI helper
async function openai(path, body) {
  const res = await fetch(`https://api.openai.com/v1/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }
  return res.json();
}

// POST /api/summarize
app.post('/api/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    const resp = await openai('chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You summarize RFPs and extract key details.' },
        { role: 'user', content: `Summarize the following RFP in <= 120 words and list deadlines, key product requirements, and quantities if any.\n\n${text}` }
      ],
      temperature: 0.2
    });
    const content = resp.choices?.[0]?.message?.content || '';
    res.json({ summary: content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/extract-requirements
app.post('/api/extract-requirements', async (req, res) => {
  try {
    const { text } = req.body;
    const resp = await openai('chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Extract structured paint requirements.' },
        { role: 'user', content: `From the RFP text, extract structured paint requirements as JSON array: [{id, area (sq ft), specs: {finish, coverage (sqft/l), minDurability (years)}}]. If missing values, infer reasonably.\n\n${text}` }
      ],
      temperature: 0.1
    });
    const content = resp.choices?.[0]?.message?.content || '[]';
    let requirements;
    try { requirements = JSON.parse(content); } catch { requirements = []; }
    res.json({ requirements });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/embed
app.post('/api/embed', async (req, res) => {
  try {
    const { inputs } = req.body; // string or string[]
    const texts = Array.isArray(inputs) ? inputs : [inputs];
    const resp = await openai('embeddings', {
      model: 'text-embedding-3-small',
      input: texts
    });
    res.json({ embeddings: resp.data.map(d => d.embedding) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/store-products  { items: [{ id, text, metadata }] }
app.post('/api/store-products', async (req, res) => {
  try {
    const { items } = req.body;
    const texts = items.map(i => i.text);
    const emb = await openai('embeddings', { model: 'text-embedding-3-small', input: texts });
    emb.data.forEach((d, idx) => {
      vectorStore.items.push({ id: items[idx].id, metadata: items[idx].metadata, embedding: d.embedding });
    });
    res.json({ stored: items.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/match  { query: string, k: number }
app.post('/api/match', async (req, res) => {
  try {
    const { query, k = 3 } = req.body;
    const emb = await openai('embeddings', { model: 'text-embedding-3-small', input: [query] });
    const q = emb.data[0].embedding;
    const scored = vectorStore.items.map(it => ({ score: cosineSim(q, it.embedding), item: it }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(r => ({ id: r.item.id, metadata: r.item.metadata, score: r.score }));
    res.json({ matches: scored });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/parse-pdf  { fileUrl }
app.post('/api/parse-pdf', async (req, res) => {
  try {
    const { fileUrl } = req.body;
    if (!UNSTRUCTURED_API_KEY) return res.status(400).json({ error: 'UNSTRUCTURED_API_KEY missing' });
    const r = await fetch(UNSTRUCTURED_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'unstructured-api-key': UNSTRUCTURED_API_KEY
      },
      body: JSON.stringify({ files: [fileUrl], strategy: 'auto' })
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Unstructured error ${r.status}: ${t}`);
    }
    const data = await r.json();
    // naive concat of text
    const text = Array.isArray(data) ? data.map(d => d.text || '').join('\n') : JSON.stringify(data);
    res.json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Agentic backend running on http://localhost:${PORT}`);
});


