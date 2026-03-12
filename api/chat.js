module.exports = async function handler(req, res) {
  // 设置超时
  res.setTimeout(25 * 1000);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, apiKey, model, apiUrl } = req.body;

  if (!prompt || !apiKey || !model || !apiUrl) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    console.log('Calling API:', apiUrl, 'model:', model);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    console.log('API response status:', response.status);
    
    const text = await response.text();
    console.log('API response length:', text.length);
    
    if (!text || text.trim() === '') {
      return res.status(502).json({ error: 'Empty response from upstream API' });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.log('Failed to parse:', text.slice(0, 200));
      return res.status(502).json({ error: 'Invalid JSON from upstream', raw: text.slice(0, 500) });
    }

    res.status(200).json(data);
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
