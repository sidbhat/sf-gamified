/**
 * JouleResponseParser - Intelligent parsing of SAP Joule responses
 * Detects response types (list, card, markdown, error, timeout) and extracts meaningful data
 */
class JouleResponseParser {
  constructor() {
    this.logger = {
      info: (msg, data) => console.log(`[ResponseParser] ${msg}`, data || ''),
      success: (msg) => console.log(`[ResponseParser] ✅ ${msg}`),
      error: (msg, err) => console.error(`[ResponseParser] ❌ ${msg}`, err || ''),
      warn: (msg) => console.warn(`[ResponseParser] ⚠️ ${msg}`)
    };
  }

  /**
   * Parse Joule response from iframe content
   * @param {HTMLElement} messageContainer - Message container element
   * @param {string} rawText - Raw text content (fallback)
   * @returns {Object} Parsed response with type, content, and metadata
   */
  parseResponse(messageContainer, rawText = '') {
    this.logger.info('Parsing Joule response');

    // Detect response type
    const responseType = this.detectResponseType(messageContainer, rawText);
    this.logger.info(`Detected response type: ${responseType}`);

    // Parse based on type
    let parsedData = {};
    switch (responseType) {
      case 'list':
        parsedData = this.parseListResponse(messageContainer);
        break;
      case 'card':
        parsedData = this.parseCardResponse(messageContainer);
        break;
      case 'markdown':
        parsedData = this.parseMarkdownResponse(messageContainer);
        break;
      case 'error':
        parsedData = this.parseErrorResponse(messageContainer, rawText);
        break;
      case 'empty':
        parsedData = this.parseEmptyResponse(messageContainer, rawText);
        break;
      case 'timeout':
        parsedData = { message: 'Response timeout', details: 'No response received within expected timeframe' };
        break;
      default:
        parsedData = { message: rawText || 'Unknown response format' };
    }

    return {
      type: responseType,
      success: responseType !== 'error' && responseType !== 'empty' && responseType !== 'timeout',
      raw: rawText,
      parsed: parsedData,
      timestamp: Date.now()
    };
  }

  /**
   * Detect response type from DOM structure
   * @param {HTMLElement} container - Message container
   * @param {string} text - Raw text content
   * @returns {string} Response type
   */
  detectResponseType(container, text = '') {
    if (!container) {
      return 'timeout';
    }

    const lowerText = text.toLowerCase();

    // Check for explicit error phrases first
    if (this.isErrorResponse(container, lowerText)) {
      return 'error';
    }

    // Check for empty/no data responses
    if (this.isEmptyResponse(container, lowerText)) {
      return 'empty';
    }

    // Check for list responses (UI5 lists)
    if (this.isListResponse(container)) {
      return 'list';
    }

    // Check for card responses
    if (this.isCardResponse(container)) {
      return 'card';
    }

    // Check for markdown/text responses
    if (this.isMarkdownResponse(container)) {
      return 'markdown';
    }

    // Default to markdown if text exists
    return text ? 'markdown' : 'timeout';
  }

  /**
   * Check if response is a list
   * @param {HTMLElement} container - Message container
   * @returns {boolean}
   */
  isListResponse(container) {
    const lists = container.querySelectorAll('ui5-list, [class*="ui5-list"]');
    const listItems = container.querySelectorAll('ui5-li-custom, [class*="dasCardList"]');
    return lists.length > 0 || listItems.length > 2; // Multiple list items indicate a list
  }

  /**
   * Check if response is a card
   * @param {HTMLElement} container - Message container
   * @returns {boolean}
   */
  isCardResponse(container) {
    const cards = container.querySelectorAll('[class*="dasCardHeader"], [role="group"][aria-roledescription="Card"]');
    return cards.length > 0;
  }

  /**
   * Check if response is markdown/text
   * @param {HTMLElement} container - Message container
   * @returns {boolean}
   */
  isMarkdownResponse(container) {
    const markdown = container.querySelectorAll('.dasMarkdown, [class*="dasText"]');
    return markdown.length > 0;
  }

  /**
   * Check if response indicates an error
   * @param {HTMLElement} container - Message container
   * @param {string} text - Lowercase text
   * @returns {boolean}
   */
  isErrorResponse(container, text = '') {
    // Error phrases that indicate Joule cannot complete the request
    const errorPhrases = [
      "i'm sorry",
      "i am sorry",
      "unclear",
      "can't",
      "cannot",
      "don't have",
      "do not have",
      "not available",
      "could not",
      "unable to",
      "not sure",
      "clarify",
      "specify",
      "which one",
      "more information"
    ];

    return errorPhrases.some(phrase => text.includes(phrase));
  }

  /**
   * Check if response indicates empty/no data
   * @param {HTMLElement} container - Message container
   * @param {string} text - Lowercase text
   * @returns {boolean}
   */
  isEmptyResponse(container, text = '') {
    const emptyPhrases = [
      "no relevant information",
      "looks like there's no",
      "no results",
      "nothing found",
      "no data",
      "don't have any",
      "do not have any"
    ];

    return emptyPhrases.some(phrase => text.includes(phrase));
  }

