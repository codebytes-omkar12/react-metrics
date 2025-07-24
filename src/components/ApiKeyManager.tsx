import React, { useState, useEffect } from 'react';
import { Settings, Check, Key, AlertCircle } from 'lucide-react';

const ApiKeyManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [feedbackState, setFeedbackState] = useState<'idle' | 'saved' | 'error'>('idle');
  const [isKeyPresentInSession, setIsKeyPresentInSession] = useState(false);

  // On initial mount, check sessionStorage for an existing key
  useEffect(() => {
    const keyFromSession = sessionStorage.getItem('gemini_api_key');
    if (keyFromSession) {
      setIsKeyPresentInSession(true);
      setApiKey(keyFromSession);
    }
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Reset feedback state when toggling, but keep the API key input value
    setFeedbackState('idle');
  };

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
    // If user starts typing, reset feedback state
    if (feedbackState !== 'idle') {
      setFeedbackState('idle');
    }
  };

  const saveApiKey = () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setFeedbackState('error');
      // Remove error state after the animation
      setTimeout(() => setFeedbackState('idle'), 820);
      return;
    }

    // Save the new key and update the UI state
    sessionStorage.setItem('gemini_api_key', trimmedKey);
    setIsKeyPresentInSession(true);
    setFeedbackState('saved');

    // After showing the "saved" feedback, close the input
    setTimeout(() => {
      setIsOpen(false);
      // Reset to idle after closing, ready for next open
      setTimeout(() => setFeedbackState('idle'), 500);
    }, 1500);
  };

  const getBorderColor = () => {
    switch (feedbackState) {
      case 'saved': return 'border-green-500';
      case 'error': return 'border-red-500';
      default: return 'border-border-light dark:border-border-dark';
    }
  };

  return (
    <div className="relative flex items-center">
      <button
        onClick={handleToggle}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label={isOpen ? 'Close API Key input' : 'Open API Key input'}
      >
        <Settings
          size={20}
          className={`text-text-secondary-light dark:text-text-secondary-dark transition-transform duration-500 ${
            isOpen ? 'rotate-90' : ''
          }`}
        />
      </button>
      <div
        className={`flex items-center gap-2 transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-w-md ml-2' : 'max-w-0 ml-0'
        }`}
      >
        <div className={`relative flex items-center transition-transform duration-300 ${feedbackState === 'error' ? 'animate-shake' : ''}`}>
          <Key size={16} className="absolute left-2 text-gray-400" />
          <input
            type="password"
            placeholder="Gemini API Key"
            value={apiKey}
            onChange={handleApiKeyChange}
            className={`pl-8 pr-8 py-1 text-sm rounded-md border-2 bg-transparent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark ${getBorderColor()}`}
          />
          {feedbackState === 'saved' && (
            <Check size={16} className="absolute right-2 text-green-500" />
          )}
           {feedbackState === 'error' && (
            <AlertCircle size={16} className="absolute right-2 text-red-500" />
          )}
        </div>
        <button
          onClick={saveApiKey}
          className="px-3 py-1 text-sm bg-primary-light text-white rounded-md hover:bg-primary-light/90 dark:bg-primary-dark dark:hover:bg-primary-dark/90 whitespace-nowrap"
        >
          Submit
        </button>
      </div>
      {!isKeyPresentInSession && !isOpen && (
        <span className="ml-2 text-xs text-red-500 whitespace-nowrap">No API Key Inserted</span>
      )}
    </div>
  );
};

export default ApiKeyManager;