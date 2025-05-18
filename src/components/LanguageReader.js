import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const LanguageReader = () => {
  const [apiKey, setApiKey] = useState('');
  const [textBlocks, setTextBlocks] = useState([{
    id: 0,
    text: '',
    parsed: null,
    translated: null,
    wordDetails: {} // 存储单词详细解析
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRefs = useRef({});
  // 新增：用于弹窗显示单词详细信息
  const [selectedWord, setSelectedWord] = useState({ blockId: null, wordIdx: null });

  // 重排ID为连续自然数
  const reorderIds = (blocks) => {
    return blocks.map((block, index) => ({ ...block, id: index }));
  };

  // 处理文件上传
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const blocks = content.split('\n')
        .map((line, index) => ({
          id: index,
          text: line.trim(),
          parsed: null,
          translated: null,
          wordDetails: {}
        }))
        .filter(block => block.text.length > 0);
      
      setTextBlocks(blocks);
    };
    reader.readAsText(file);
  };

  // 处理文本区域变化（实时分段）
  const handleTextChange = (e, blockId) => {
    const newText = e.target.value;
    const lines = newText.split('\n');
    
    if (lines.length === 1) {
      setTextBlocks(prev => prev.map(block => 
        block.id === blockId ? { ...block, text: newText } : block
      ));
      return;
    }

    const currentIndex = textBlocks.findIndex(b => b.id === blockId);
    let newBlocks = [...textBlocks];
    
    // 更新当前块为第一行
    newBlocks[currentIndex] = { ...newBlocks[currentIndex], text: lines[0].trim() };
    
    // 添加新块
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        newBlocks.splice(currentIndex + i, 0, {
          id: Date.now() + i,
          text: line,
          parsed: null,
          translated: null,
          wordDetails: {}
        });
      }
    }
    
    // 重排ID
    newBlocks = reorderIds(newBlocks);
    setTextBlocks(newBlocks);
  };

  // 调用大模型API
  const callApi = async (prompt, apiKey) => {
    if (!apiKey) {
      alert('请先输入API密钥');
      return null;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "Qwen/Qwen3-8B",
          messages: [
            { role: "user", content: prompt } // 发送的提示信息
          ],
          stream: false,
          max_tokens: 4096,
          enable_thinking: false,
          min_p: 0.05,
          temperature: 0.7,
          top_p: 0.7,
          top_k: 50,
          frequency_penalty: 0.5,
          n: 1,
          stop: [],
          response_format: { type: "text" },
        })
      });

      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API调用失败:', error);
      alert('网络请求失败，请检查连接');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

