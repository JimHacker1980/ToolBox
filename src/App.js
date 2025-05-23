import React, { useState } from 'react';
import './App.css';
import FileUploader from './components/FileUploader';
import JsonViewer from './components/JsonViewer';
import ApiConfigurator from './components/ApiConfigurator';
import LanguageReader from './components/LanguageReader';
import BookReader from './components/BookReader';

function App() {
  const [jsonContent, setJsonContent] = useState(null);
  const [apiResponse, setApiResponse] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [currentType, setCurrentType] = useState('概念');
  const [mode, setMode] = useState('math'); // 'math' 或 'language'

  const handleFileUpload = (content) => {
    setJsonContent(content);
  };

  const handleApiResponse = (response) => {
    setApiResponse(response);
  };

  const handleItemSelection = (item, selectedType) => {
    setCurrentItem(item);
    setCurrentType(selectedType);
  };

  return (
    <div className="App" style={{ minHeight: '100vh', background: 'linear-gradient(120deg,#e0e7ff 0%,#f8fafc 100%)' }}>
      <header className="App-header" style={{
        background: 'linear-gradient(90deg,#2563eb 0%,#60a5fa 100%)',
        padding: '36px 0 24px 0',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        boxShadow: '0 4px 32px 0 rgba(59,130,246,0.10)',
        marginBottom: 32,
      }}>
        <h1 style={{ textAlign: 'center', letterSpacing: 2, fontWeight: 800, fontSize: 32, color: '#fff', marginBottom: 0 }}>
          <span
            className={mode === 'math' ? 'font-bold' : ''}
            style={{
              marginRight: 24,
              fontSize: 28,
              color: mode === 'math' ? '#fff' : '#dbeafe',
              cursor: mode === 'math' ? 'default' : 'pointer',
              padding: '4px 18px',
              borderRadius: 10,
              background: mode === 'math' ? 'rgba(59,130,246,0.18)' : 'none',
              transition: 'color 0.2s, background 0.2s',
            }}
            onClick={() => setMode('math')}
          >
            Math Learner
          </span>
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: 28,
              background: 'rgba(255,255,255,0.5)',
              verticalAlign: 'middle',
              margin: '0 18px',
              borderRadius: 1
            }}
          />
          <span
            className={mode === 'language' ? 'font-bold' : ''}
            style={{
              marginRight: 24,
              fontSize: 28,
              color: mode === 'language' ? '#fff' : '#dbeafe',
              cursor: mode === 'language' ? 'default' : 'pointer',
              padding: '4px 18px',
              borderRadius: 10,
              background: mode === 'language' ? 'rgba(59,130,246,0.18)' : 'none',
              transition: 'color 0.2s, background 0.2s',
            }}
            onClick={() => setMode('language')}
          >
            Language Reader
          </span>
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: 28,
              background: 'rgba(255,255,255,0.5)',
              verticalAlign: 'middle',
              margin: '0 18px',
              borderRadius: 1
            }}
          />
          <span
            className={mode === 'book' ? 'font-bold' : ''}
            style={{
              fontSize: 28,
              color: mode === 'book' ? '#fff' : '#dbeafe',
              cursor: mode === 'book' ? 'default' : 'pointer',
              padding: '4px 18px',
              borderRadius: 10,
              background: mode === 'book' ? 'rgba(59,130,246,0.18)' : 'none',
              transition: 'color 0.2s, background 0.2s',
            }}
            onClick={() => setMode('book')}
          >
            Book Reader
          </span>
        </h1>
      </header>
      <main style={{ padding: '32px 0', minHeight: 600 }}>
        {mode === 'math' ? (
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <FileUploader onFileUpload={handleFileUpload} />
            {jsonContent && (
              <JsonViewer
                content={jsonContent}
                onItemSelect={handleItemSelection}
              />
            )}
          </div>
        ) : mode === 'language' ? (
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <LanguageReader />
          </div>
        ) : (
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <BookReader />
          </div>
        )}
      </main>
      {mode === 'math' && (
        <footer style={{ padding: 32, borderTop: '1.5px solid #dbeafe', background: '#f8fafc', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, boxShadow: '0 -2px 12px 0 rgba(59,130,246,0.04)' }}>
          <ApiConfigurator
            onApiResponse={handleApiResponse}
            currentItem={currentItem}
            currentType={currentType}
          />
        </footer>
      )}
    </div>
  );
}

export default App;