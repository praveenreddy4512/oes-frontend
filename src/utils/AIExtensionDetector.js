/**
 * AI Extension & Copilot Detection System
 * Detects and blocks AI tools during exam sessions
 */

class AIExtensionDetector {
  constructor(studentId, examId, options = {}) {
    this.studentId = studentId;
    this.examId = examId;
    this.aiExtensionEvents = [];
    this.strikeCount = 0;
    this.maxStrikes = options.maxStrikes || 3;
    this.onStrike = options.onStrike || (() => {});
    this.onLimitReached = options.onLimitReached || (() => {});
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
          timestamp: new Date().toISOString()
        });
        return false;
      }
    }, true);
  }

  /**
   * Detect clipboard access
   */
  detectClipboardAccess() {
    document.addEventListener('copy', () => {
      const selectedText = window.getSelection().toString();
      if (selectedText.length > 200) {
        this.logAIEvent('SUSPICIOUS_CLIPBOARD_COPY', {
          textLength: selectedText.length,
          timestamp: new Date().toISOString()
        });
      }
    });

    document.addEventListener('paste', () => {
      this.logAIEvent('CLIPBOARD_PASTE_ATTEMPT', {
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Detect AI extensions trying to interact with page
   */
  detectExtensionRequests() {
    const self = this;

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      const originalSendMessage = chrome.runtime.sendMessage;
      chrome.runtime.sendMessage = function (...args) {
        self.logAIEvent('EXTENSION_MESSAGE_ATTEMPT', {
          args: args,
          timestamp: new Date().toISOString()
        });
        console.warn('Extension communication blocked during exam');
        return null;
      };
    } else if (typeof browser !== 'undefined' && browser.runtime) {
      // Support for Firefox/other browsers using 'browser' namespace
      const originalSendMessage = browser.runtime.sendMessage;
      browser.runtime.sendMessage = function (...args) {
        self.logAIEvent('EXTENSION_MESSAGE_ATTEMPT', {
          args: args,
          timestamp: new Date().toISOString()
        });
        return null;
      };
    }

    window.addEventListener('message', (e) => {
      const data = e.data || {};
      const source = e.source || e.origin;
      
      const isAIExtension = 
        source?.includes('extension://') ||
        data.type?.includes('AI') ||
        data.source?.includes('copilot') ||
        data.source?.includes('chatgpt');

      if (isAIExtension) {
        self.logAIEvent('AI_EXTENSION_DETECTED', {
          source: source,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * Detect browser DevTools opening
   */
  detectBrowserDevTools() {
    setInterval(() => {
      const start = performance.now();
      debugger; 
      const end = performance.now();

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
    const self = this;

    window.fetch = function (...args) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
      
      if (self.isAIAPICall(url)) {
        self.logAIEvent('AI_API_REQUEST_BLOCKED', {
          url: url,
          timestamp: new Date().toISOString()
        });
        return Promise.reject(new Error('AI API calls not allowed during exam'));
      }

      return originalFetch.apply(this, args);
    };
  }

  isAIAPICall(url) {
    const aiAPIs = [
      'openai.com/api', 'api.openai.com', 'anthropic.com/api', 'api.anthropic.com',
      'google.com/generativeai', 'generativelanguage.googleapis.com', 'api.perplexity.ai',
      'api.cohere.com', 'api.deepseek.com',
    ];
    return aiAPIs.some(api => url.includes(api));
  }

  /**
   * Detect right-click context menu
   */
  detectContextMenu() {
    document.addEventListener('contextmenu', () => {
      setTimeout(() => {
        if (document.querySelector('[data-extension]')) {
          this.logAIEvent('EXTENSION_CONTEXT_MENU_DETECTED', {
            timestamp: new Date().toISOString()
          });
        }
      }, 100);
    });
  }

  /**
   * Monitor window focus/blur
   */
  monitorFocusChange() {
    window.addEventListener('blur', () => {
      // Only log blur if tab is still visible (to avoid double strike with visibilitychange)
      if (!document.hidden) {
        this.logAIEvent('WINDOW_BLUR', {
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * Log AI extension event to server and handle strikes
   */
  logAIEvent(eventType, data) {
    // Increment strikes for suspicious activity
    // We count window blur and AI detections as strikes
    this.strikeCount++;
    const strikesLeft = Math.max(0, this.maxStrikes - this.strikeCount);

    const event = {
      type: eventType,
      data: data,
      userAgent: navigator.userAgent,
      strikeCount: this.strikeCount,
      timestamp: new Date().toISOString()
    };

    console.warn(`[⚠️ STRIKE ${this.strikeCount}/${this.maxStrikes}] ${eventType}`, data);
    this.aiExtensionEvents.push(event);

    // Show warning with strikes left
    if (strikesLeft > 0) {
      this.showWarning(`⚠️ Warning: Suspicious activity detected! (${strikesLeft} strikes left before auto-submit)`);
      this.onStrike(this.strikeCount, strikesLeft);
    } else {
      this.showWarning('❌ LIMIT REACHED: Exam will be automatically submitted now!');
      this.onLimitReached();
    }

    // Send to server
    this.sendEventToServer(event);
  }

  /**
   * Send event to backend
   */
  async sendEventToServer(event) {
    try {
      const payload = {
        ...event,
        student_id: this.studentId,
        exam_id: this.examId
      };

      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/submissions/ai-detection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('[❌ AI EVENT ERROR]', error);
    }
  }

  /**
   * Show warning to student
   */
  showWarning(message) {
    // Remove existing warnings
    const existing = document.querySelectorAll('.ai-warning-toast');
    existing.forEach(e => e.remove());

    const warning = document.createElement('div');
    warning.className = 'ai-warning-toast';
    warning.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #f44336;
      color: white;
      padding: 30px 40px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 20px;
      z-index: 99999;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      text-align: center;
      border: 4px solid white;
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    `;
    
    // Add shake animation
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes shake {
        10%, 90% { transform: translate3d(-50%, -50%, 0) translate3d(-4px, 0, 0); }
        20%, 80% { transform: translate3d(-50%, -50%, 0) translate3d(8px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-50%, -50%, 0) translate3d(-10px, 0, 0); }
        40%, 60% { transform: translate3d(-50%, -50%, 0) translate3d(10px, 0, 0); }
      }
    `;
    document.head.appendChild(style);
    
    warning.textContent = message;
    document.body.appendChild(warning);

    setTimeout(() => warning.remove(), 6000);
  }

  getSummary() {
    return {
      totalAIEvents: this.aiExtensionEvents.length,
      strikeCount: this.strikeCount,
      events: this.aiExtensionEvents
    };
  }
}

export default AIExtensionDetector;
