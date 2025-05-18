import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const ApiConfigurator = ({ onApiResponse, currentItem, currentType }) => {
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState('');

  const generateQueryFromTemplate = () => {
    if (!currentItem) {
      return '';
    }

    if (currentType === '概念') {
      return `请解释以下概念，注意解释要简练，给出直观的解释，和一个具体的例子：\n\n名称：${currentItem.概念名}\n定义：${currentItem.概念定义}`;
    } else if (currentType === '定理') {
      return `请解释以下定理和证明，解释需要指出这个定理的证明思路的出发点是什么，以及整个思路里面关键环节，用自然语言解释每个环节，给出这些自然语言对应的数学公式，注意解释要简练：\n\n内容：${currentItem.定理内容}\n证明：${currentItem.证明}`;
    }

    return '';
  };

  const [query, setQuery] = useState(generateQueryFromTemplate());

  useEffect(() => {
    const updatedQuery = generateQueryFromTemplate();
    setQuery(updatedQuery);
  }, [currentItem, currentType]);

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  const handleSendQuery = async () => {
    const updatedQuery = generateQueryFromTemplate();
    setQuery(updatedQuery);

    if (!apiKey || !updatedQuery) {
      alert('请填写API密钥和问题');
      return;
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen3-8B',
        messages: [
          {
            role: 'user',
            content: updatedQuery,
          },
        ],
        stream: false,
        max_tokens: 4096,
        enable_thinking: false,
        thinking_budget: 4096,
        min_p: 0.05,
        stop: null,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        frequency_penalty: 0.5,
        n: 1,
        response_format: {
          type: 'text',
        },
        tools: [
          {
            type: 'function',
            function: {
              description: '<string>',
              name: '<string>',
              parameters: {},
              strict: false,
            },
          },
        ],
      }),
    };

    fetch('https://api.siliconflow.cn/v1/chat/completions', options)
      .then((response) => response.json())
      .then((data) => {
        setResponse(data.choices[0].message.content);
        onApiResponse(data.choices[0].message.content);
      })
      .catch((err) => {
        console.error('Error fetching API:', err);
        alert('请求失败，请检查API密钥或网络连接');
      });
  };

  return (
    <div className="border-t border-gray-300 p-4 mt-4">
      <h2 className="text-lg font-bold mb-2">大模型 API 配置</h2>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">API 密钥</label>
        <input
          type="password"
          value={apiKey}
          onChange={handleApiKeyChange}
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="请输入您的API密钥"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">问题</label>
        <textarea
          value={query}
          readOnly
          className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
          placeholder="问题将根据当前显示的内容自动生成"
        />
      </div>
      <button
        onClick={handleSendQuery}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        style={{
            display: 'inline-block',
            width: '15%',
            padding: '8px 10px',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#ffffff',
            backgroundColor: '#87CEEB', // 淡蓝色
            border: 'none',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'background-color 0.3s, transform 0.2s',
            marginRight: '0.5%',
          }}
      >
        发送问题
      </button>
      {response && (
        <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-50">
          <h3 className="text-sm font-bold mb-2">模型返回的内容:</h3>
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({ node, ...props }) => <p {...props} className="text-sm text-gray-700 whitespace-pre-wrap" />,
            }}
          >
            {response}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default ApiConfigurator;