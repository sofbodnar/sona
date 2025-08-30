# 🧠 Sona - AI-Powered Research Assistant

> **Launch Target:** October 31, 2024 | **Status:** In Development

Sona is an intelligent research assistant that integrates seamlessly into your browser, providing real-time content understanding, synthesis, and contextual analysis to enhance your research workflow.

## ✨ Key Features

### 🎯 Smart Text Analysis
- **Instant Explanations**: Highlight any text or math formula to get an "Ask Sona?" popup
- **Contextual Understanding**: AI-powered explanations tailored to your research context
- **Math Formula Support**: Advanced mathematical concept breakdown and analysis

### 📚 Research Session Management
- **Session Tracking**: Organize research by topics and maintain ongoing work
- **Auto-Documentation**: Automatic tracking of visited URLs and explored concepts
- **Export Summaries**: Generate comprehensive research reports with citations

### 🔍 Passive Content Monitoring
- **Background Analysis**: Monitors your reading without interrupting workflow
- **Cross-Tab Synthesis**: Connects insights from multiple open sources
- **Related Resource Discovery**: Suggests relevant papers, videos, and materials

## 🏗️ Project Structure

```
/Sona-Research-Assistant
├── /extension          # Chrome Extension
│   ├── manifest.json   # Extension configuration
│   ├── background.js   # Background service worker
│   ├── content.js      # Content script for page interaction
│   ├── popup.html      # Extension popup interface
│   └── popup.js        # Popup functionality
├── /server            # Flask Backend API
│   ├── app.py         # Main Flask application
│   ├── requirements.txt
│   └── .env.example   # Environment configuration
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Chrome Browser
- API keys (OpenAI or Claude)

### 1. Backend Setup
```bash
cd server
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python app.py
```

### 2. Chrome Extension Setup
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `/extension` folder
4. The Sona icon should appear in your toolbar

### 3. Usage
1. Start the Flask server (it runs on `localhost:5000`)
2. Browse any webpage
3. Highlight text you want to understand
4. Click "Ask Sona?" when it appears
5. View AI-powered explanations in the popup

## 💡 How It Works

1. **Text Selection**: When you highlight text, Sona's content script detects the selection
2. **Context Gathering**: The extension captures page context and selected text
3. **AI Processing**: Backend processes the request using AI APIs (OpenAI/Claude)
4. **Smart Response**: Returns contextual explanations with related resources
5. **Session Tracking**: Automatically logs concepts and URLs for later review

## 🛠️ Development Status

- [x] ✅ Project structure setup
- [x] ✅ Chrome extension foundation
- [x] ✅ Flask backend API framework
- [x] ✅ Basic text highlighting functionality
- [ ] 🔄 AI API integration (OpenAI/Claude)
- [ ] 🔄 Session management database
- [ ] 🔄 Export functionality
- [ ] 🔄 YouTube/Scholar search integration
- [ ] 🔄 Math formula parsing with MathJax

## 🎯 MVP Goals

Our Minimum Viable Product focuses on:
1. **Core Functionality**: Text highlighting → AI explanation popup
2. **Session Tracking**: Basic research session management
3. **Export Feature**: Simple session summary generation
4. **Chrome Extension**: Fully functional browser integration

## 🌟 Future Enhancements

- **Advanced Math Support**: LaTeX rendering and step-by-step solutions
- **Multi-source Integration**: Google Scholar, arXiv, PubMed connections
- **Collaborative Features**: Share sessions and insights with team members
- **Mobile Support**: Extend to mobile browsers and apps

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- 📧 Email: [Your Email]
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/sona/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/sona/discussions)

---

**Built with ❤️ for researchers, students, and lifelong learners**
