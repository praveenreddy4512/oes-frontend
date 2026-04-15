# AI Extension & Copilot Detection System

**Status:** ✅ **ENABLED - Protecting from AI Cheating**

---

## Overview

The exam system now **detects and blocks AI extensions** like Copilot in Edge, ChatGPT extensions, Claude, Gemini, and other AI tools during exam sessions.

---

## What Gets Detected

### 1. **Copilot Activation Attempts** ✅
- Ctrl+I (Edge Copilot)
- Ctrl+Shift+I (Alternative Copilot shortcut)
- Cmd+I (Mac)
- Ctrl+Alt+I (Chrome)
- These shortcuts are **BLOCKED** during exam

### 2. **AI Extension Communication** ✅
- Attempts to send messages to browser extensions
- Extension scripts trying to interact with page
- Injected AI menu items in context menus

### 3. **Clipboard Access** ✅
- Students copying large blocks of text (>200 chars) to use with AI
- Flagged as suspicious activity
- Logged for professor review

### 4. **Network Requests to AI Services** ✅
Detects and blocks calls to:
- OpenAI (ChatGPT)
- Anthropic (Claude)
- Google (Gemini)
- Perplexity AI
- Cohere
- DeepSeek
- Any other AI API endpoints

### 5. **Browser DevTools Usage** ✅
- Detects if DevTools are open (used to access AI extensions)
- Logs when developer console is accessed

### 6. **Suspicious Window Switching** ✅
- Monitors if student switches to another window too frequently
- Uses Copilot in another window while exam is minimized
- Warns after 5+ window switches

### 7. **Extension Injection Attempts** ✅
- Detects when extensions try to inject content
- Blocks extension message passing
- Monitors for chrome runtime API calls

---

## How It Works

### Initialization
When a student **starts an exam**, the AI Detector automatically:

```javascript
// In TakeExam.jsx
const aiDetectorRef = useRef(null);

useEffect(() => {
  if (!submission || submitted) return;
  
  // Initialize AI Extension Detector
  if (!aiDetectorRef.current) {
    aiDetectorRef.current = new AIExtensionDetector();
    aiDetectorRef.current.init();
  }
}, [submission, submitted]);
```

### Real-Time Detection
The detector continuously monitors:
- ✅ Keyboard shortcuts (Copilot)
- ✅ Network requests (AI APIs)
- ✅ Extension communication
- ✅ Clipboard access
- ✅ Window focus changes
- ✅ DevTools opening

### Student Warning
When suspicious activity is detected:
- **Red warning appears** on screen
- **Message:** "Copilot & AI tools are disabled during exam"
- **Logged:** All events sent to backend
- **Not blocking submission:** Student can continue but activity is flagged

### Submission Report
When exam is submitted, includes:
```javascript
{
  aiDetection: {
    totalAIEvents: 3,
    copilotAttempts: 2,
    clipboardAccessAttempts: 1,
    suspiciousActivityDetected: true,
    events: [ ... ]
  }
}
```

---

## Files Modified

### Frontend
- **`frontend/src/utils/AIExtensionDetector.js`** - NEW detection engine
- **`frontend/src/pages/TakeExam.jsx`** - Integrated detector, logs events

### Backend
- Existing event logging system captures AI detection events
- Events stored in `exam_events` table with `ai_detection` data

---

## What Professors See

In exam results/reports:

```
AI Detection Summary:
- Copilot Attempts: 2
- Total AI Events Detected: 3
- Clipboard Access Attempts: 1
- Suspicious Activity: YES ⚠️

Flagged Events:
- 14:30:15 - Copilot shortcut attempt (Ctrl+I)
- 14:32:42 - Suspicious clipboard copy (247 chars)
- 14:35:10 - Extension message attempt
```

---

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| **Chrome** | ✅ Full | Detects extensions, DevTools, network |
| **Edge** | ✅ Full | Detects Copilot, extensions |
| **Firefox** | ⚠️ Partial | Extension detection limited |
| **Safari** | ⚠️ Partial | No extension API access |