  /**
   * Parse list response
   * @param {HTMLElement} container - Message container
   * @returns {Object} Parsed list data
   */
  parseListResponse(container) {
    const lists = container.querySelectorAll('ui5-list, [class*="ui5-list"]');
    const listItems = container.querySelectorAll('ui5-li-custom, [class*="dasCardList"]');
    
    // Extract list header/title
    const headerTitle = container.querySelector('[class*="dasCardTitle"]');
    const title = headerTitle ? headerTitle.textContent.trim() : 'List';

    // Extract item count from header (e.g., "6 of 1354")
    const countElement = container.querySelector('[class*="dasCardStatus"]');
    const countText = countElement ? countElement.textContent.trim() : '';
    const countMatch = countText.match(/(\d+)\s+of\s+(\d+)/i);
    
    const showing = countMatch ? parseInt(countMatch[1]) : listItems.length;
    const total = countMatch ? parseInt(countMatch[2]) : listItems.length;

    // Extract button text from items
    const buttons = [];
    container.querySelectorAll('ui5-button, button').forEach(btn => {
      const text = btn.textContent.trim();
      if (text && !buttons.includes(text)) {
        buttons.push(text);
      }
    });

    return {
      title,
      itemCount: showing,
      totalCount: total,
      hasMore: total > showing,
      buttons,
      message: `Found ${showing} of ${total} items`
    };
  }

  /**
   * Parse card response
   * @param {HTMLElement} container - Message container
   * @returns {Object} Parsed card data
   */
  parseCardResponse(container) {
    const cards = container.querySelectorAll('[role="group"][aria-roledescription="Card"]');
    
    const cardData = Array.from(cards).map(card => {
      const title = card.querySelector('[class*="dasCardTitle"]')?.textContent.trim() || '';
      const subtitle = card.querySelector('[class*="dasCardSubtitle"]')?.textContent.trim() || '';
      const buttons = Array.from(card.querySelectorAll('ui5-button, button')).map(btn => 
        btn.textContent.trim()
      );
      
      return { title, subtitle, buttons };
    });

    return {
      cardCount: cards.length,
      cards: cardData,
      message: `Found ${cards.length} card${cards.length !== 1 ? 's' : ''}`
    };
  }

  /**
   * Parse markdown/text response
   * @param {HTMLElement} container - Message container
   * @returns {Object} Parsed markdown data
   */
  parseMarkdownResponse(container) {
    const markdown = container.querySelector('.dasMarkdown, [class*="dasBotReplyMessage"]');
    const text = markdown ? markdown.textContent.trim() : container.textContent.trim();

    return {
      text,
      formatted: text,
      message: text.substring(0, 100) + (text.length > 100 ? '...' : '')
    };
  }

  /**
   * Parse error response
   * @param {HTMLElement} container - Message container
   * @param {string} rawText - Raw text
   * @returns {Object} Parsed error data
   */
  parseErrorResponse(container, rawText = '') {
    const text = rawText || container.textContent.trim();
    
    // Classify error type
    let errorType = 'GENERIC_ERROR';
    let userMessage = text;
    
    if (text.toLowerCase().includes("i'm sorry") || text.toLowerCase().includes("unclear")) {
      errorType = 'CLARIFICATION_NEEDED';
      userMessage = 'Joule needs more information. Please try rephrasing your question.';
    } else if (text.toLowerCase().includes("don't have") || text.toLowerCase().includes("not available")) {
      errorType = 'DATA_NOT_AVAILABLE';
      userMessage = 'This information is not available in your system.';
    } else if (text.toLowerCase().includes("specify") || text.toLowerCase().includes("which one")) {
      errorType = 'AMBIGUOUS_REQUEST';
      userMessage = 'Joule needs you to be more specific.';
    }

    return {
      errorType,
      originalMessage: text,
      userFriendlyMessage: userMessage,
      message: userMessage
    };
  }

  /**
   * Parse empty response
   * @param {HTMLElement} container - Message container
   * @param {string} rawText - Raw text
   * @returns {Object} Parsed empty data
   */
  parseEmptyResponse(container, rawText = '') {
    const text = rawText || container.textContent.trim();
    
    return {
      message: 'No data found',
      userFriendlyMessage: 'Joule could not find any matching information.',
      originalMessage: text
    };
  }

  /**
   * Format parsed response for display in overlay
   * @param {Object} parsedResponse - Parsed response object
   * @returns {string} HTML formatted response
   */
  formatForDisplay(parsedResponse) {
    if (!parsedResponse || !parsedResponse.parsed) {
      return '<p>No response data</p>';
    }

    const { type, parsed } = parsedResponse;

    switch (type) {
      case 'list':
        return `
          <div class="response-list">
            <strong>${parsed.title}</strong>
            <div class="response-meta">
              📋 ${parsed.itemCount} items shown
              ${parsed.hasMore ? `<span>(${parsed.totalCount} total)</span>` : ''}
            </div>
            ${parsed.buttons.length > 0 ? `
              <div class="response-actions">
                Actions: ${parsed.buttons.join(', ')}
              </div>
            ` : ''}
          </div>
        `;

      case 'card':
        return `
          <div class="response-cards">
            <strong>Found ${parsed.cardCount} result${parsed.cardCount !== 1 ? 's' : ''}</strong>
            ${parsed.cards.slice(0, 2).map(card => `
              <div class="response-card-item">
                <div>${card.title}</div>
                ${card.subtitle ? `<small>${card.subtitle}</small>` : ''}
              </div>
            `).join('')}
          </div>
        `;

      case 'markdown':
        return `<p>${parsed.text}</p>`;

      case 'error':
        return `<p class="response-error">⚠️ ${parsed.userFriendlyMessage}</p>`;

      case 'empty':
        return `<p class="response-empty">📭 ${parsed.userFriendlyMessage}</p>`;

      case 'timeout':
        return `<p class="response-timeout">⏱️ Response took too long</p>`;

      default:
        return `<p>${parsed.message || 'Unknown response'}</p>`;
    }
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.JouleResponseParser = JouleResponseParser;
}
