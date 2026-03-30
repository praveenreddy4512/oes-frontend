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
    this.injectStyles();
    this.disableBrowserShortcuts();
  }

  /**
   * Inject professional CSS for warnings
   */
  injectStyles() {
    if (document.getElementById('ai-detector-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ai-detector-styles';
    style.innerHTML = `
      @keyframes ai-shake {
        0%, 100% { transform: translate(-50%, -50%); }
        10%, 30%, 50%, 70%, 90% { transform: translate(-52%, -50%); }
        20%, 40%, 60%, 80% { transform: translate(-48%, -50%); }
      }

      @keyframes ai-fade-in {
        from { opacity: 0; transform: translate(-50%, -60%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }

      .ai-warning-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
        z-index: 99998;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: ai-fade-in 0.3s ease-out;
      }

      .ai-warning-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        width: 90%;
        max-width: 450px;
        border-radius: 24px;
        padding: 40px;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        z-index: 99999;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        border: 1px solid rgba(0, 0, 0, 0.05);
        animation: ai-shake 0.5s ease-in-out;
      }

      .ai-icon-container {
        width: 80px;
        height: 80px;
        background: #FEF2F2;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto 24px;
        color: #EF4444;
      }

      .ai-warning-title {
        color: #111827;
        font-size: 24px;
        font-weight: 800;
        margin-bottom: 12px;
        letter-spacing: -0.025em;
      }

      .ai-warning-text {
        color: #4B5563;
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 30px;
      }

      .ai-strikes-container {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-top: 20px;
      }

      .ai-strike-dot {
        width: 48px;
        height: 8px;
        border-radius: 4px;
        background: #E5E7EB;
        transition: all 0.3s ease;
      }

      .ai-strike-dot.active {
        background: #EF4444;
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
      }

      .ai-warning-footer {
        margin-top: 32px;
        font-size: 13px;
        color: #9CA3AF;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      /* Disable text selection */
      body.exam-session {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('exam-session');
  }

  /**
   * Disable common cheating shortcuts
   */
  disableBrowserShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Disable Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+P, Ctrl+S
      const isCheatingShortcut = (e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'p', 's'].includes(e.key.toLowerCase());
      
      if (isCheatingShortcut) {
        e.preventDefault();
        e.stopPropagation();
        this.showWarningToast('⛔ Typing shortcuts are disabled during the exam.');
      }
    }, true);
  }

  detectCopilotShortcuts() {
    document.addEventListener('keydown', (e) => {
      const isCopilotShortcut = 
        (e.ctrlKey || e.metaKey) && e.key === 'i' ||
        (e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'i' ||
        (e.ctrlKey || e.metaKey) && e.key === '?' ||
        (e.ctrlKey || e.metaKey) && e.altKey && e.key === 'i';

      if (isCopilotShortcut) {
        e.preventDefault();
        this.logAIEvent('COPILOT_SHORTCUT_ATTEMPT', { key: e.key });
      }
    }, true);
  }

  detectClipboardAccess() {
    // ⛔ DISABLE COPY
    document.addEventListener('copy', (e) => {
      e.preventDefault();
      this.showWarningToast('⛔ Copying is disabled during the exam.');
      this.logAIEvent('CLIPBOARD_COPY_ATTEMPT');
    }, true);

    // ⛔ DISABLE PASTE
    document.addEventListener('paste', (e) => {
      e.preventDefault();
      this.showWarningToast('⛔ Pasting is disabled during the exam.');
      this.logAIEvent('CLIPBOARD_PASTE_ATTEMPT');
    }, true);

    // ⛔ DISABLE CUT
    document.addEventListener('cut', (e) => {
      e.preventDefault();
      this.logAIEvent('CLIPBOARD_CUT_ATTEMPT');
    }, true);
  }

  detectExtensionRequests() {
    const self = this;
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage = function (...args) {
        self.logAIEvent('EXTENSION_MESSAGE_ATTEMPT');
        return null;
      };
    } else if (typeof browser !== 'undefined' && browser.runtime) {
      browser.runtime.sendMessage = function (...args) {
        self.logAIEvent('EXTENSION_MESSAGE_ATTEMPT');
        return null;
      };
    }
  }

  detectBrowserDevTools() {
    setInterval(() => {
      const start = performance.now();
      debugger; 
      if (performance.now() - start > 100) this.logAIEvent('DEVTOOLS_DETECTED');
    }, 2000);
  }

  detectSuspiciousNetwork() {
    const originalFetch = window.fetch;
    const self = this;
    window.fetch = function (...args) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
      if (self.isAIAPICall(url)) {
        self.logAIEvent('AI_API_REQUEST_BLOCKED');
        return Promise.reject(new Error('Blocked'));
      }
      return originalFetch.apply(this, args);
    };
  }

  isAIAPICall(url) {
    return ['openai.com', 'anthropic.com', 'gemini.google.com'].some(api => url.includes(api));
  }

  detectContextMenu() {
    // ⛔ DISABLE RIGHT CLICK
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showWarningToast('⛔ Right-click is disabled.');
      
      setTimeout(() => {
        if (document.querySelector('[data-extension]')) this.logAIEvent('EXTENSION_CONTEXT_MENU');
      }, 100);
    }, true);
  }

  monitorFocusChange() {
    window.addEventListener('blur', () => {
      if (!document.hidden) this.logAIEvent('WINDOW_BLUR');
    });
  }

  /**
   * Log strike and show the professional modal
   */
  logAIEvent(eventType, data) {
    this.strikeCount++;
    const strikesLeft = Math.max(0, this.maxStrikes - this.strikeCount);

    const event = {
      type: eventType,
      data,
      strikeCount: this.strikeCount,
      timestamp: new Date().toISOString()
    };

    this.aiExtensionEvents.push(event);
    console.warn(`[⚠️ STRIKE ${this.strikeCount}/${this.maxStrikes}] ${eventType}`);

    if (this.strikeCount >= this.maxStrikes) {
      this.showProfessionalModal('Academic Integrity Violation', 'Maximum limit of suspicious activities reached. The exam is being submitted automatically.', true);
      this.onLimitReached();
    } else {
      this.showProfessionalModal('Suspicious Activity Detected', `System has detected actions that violate academic integrity. Please maintain focus on the exam.`, false);
      this.onStrike(this.strikeCount, strikesLeft);
    }

    this.sendEventToServer(event);
  }

  async sendEventToServer(event) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/submissions/ai-detection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...event, student_id: this.studentId, exam_id: this.examId })
      });
    } catch (e) {}
  }

  /**
   * Show a high-end professional modal
   */
  showProfessionalModal(title, text, isCritical) {
    // Clear existing
    document.querySelectorAll('.ai-warning-overlay').forEach(e => e.remove());

    const overlay = document.createElement('div');
    overlay.className = 'ai-warning-overlay';

    const modal = document.createElement('div');
    modal.className = 'ai-warning-modal';
    
    const icon = isCritical ? '🚫' : '⚠️';
    const strikesLeft = this.maxStrikes - this.strikeCount;

    modal.innerHTML = `
      <div class="ai-icon-container" style="${isCritical ? 'background: #FEE2E2; color: #B91C1C;' : ''}">
        <span style="font-size: 40px;">${icon}</span>
      </div>
      <h2 class="ai-warning-title">${title}</h2>
      <p class="ai-warning-text">${text}</p>
      
      ${!isCritical ? `
        <div class="ai-strikes-container">
          ${Array.from({ length: this.maxStrikes }).map((_, i) => `
            <div class="ai-strike-dot ${i < this.strikeCount ? 'active' : ''}"></div>
          `).join('')}
        </div>
        <div class="ai-warning-footer">${strikesLeft} strikes remaining</div>
      ` : `
        <div class="ai-warning-footer" style="color: #B91C1C;">AUTO-SUBMITTING NOW...</div>
      `}
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Auto close only if not critical
    if (!isCritical) {
      setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s ease';
        setTimeout(() => overlay.remove(), 500);
      }, 5000);
    }
  }

  /**
   * Show a smaller, non-strike toast for blocked actions
   */
  showWarningToast(message) {
    // Check if a toast is already there
    if (document.querySelector('.ai-toast-small')) return;

    const toast = document.createElement('div');
    toast.className = 'ai-toast-small';
    toast.style.cssText = `
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: #111827;
      color: white;
      padding: 12px 24px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 500;
      z-index: 999999;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  getSummary() {
    return { totalAIEvents: this.aiExtensionEvents.length, strikeCount: this.strikeCount, events: this.aiExtensionEvents };
  }
}

export default AIExtensionDetector;
