export default async function handler(req, res) {
  res.setTimeout(25 * 1000);

  console.log('===== MathMate API 请求 =====');
  console.log('时间:', new Date().toISOString());
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('Body:', JSON.stringify(req.body));

  if (req.method !== 'POST') {
    console.log('错误: Method not allowed');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, apiKey, model, messages, apiUrl } = req.body;

  console.log('解析参数 - apiKey:', apiKey ? apiKey.slice(0,10)+'...' : 'empty');
  console.log('解析参数 - model:', model);
  console.log('解析参数 - apiUrl:', apiUrl);
  console.log('解析参数 - messages:', messages ? messages.length+'条' : 'empty');

  if (!apiKey) {
    console.log('错误: Missing apiKey');
    return res.status(400).json({ error: 'Missing apiKey' });
  }
  
  if (!model) {
    console.log('错误: Missing model');
    return res.status(400).json({ error: 'Missing model' });
  }

  // 根据前端传的apiUrl判断用哪个端点
  // 前端会传完整的URL，包含中国版或国际版
  let url = apiUrl;
  if (!url) {
    // 如果前端没传URL，默认使用中国版端点
    url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
  } else if (!url.includes('/chat/completions')) {
    // 如果URL不包含chat/completions，添加它
    url = url.replace(/\/$/, '') + '/chat/completions';
  }
  // 如果URL已经包含/chat/completions，就不重复添加
  
  console.log('API URL:', url);
  console.log('Model:', model);
  
  // 构建消息
  let msg = messages;
  if (!msg && prompt) {
    msg = [{ role: 'user', content: prompt }];
  }
  
  if (!msg || msg.length === 0) {
    return res.status(400).json({ error: 'Missing messages or prompt' });
  }

  try {
    console.log('开始调用阿里百炼API...');
    
    const requestBody = {
      model: model,
      messages: msg,
      temperature: 0.7,
      max_tokens: 2048
    };
    console.log('请求体:', JSON.stringify(requestBody).substring(0, 200));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('响应状态:', response.status, response.statusText);
    console.log('响应头:', JSON.stringify(Object.fromEntries(response.headers.entries())));
    
    const text = await response.text();
    console.log('响应文本:', text.substring(0, 500));
    
    let data;
    try {
      data = JSON.parse(text);
      console.log('响应JSON:', JSON.stringify(data).substring(0, 300));
    } catch (parseErr) {
      console.error('JSON解析失败:', parseErr.message);
      console.error('原始响应:', text);
      return res.status(502).json({ error: '上游响应解析失败', detail: text.substring(0, 200) });
    }
    
    if (!response.ok) {
      console.log('API返回错误状态');
      return res.status(response.status).json(data);
    }

    // 返回数据（不修改格式，让前端处理）
    console.log('===== API调用成功 =====');
    return res.status(200).json(data);
  } catch (error) {
    console.error('===== API调用异常 =====');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    return res.status(500).json({ error: 'API调用失败: ' + error.message });
  }
}
