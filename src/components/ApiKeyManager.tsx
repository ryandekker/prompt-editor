import React, { useState, useEffect } from 'react';

export interface OpenAIConfig {
  apiKey: string;
  model: 'gpt-5-mini' | 'gpt-4o-mini' | 'gpt-3.5-turbo';
}

interface ApiKeyManagerProps {
  onConfigChange: (config: OpenAIConfig | null) => void;
  currentConfig: OpenAIConfig | null;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onConfigChange, currentConfig }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState<OpenAIConfig['model']>('gpt-5-mini');
  const [isVisible, setIsVisible] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const savedKey = localStorage.getItem('openai-api-key');
    const savedModel = localStorage.getItem('openai-model') as OpenAIConfig['model'];
    
    if (savedKey) {
      setApiKey(savedKey);
      const config: OpenAIConfig = {
        apiKey: savedKey,
        model: savedModel || 'gpt-5-mini'
      };
      setModel(config.model);
      onConfigChange(config);
    } else {
      setIsVisible(true); // Show the setup if no API key is saved
    }
  }, [onConfigChange]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('Please enter a valid API key');
      return;
    }

    const config: OpenAIConfig = {
      apiKey: apiKey.trim(),
      model
    };

    // Save to localStorage
    localStorage.setItem('openai-api-key', config.apiKey);
    localStorage.setItem('openai-model', config.model);
    
    onConfigChange(config);
    setIsVisible(false);
    setIsEditMode(false);
  };

  const handleClear = () => {
    localStorage.removeItem('openai-api-key');
    localStorage.removeItem('openai-model');
    setApiKey('');
    setModel('gpt-5-mini');
    onConfigChange(null);
    setIsVisible(true);
    setIsEditMode(false);
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.slice(0, 4) + '...' + key.slice(-4);
  };

  return (
    <div className="api-key-manager">
      {!isVisible && currentConfig ? (
        <div className="api-key-status">
          <div className="api-status-indicator">
            <span className="api-status-text">API Ready</span>
            <span className="api-model-badge">{currentConfig.model}</span>
          </div>
          {isEditMode && (
            <div className="key-details">
              <span className="key-value">
                {showKey ? currentConfig.apiKey : maskApiKey(currentConfig.apiKey)}
              </span>
              <button
                className="toggle-visibility"
                onClick={() => setShowKey(!showKey)}
                type="button"
                title={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          )}
          <div className="key-actions">
            <button
              onClick={() => {
                if (!isEditMode) {
                  setIsEditMode(true);
                } else {
                  setIsVisible(true);
                }
              }}
              className="btn-edit"
            >
              {isEditMode ? 'Configure' : 'Edit'}
            </button>
            {isEditMode && (
              <button onClick={handleClear} className="btn-clear">
                Clear
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="api-key-setup">
          <h3>OpenAI API Configuration</h3>
          <p>Enter your OpenAI API key to use the prompt editing features.</p>
          
          <div className="form-group">
            <label htmlFor="api-key">API Key:</label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="api-key-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="model-select">Model:</label>
            <select
              id="model-select"
              value={model}
              onChange={(e) => setModel(e.target.value as OpenAIConfig['model'])}
              className="model-select"
            >
              <option value="gpt-5-mini">GPT-5 Mini (Latest)</option>
              <option value="gpt-4o-mini">GPT-4 Mini</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>

          <div className="form-actions">
            <button onClick={handleSave} className="btn-save">
              Save Configuration
            </button>
            {currentConfig && (
              <button onClick={() => {
                setIsVisible(false);
                setIsEditMode(false);
              }} className="btn-cancel">
                Cancel
              </button>
            )}
          </div>

          <div className="security-note">
            <small>
              Security: Your API key is stored securely in your browser's local storage and never sent to our servers.
            </small>
          </div>
        </div>
      )}
    </div>
  );
};