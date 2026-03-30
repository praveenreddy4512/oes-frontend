/**
 * AI Extension & Copilot Detection System
 * Detects and blocks AI tools during exam sessions
 * 
 * Detects:
 * - Copilot in Edge (Ctrl+I, Ctrl+Shift+I)
 * - ChatGPT extensions
 * - Claude extensions
 * - Gemini extensions
 * - Clipboard access to AI services
 * - Suspicious network requests
 */

class AIExtensionDetector {
  constructor() {
    this.aiExtensionEvents = [];
    this.suspiciousActivities = [];
    this.copilotAttempts = 0;
    this.clipboardAccessAttempts = 0;
    this.aiKeywords = [
      'copilot', 'chatgpt', 'claude', 'gemini', 'gpt', 'openai',
      'anthropic', 'perplexity', 'bard', 'deepseek', 'llama'
    ];
  }

  /**
   * Initialize AI extension detection
   */
  init() {
    this.detectCopilotShortcuts();
    this.detectClipboardAccess();
    this.detectExtensionRequests();
    this.detectBrowserDevTools();
    this.detectSuspiciousNetwork();
    this.detectContextMenu();
    this.monitorFocusChange();
  }

  /**
   * Detect Copilot & AI shortcuts (Ctrl+I, Ctrl+Shift+I, Cmd+I)
   */
  detectCopilotShortcuts() {
    document.addEventListener('keydown', (e) => {
      const isCopilotShortcut = 
        (e.ctrlKey || e.metaKey) && e.key === 'i' ||
        (e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'i' ||
        (e.ctrlKey || e.metaKey) && e.key === '?' ||
        (e.ctrlKey || e.metaKey) && e.altKey && e.key === 'i';

      if (isCopilotShortcut) {
        e.preventDefault();
        e.stopPropagation();
        this.logAIEvent('COPILOT_SHORTCUT_ATTEMPT', {
          key: e.key,
          ctrl: e.ctrlKey,
          meta: e.metaKey,
          shift: e.shiftKey,
          timestamp: new Date().toISOString()
        });
        this.copilotAttempts++;
        this.showWarning('Copilot & AI tools are disabled during exam');
        return false;
      }
    }, true);
  }

  /**
   * Detect clipboard access (students copying to use with AI)
   */
  detectClipboardAccess() {
    document.addEventListener('copy', (e) => {
      const selectedText = window.getSelection().toString();
      
      // Flag if copying large amount of text or image
      if (selectedText.length > 200) {
        this.clipboardAccessAttempts++;
        this.logAIEvent('SUSPICIOUS_CLIPBOARD_COPY', {
          textLength: selectedText.length,
          preview: selectedText.substring(0, 100),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Detect paste attempts
    document.addEventListener('paste', (e) => {
      this.logAIEvent('CLIPBOARD_PASTE_ATTEMPT', {
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Detect AI extensions trying to interact with page
   */
  detectExtensionRequests() {
    const self = this; // Capture 'this' context

    // Intercept Extension Message Passing
    if (chrome && chrome.runtime) {
      const originalSendMessage = chrome.runtime.sendMessage;
      chrome.runtime.sendMessage = function(...args) {
        self.logAIEvent('EXTENSION_MESSAGE_ATTEMPT', {
          args: args,
          timestamp: new Date().toISOString()
        });
        // Block extension messages during exam
        console.warn('Extension communication blocked during exam');
        return null;
      };
    }

    // Monitor window messages from extensions
    window.addEventListener('message', (e) => {
      const data = e.data || {};
      const source = e.source || e.origin;
      
      // Check for AI extension patterns
      const isAIExtension = 
        source?.includes('extension://') ||
        data.type?.includes('AI') ||
        data.source?.includes('copilot') ||
        data.source?.includes('chatgpt');

      if (isAIExtension) {
        self.logAIEvent('AI_EXTENSION_DETECTED', {
          source: source,
          dataType: data.type,
          dataSource: data.source,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * Detect browser DevTools opening (can be used with extensions)
   */
  detectBrowserDevTools() {
    const devToolsCheck = setInterval(() => {
      const start = performance.now();
      debugger; // This pauses if DevTools is open
      const end = performance.now();

      // If pause was >100ms, DevTools likely open
      if (end - start > 100) {
        this.logAIEvent('DEVTOOLS_DETECTED', {
          pauseDuration: end - start,
          timestamp: new Date().toISOString()
        });
      }
    }, 2000);
  }

  /**
   * Monitor network requests for AI API calls
   */
  detectSuspiciousNetwork() {
    const originalFetch = window.fetch;
    const self = this; // Capture 'this' context

    window.fetch = function(...args) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
      
      // Check if URL is an AI API call
      if (self.isAIAPICall(url)) {
        self.logAIEvent('AI_API_REQUEST_BLOCKED', {
          url: url,
          timestamp: new Date().toISOString()
        });
        // Block the request
        return Promise.reject(new Error('AI API calls not allowed during exam'));
      }

      return originalFetch.apply(this, args);
    };
  }

  /**
   * Check if URL is an AI service
   */
  isAIAPICall(url) {
    const aiAPIs = [
      'openai.com/api',
      'api.openai.com',
      'anthropic.com/api',
      'api.anthropic.com',
      'google.com/generativeai',
      'generativelanguage.googleapis.com',
      'api.perplexity.ai',
      'api.cohere.com',
      'api.deepseek.com',
    ];

    return aiAPIs.some(api => url.includes(api));
  }

  /**
   * Detect right-click context menu (extensions may inject options)
   */
  detectContextMenu() {
    document.addEventListener('contextmenu', (e) => {
      // Check for injected extension menu items
      setTimeout(() => {
        const contextMenu = document.querySelector('[data-extension]');
        if (contextMenu) {
          this.logAIEvent('EXTENSION_CONTEXT_MENU_DETECTED', {
            timestamp: new Date().toISOString()
          });
        }
      }, 100);
    });
  }

  /**
   * Monitor window focus/blur for AI tool usage in another window
   */
  monitorFocusChange() {
    let lastFocusTime = Date.now();
    let focusSwitchCount = 0;

    window.addEventListener('blur', () => {
      const timeAway = Date.now() - lastFocusTime;
      focusSwitchCount++;
      
      this.logAIEvent('WINDOW_BLUR', {
        timeAway,
        focusSwitchCount,
        timestamp: new Date().toISOString()
      });

      // Warn if too many focus switches (might be using Copilot in another window)
      if (focusSwitchCount > 5) {
        this.logAIEvent('EXCESSIVE_WINDOW_SWITCHING', {
          count: focusSwitchCount,
          timestamp: new Date().toISOString()
        });
      }
    });

    window.addEventListener('focus', () => {
      lastFocusTime = Date.now();
    });
  }

  /**
   * Log AI extension event to server
   */
  logAIEvent(eventType, data) {
    const event = {
      type: eventType,
      data: data,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    console.warn(`[⚠️ AI DETECTION] ${eventType}`, data);
    this.aiExtensionEvents.push(event);

    // Send to server
    this.sendEventToServer(event);
  }

  /**
   * Send event to backend for logging
   */
  async sendEventToServer(event) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/submissions/ai-detection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        console.error('Failed to log AI event to server');
      }
    } catch (error) {
      console.error('Error sending AI event to server:', error);
    }
  }

  /**
   * Show warning to student
   */
  showWarning(message) {
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #dc3545;
      color: white;
      padding: 15px 20px;
      border-radius: 4px;
      font-weight: bold;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    warning.textContent = message;
    document.body.appendChild(warning);

    setTimeout(() => warning.remove(), 5000);
  }

  /**
   * Get all detected AI events
   */
  getEvents() {
    return this.aiExtensionEvents;
  }

  /**
   * Check if suspicious AI activity detected
   */
  hasSuspiciousActivity() {
    return this.copilotAttempts > 0 || 
           this.clipboardAccessAttempts > 2 ||
           this.aiExtensionEvents.length > 0;
  }

  /**
   * Get summary for exam report
   */
  getSummary() {
    return {
      totalAIEvents: this.aiExtensionEvents.length,
      copilotAttempts: this.copilotAttempts,
      clipboardAccessAttempts: this.clipboardAccessAttempts,
      suspiciousActivityDetected: this.hasSuspiciousActivity(),
      events: this.aiExtensionEvents
    };
  }
}

export default AIExtensionDetector;
