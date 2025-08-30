from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import re
import arxiv
import requests

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for Chrome extension

# Configuration
API_KEY = os.getenv('OPENAI_API_KEY') or os.getenv('CLAUDE_API_KEY')
if not API_KEY:
    print("Warning: No API key found. Set OPENAI_API_KEY or CLAUDE_API_KEY environment variable.")

@app.route('/api/explain', methods=['POST'])
def explain_concept():
    """
    Explain a highlighted text or concept using AI
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        context = data.get('context', {})
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # For now, return a mock explanation
        # TODO: Integrate with Claude API or OpenAI API
        explanation = generate_explanation(text, context)
        
        return jsonify({
            'explanation': explanation,
            'success': True,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/session', methods=['POST'])
def create_session():
    """
    Create a new research session
    """
    try:
        data = request.get_json()
        session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        session_data = {
            'id': session_id,
            'timestamp': datetime.now().isoformat(),
            'concepts': [],
            'urls': [],
            'title': data.get('title', 'Research Session')
        }
        
        # TODO: Store in database instead of returning
        return jsonify({
            'session': session_data,
            'success': True
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/session/<session_id>/export', methods=['GET'])
def export_session(session_id):
    """
    Export a research session as a formatted document
    """
    try:
        # TODO: Fetch session data from database
        # For now, return a mock export
        export_data = {
            'session_id': session_id,
            'title': f'Research Session Export - {datetime.now().strftime("%Y-%m-%d")}',
            'summary': 'This is a mock export. In the full version, this will contain all your research concepts, visited URLs, and insights.',
            'concepts_explored': [],
            'urls_visited': [],
            'export_timestamp': datetime.now().isoformat()
        }
        
        return jsonify({
            'export': export_data,
            'success': True
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/search', methods=['POST'])
def search_related():
    """
    Search for related content based on a concept
    """
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'No query provided'}), 400
        
        # Search arXiv for academic papers
        papers = search_arxiv_papers(query)
        
        # Search YouTube for educational videos
        videos = search_youtube_videos(query)
        
        results = {
            'papers': papers,
            'videos': videos,
            'query': query
        }
        
        return jsonify({
            'results': results,
            'success': True
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

def search_arxiv_papers(query, max_results=5):
    """
    Search arXiv for academic papers related to the query
    """
    try:
        search = arxiv.Search(
            query=query,
            max_results=max_results,
            sort_by=arxiv.SortCriterion.Relevance
        )
        
        papers = []
        for result in search.results():
            papers.append({
                'title': result.title,
                'authors': [author.name for author in result.authors],
                'summary': result.summary[:300] + "..." if len(result.summary) > 300 else result.summary,
                'url': result.entry_id,
                'pdf_url': result.pdf_url,
                'published': result.published.isoformat() if result.published else None,
                'categories': result.categories
            })
        
        return papers
        
    except Exception as e:
        print(f"arXiv search error: {e}")
        return []

def search_youtube_videos(query):
    """
    Search YouTube for educational videos related to the query
    """
    youtube_api_key = os.getenv('YOUTUBE_API_KEY')
    
    if not youtube_api_key:
        # Return mock data if no API key is provided
        return [
            {'title': f'{query} - Educational Video', 'url': f'https://youtube.com/search?q={query.replace(" ", "+")}+tutorial'},
            {'title': f'Introduction to {query}', 'url': f'https://youtube.com/search?q={query.replace(" ", "+")}+introduction'}
        ]
    
    try:
        # YouTube Data API v3 search
        search_url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'snippet',
            'q': f'{query} tutorial explanation',
            'type': 'video',
            'key': youtube_api_key,
            'maxResults': 5,
            'order': 'relevance'
        }
        
        response = requests.get(search_url, params=params)
        data = response.json()
        
        videos = []
        if 'items' in data:
            for item in data['items']:
                videos.append({
                    'title': item['snippet']['title'],
                    'description': item['snippet']['description'][:200] + "..." if len(item['snippet']['description']) > 200 else item['snippet']['description'],
                    'url': f"https://youtube.com/watch?v={item['id']['videoId']}",
                    'thumbnail': item['snippet']['thumbnails']['default']['url'],
                    'channel': item['snippet']['channelTitle'],
                    'published': item['snippet']['publishedAt']
                })
        
        return videos
        
    except Exception as e:
        print(f"YouTube search error: {e}")
        # Return search link as fallback
        return [{'title': f'Search YouTube for "{query}"', 'url': f'https://youtube.com/search?q={query.replace(" ", "+")}'}]

def generate_explanation(text, context):
    """
    Generate an explanation for the given text
    TODO: Replace with actual AI API calls
    """
    # Mock explanations for common terms and patterns
    text_lower = text.lower()
    
    # Check for math formulas
    if re.search(r'[a-z]\s*[=+\-*/]\s*[a-z0-9]', text_lower) or '=' in text:
        return f"<strong>{text}</strong> appears to be a mathematical formula or equation. In mathematics, equations like this express relationships between variables and constants. The '=' sign indicates equality, meaning both sides have the same value."
    
    # Check for common academic terms
    academic_terms = {
        'machine learning': 'Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task.',
        'neural network': 'A neural network is a computing system inspired by biological neural networks. It consists of interconnected nodes (neurons) that process information and can learn patterns from data.',
        'quantum computing': 'Quantum computing uses quantum mechanical phenomena like superposition and entanglement to perform calculations that would be impossible or extremely slow for classical computers.',
        'blockchain': 'Blockchain is a distributed ledger technology that maintains a continuously growing list of records (blocks) that are linked and secured using cryptography.'
    }
    
    for term, explanation in academic_terms.items():
        if term in text_lower:
            return explanation
    
    # Default explanation
    page_context = context.get('domain', 'this webpage')
    return f"<strong>{text}</strong> is a concept mentioned on {page_context}. This appears to be an important term in your current research. For a more detailed explanation, consider searching academic databases or educational videos about this topic."

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'service': 'Sona Research Assistant API',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"🧠 Sona Research Assistant API starting on port {port}")
    print("💡 Make sure to set your API keys in environment variables:")
    print("   - OPENAI_API_KEY or CLAUDE_API_KEY")
    
    app.run(host='0.0.0.0', port=port, debug=debug)