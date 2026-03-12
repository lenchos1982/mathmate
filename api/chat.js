export default async function handler(req, res) {
  res.setTimeout(25 * 1000);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, apiKey, model, messages, apiUrl } = req.body;

  if (!apiKey || !model) {
    return res.status(400).json({ error: 'Missing apiKey or model' });
  }

  // 确定使用的 URL
  const url = apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
  
  // 构建消息
  let msg = messages;
  if (!msg && prompt) {
    msg = [{ role: 'user', content: prompt }];
  }
  
  if (!msg || msg.length === 0) {
    return res.status(400).json({ error: 'Missing messages or prompt' });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: msg,
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