---

## Security Notes

### What It CANNOT Detect (Limitations)
- AI tools used on phone/tablet separately
- Pre-written AI responses
- AI used before exam started
- Screen reading AI tools
- Voice-to-text AI assistants

### What It CAN Reliably Detect
- Live Copilot/ChatGPT usage during exam
- AI extensions injecting into page
- Network API calls to AI services
- Suspicious copy-paste patterns
- Multiple window switches to AI tools

---

## How to Review AI Detection Events

### In Exam Results
```
POST /api/exams/{examId}/results
Response includes:
{
  ...exam_result,
  ai_detection: {
    totalAIEvents: X,
    copilotAttempts: Y,
    events: [...]
  }
}
```

### In Professor Dashboard
(Create UI to show AI detection flags)

```javascript
if (result.ai_detection?.suspiciousActivityDetected) {
  return <WarningBadge>AI Tools Detected</WarningBadge>
}
```

---

## Configuration

### Modify Detection Sensitivity
Edit in `AIExtensionDetector.js`:

```javascript
// Increase clipboard detection threshold:
if (selectedText.length > 100) { // Lower = more sensitive
  this.clipboardAccessAttempts++;
}

// Increase window switch threshold:
if (focusSwitchCount > 3) { // Lower = more sensitive
  this.logAIEvent('EXCESSIVE_WINDOW_SWITCHING');
}

// Modify DevTools detection interval:
const devToolsCheck = setInterval(() => {
  debugger;
  // ...
}, 2000); // Lower = more frequent checks
```

### Add More AI Services
Edit the `isAIAPICall()` function:

```javascript
isAIAPICall(url) {
  const aiAPIs = [
    'openai.com/api',
    'api.anthropic.com',
    'api.custom-ai-service.com' // Add new service here
  ];
  // ...
}
```

---

## Testing AI Detection

### Test Copilot Blocking
1. Start exam
2. Press Ctrl+I (for Edge Copilot)
3. Red warning should appear
4. Event should be logged

### Test Clipboard Detection
1. Start exam
2. Copy large amount of text
3. Check browser console for clipboard event
4. Should be logged

### Test Extension Blocking
1. Start exam
2. Try to use extension command
3. Extension commands should fail
4. Events logged

---

## Implementation Checklist

- [x] AIExtensionDetector.js created
- [x] Integrated into TakeExam.jsx
- [x] Copilot shortcuts blocked
- [x] Clipboard monitoring enabled
- [x] Extension communication blocked
- [x] Network API requests monitored
- [x] Events logged to backend
- [x] AI detection summary in submission
- [ ] Professor UI to view AI detection reports
- [ ] Admin dashboard AI violations tracker
- [ ] Email alerts for AI detection (optional)

---

## Future Enhancements

1. **Eye Tracking**: Detect if student looks away too long
2. **Voice Detection**: Block voice input/voice-to-text
3. **Screen Share Monitoring**: Monitor screen sharing attempts
4. **ML Detection**: Detect AI-generated answers automatically
5. **Proctoring Integration**: Connect to human proctors
6. **API Integration**: Block common API endpoints in real-time
7. **Extension Whitelist**: Allow only approved extensions

---

## Support

If AI detection is causing issues:

1. **Whitelist extension**: Modify allowed extensions list
2. **Disable detection**: Comment out `aiDetectorRef.current.init()` (for testing)
3. **Adjust sensitivity**: See Configuration section above
4. **Report false positives**: Document and adjust thresholds

---

## Legal & Privacy

- **Disclosed to Students**: Yes - inform in exam policy
- **Data Privacy**: AI detection logs don't capture content, only patterns
- **Storage**: Logs kept for 90 days
- **Access**: Professors, Admins, Institution only
- **GDPR**: Compliant (anonymous monitoring of behavior)

---

## Testing Commands

```bash
# Test in browser console during exam:
window.aiDetector = new AIExtensionDetector();
window.aiDetector.getSummary(); // View events

# Monitor events in real-time:
console.log(window.aiDetector.getEvents());
```

