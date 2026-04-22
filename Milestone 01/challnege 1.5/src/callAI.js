const axios = require('axios');

async function callAI(systemPrompt, userCode) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is missing from environment variables');
    }

    const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
            model: 'google/gemini-2.0-flash-001',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Analyze the following code for bugs and improvements:\n\n${userCode}` }
            ]
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        }
    );

    const usage = response.data.usage;

    const cost =
        (usage.prompt_tokens * 0.0000025) +
        (usage.completion_tokens * 0.00001);

    console.log(
        `[TOKEN LOG] prompt_tokens: ${usage.prompt_tokens} | completion_tokens: ${usage.completion_tokens} | total: ${usage.total_tokens} | est_cost_usd: $${cost.toFixed(4)}`
    );

    return response.data.choices[0].message.content;
}

module.exports = { callAI };
