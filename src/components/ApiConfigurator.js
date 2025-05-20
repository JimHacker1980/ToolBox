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
      return `请用中文解释以下概念或例子，注意解释要简练，并且结合数学公式，给出直观的解释，和一个具体的例子：\n\n名称：${currentItem.概念名}\n定义：${currentItem.概念定义}`;
    } else if (currentType === '定理') {
      return `请用中文解释以下定理和证明，解释需要指出这个定理的证明思路的出发点是什么，以及整个思路里面关键环节，用自然语言解释每个环节，给出这些自然语言对应的数学公式，注意解释要简练：\n\n内容：${currentItem.定理内容}\n证明：${currentItem.证明}`;
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
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
      {/* 左侧API配置卡片 */}
      <div style={{
        borderTop: '1px solid #d1d5db',
        borderLeft: '1px solid #d1d5db',
        borderBottom: '1px solid #d1d5db',
        borderRight: 'none',
        borderRadius: '16px 16px 16px 16px', // 四角圆角，右上右下光滑
        background: '#fff',
        padding: 24,
        width: 200,
        minWidth: 200,
        maxWidth: 200,
        boxShadow: '0 2px 8px rgba(59,130,246,0.07)',
        marginTop: 8,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>大模型 API 配置</h2>
        <div style={{ marginBottom: 12 }}>
          <label style={{
            display: 'block',
            fontSize: 15,
            fontWeight: 500,
            color: '#374151',
            marginBottom: 4,
            marginLeft: 2,
            textAlign: 'left',
          }}>API 密钥</label>
          <input
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="请输入您的API密钥"
            style={{
              background: '#fff',
              border: '2px solid #87ceeb',
              width: '90%',
              borderRadius: 18,
              boxShadow: '0 4px 24px 0 rgba(59,130,246,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.06)',
              padding: 12,
              marginBottom: 5,
              position: 'relative',
              transition: 'box-shadow 0.2s',
            }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{
            display: 'block',
            fontSize: 15,
            fontWeight: 500,
            color: '#374151',
            marginBottom: 4,
            marginLeft: 2,
            textAlign: 'left',
          }}>问题</label>
          <textarea
            value={query}
            readOnly
            placeholder="问题将根据当前显示的内容自动生成"
            style={{
              background: '#fff',
              border: '2px solid #87ceeb',
              width: '90%',
              borderRadius: 18,
              boxShadow: '0 4px 24px 0 rgba(59,130,246,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.06)',
              padding: 12,
              marginBottom: 5,
              position: 'relative',
              transition: 'box-shadow 0.2s',
              minHeight: 60,
              resize: 'vertical',
            }}
          />
        </div>
        <button
          onClick={handleSendQuery}
          style={{
            display: 'inline-block',
            width: '100%',
            padding: '10px 0',
            fontSize: '15px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#fff',
            backgroundColor: '#87CEEB',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
            cursor: 'pointer',
            transition: 'background-color 0.3s, transform 0.2s',
            marginTop: 8,
          }}
        >
          发送问题
        </button>
      </div>
      {/* 右侧模型返回内容 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {response && (
          <div style={{ marginTop: 0, padding: 24, border: '1px solid #d1d5db', borderRadius: 16, background: '#f8fafc', minHeight: 120 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>模型返回的内容:</h3>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({ node, ...props }) => <p {...props} style={{ fontSize: 15, color: '#374151', whiteSpace: 'pre-wrap', margin: 0 }} />,
              }}
            >
              {response}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiConfigurator;