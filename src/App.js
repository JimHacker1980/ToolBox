import React, { useState } from 'react';
import './App.css';
import FileUploader from './components/FileUploader';
import JsonViewer from './components/JsonViewer';
import ApiConfigurator from './components/ApiConfigurator';
import LanguageReader from './components/LanguageReader';

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
    <div className="App">
      <header className="App-header">
        <h1>
          <span
            className={mode === 'math' ? 'font-bold text-white' : 'text-gray-300 cursor-pointer'}
            style={{marginRight: 24, fontSize: 28, transition: 'color 0.2s'}}
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
            className={mode === 'language' ? 'font-bold text-white' : 'text-gray-300 cursor-pointer'}
            style={{fontSize: 28, transition: 'color 0.2s'}}
            onClick={() => setMode('language')}
          >
            Language Reader
          </span>
        </h1>
      </header>
      <main className="p-4">
        {mode === 'math' ? (
          <>
            <FileUploader onFileUpload={handleFileUpload} />
            {jsonContent && (
              <JsonViewer
                content={jsonContent}
                onItemSelect={handleItemSelection}
              />
            )}
          </>
        ) : (
          <LanguageReader />
        )}
      </main>
      {mode === 'math' && (
        <footer className="p-4 border-t border-gray-300">
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