const handleAnalyze = async (blockId) => {
  // 第一步：调用大模型进行分词
  const segmentPrompt = `请将以下文本严格拆分为单词列表（用空格分隔，仅返回单词，无需其他内容）：\n${textBlocks[blockId].text}`;
  const segmentData = await callApi(segmentPrompt, apiKey);

  if (!segmentData || !segmentData.choices || !segmentData.choices[0].message.content) {
    alert('分词失败，请检查输入内容或API连接');
    return;
  }

  // 处理分词结果
  const words = segmentData.choices[0].message.content
    .trim()
    .split(' ')
    .filter(word => word.length > 0);

  if (words.length === 0) {
    alert('未检测到有效单词');
    return;
  }

  // 第二步：逐个查询单词详情（文本格式）
  const wordDetails = {};
  for (const word of words) {
    const detailPrompt = `请用中文提供单词 "${word}" 的解析，包含以下信息：
    1. 原型（baseForm）
    2. 中文含义（meaning）
    3. 语法地位（syntax）
    要求：用简洁文本表示，不需要JSON格式`;
    
    const detailData = await callApi(detailPrompt, apiKey);
    
    if (detailData && detailData.choices && detailData.choices[0].message.content) {
      try {
        const detailContent = detailData.choices[0].message.content.trim();
        // 解析文本结果（按行分割，提取关键信息）
        
        wordDetails[word] = {
          word,
          meaning: detailContent || '无',
        };
      } catch (error) {
        console.error(`单词 ${word} 解析失败：`, error);
        wordDetails[word] = { word, meaning: '解析失败'};
      }
    } else {
      wordDetails[word] = { word, meaning: '无'};
    }
  }

  // 更新状态（假设 textBlocks 中有 wordDetails 字段）
  setTextBlocks(prev => prev.map(block => 
    block.id === blockId ? { 
      ...block, 
      parsed: words, 
      wordDetails: wordDetails 
    } : block
  ));
};


  // 翻译函数，支持每段独立翻译
  const handleTranslate = async (blockId) => {
    const prompt = `请将以下文本翻译为中文，要求忠实、流畅：\n${textBlocks[blockId].text}`;
    const data = await callApi(prompt, apiKey);
    if (data && data.choices && data.choices[0].message.content) {
      setTextBlocks(prev => prev.map(block =>
        block.id === blockId ? { ...block, translated: data.choices[0].message.content } : block
      ));
    } else {
      alert('翻译失败或API异常');
    }
  };

  // 渲染单词按钮和弹窗
  const renderWordButtons = (detailsArr, blockId) => {
    if (!detailsArr || !Array.isArray(detailsArr) || detailsArr.length === 0) return <p>无解析结果</p>;
    return (
      <div className="flex flex-wrap gap-2 mb-2">
        {detailsArr.map((item, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded border ${selectedWord.blockId === blockId && selectedWord.wordIdx === idx ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-blue-100'}`}
            onClick={() => setSelectedWord({ blockId, wordIdx: idx })}
            style={{
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 'bold',
  textAlign: 'center',
  color: '#ffffff',
  backgroundColor: '#87CEFA', // 淡蓝色
  border: 'none',
  borderRadius: '4px',
  padding: '4px 6px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  cursor: 'pointer',
  transition: 'background-color 0.3s, transform 0.2s',
  margin: '2px 0.5%', // 增加上下间距
  verticalAlign: 'middle', // 垂直居中对齐
}}
          >
            {item || ''}
          </button>
        ))}
      </div>
    );
  };

  const renderWordModal = () => {
    if (selectedWord.blockId === null || selectedWord.wordIdx === null) {
      return null;
    }
    
    const block = textBlocks.find(b => b.id === selectedWord.blockId);
    if (!block || !block.parsed || !block.wordDetails) {
      return null;
    }
    
    const word = block.parsed[selectedWord.wordIdx];
    const details = block.wordDetails[word] || { word, meaning: '无' };
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-xl p-6 min-w-[300px] max-w-md relative transform transition-all">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{details.word}</h3>
            <ReactMarkdown>{details.meaning}</ReactMarkdown>
          </div>
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
            onClick={() => setSelectedWord({ blockId: null, wordIdx: null })}
            style={{
              display: 'inline-block',
              width: '15%',
              padding: '4px 6px',
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
              margin: '2px 0.5%', // 增加上下间距
            }}
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* 文件上传与API密钥区域 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="relative">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow flex items-center"
            onClick={() => fileInputRef.current.click()}
            style={{
                display: 'inline-block',
                width: '15%',
                padding: '8px 10px',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#ffffff',
                backgroundColor: '#B0E0E6', // 淡蓝色
                border: 'none',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'background-color 0.3s, transform 0.2s',
                marginRight: '0.5%',
              }}
          >
            <i className="fa fa-upload mr-2"></i> 选择TXT文件
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
            style={{
                display: 'inline-block',
                width: '15%',
                padding: '8px 10px',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#ffffff',
                backgroundColor: '#B0E0E6', // 淡蓝色
                border: 'none',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'background-color 0.3s, transform 0.2s',
                marginRight: '0.5%',
              }}
          />
        </div>

        <div className="w-full md:w-auto">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            API密钥
          </label>
          <div className="relative">
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入你的API密钥"
              style={{
              background: '#fff',
              border: '2px solid #87ceeb', // 蓝色高对比边框
              width: '10%',
              borderRadius: 18,
              boxShadow: '0 4px 24px 0 rgba(59,130,246,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.06)',
              padding: 12,
              margin: '0 auto',
              marginBottom: 32,
              position: 'relative',
              transition: 'box-shadow 0.2s',
            }}
            />
            
                          <div className="text-xs text-gray-400 mt-1">提示：输入时按Enter键自动创建新段落</div>

          </div>
        </div>
      </div>

      {/* 文本块区域 */}
      <div className="space-y-4">
        {textBlocks.map((block) => (
          <div
            key={block.id}
            style={{
              background: '#fff',
              border: '2px solid #87ceeb', // 蓝色高对比边框
              width: '90%',
              borderRadius: 18,
              boxShadow: '0 4px 24px 0 rgba(59,130,246,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.06)',
              padding: 24,
              margin: '0 auto',
              marginBottom: 32,
              position: 'relative',
              transition: 'box-shadow 0.2s',
            }}
          >

            <div className="mb-4">
              <textarea
                ref={(el) => textareaRefs.current[block.id] = el}
                value={block.text}
                onChange={(e) => handleTextChange(e, block.id)}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-24 focus:border-blue-500 focus:ring-blue-200"
                placeholder="请输入或粘贴文本（按Enter自动分段）"
                rows={3}
                style={{
              background: '#fff',
              width: '95%',
              borderRadius: 18,
              boxShadow: '0 4px 24px 0 rgba(59,130,246,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.06)',
              padding: 24,
              margin: '0 auto',
              marginBottom: 32,
              position: 'relative',
              transition: 'box-shadow 0.2s',
              font: 'Times New Roman bold',
              fontSize: 18,
            }}
              />
            </div>


            <div className="flex justify-between items-center mb-4">
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md flex items-center"
                onClick={() => handleAnalyze(block.id)}
                disabled={isLoading || !block.text.trim()}
                style={{
              display: 'inline-block',
              width: '15%',
              padding: '4px 6px',
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
                <i className="fa fa-sitemap mr-2"></i> 解析单词
              </button>

              {/* 翻译结果显示 */}
            

              {/* 解析结果显示 */}
            {block.parsed && (
              <div className="border-t border-gray-200 pt-4">
                {renderWordButtons(block.parsed, block.id)}
                {renderWordModal(block)}
              </div>
            )}

              <button
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1.5 rounded-md flex items-center"
                onClick={() => handleTranslate(block.id)}
                disabled={isLoading || !block.text.trim()}
                style={{
              display: 'inline-block',
              width: '15%',
              padding: '4px 6px',
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
                <i className="fa fa-language mr-2"></i> 翻译文本
              </button>
            </div>

            {/* 翻译结果显示 */}
            {block.translated && (
              <div className="mt-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-gray-800">{block.translated}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-3">
              <div className="flex space-x-2">
                {textBlocks.length > 1 && (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                    onClick={() => {
                      setTextBlocks(prev => {
                        const newBlocks = prev.filter(b => b.id !== block.id);
                        return reorderIds(newBlocks);
                      });
                    }}
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
              margin: '2px 0.5%', // 增加上下间距
            }}
                  >
                    <i className="fa fa-trash mr-1"></i> 删除
                  </button>
                )}
              </div>
            </div>
            
          </div>
        ))}
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin h-8 w-8 border-4 border-blue-300 border-t-blue-600 rounded-full mr-4"></div>
            <p className="text-lg text-gray-700">正在请求大模型服务，请稍候...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageReader;