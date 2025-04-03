class GuiltyGame {
  constructor() {
    this.maxAttempts = 6;
    this.currentAttempt = 0;
    this.wordOfTheDay = '';
    this.themeDescription = '';
    this.embeddings = {};
    this.playerScores = [];
    this.gameOver = false;
    this.gameWon = false;
    this.bestScore = 0;
    this.bestScoreIndex = -1;
    this.helpVisible = true;
    this.showResults = false;
    this.inputDisabled = false;
    this.usedWords = new Set();
    this.message = '';
    this.highlightingBest = false;
    
    this.gameContainer = document.querySelector('.game-container');
    
    this.init();
  }
  
  async init() {
    await this.loadGameData();
    
    this.updatePageDescription();
    this.renderGame();
    this.setupEventListeners();
  }
  
  async loadGameData() {
    try {
      const cacheBuster = new Date().getTime();
      const response = await fetch(`/playgrounds/guilty/data/embeddings.json?_=${cacheBuster}`);
      
      if (!response.ok) {
        console.warn('Could not load daily data, using fallback');
        this.loadFallbackData();
        return;
      }
      
      const data = await response.json();
      const todayData = data.find(item => item.date === this.getFormattedDate());
      this.wordOfTheDay = todayData.wordOfTheDay;
      this.themeDescription = todayData.themeDescription;
      this.embeddings = todayData.embeddings;
    } catch (error) {
      console.error('Error loading game data:', error);
      this.loadFallbackData();
    }
  }
  
  loadFallbackData() {
    this.wordOfTheDay = 'music';
    this.themeDescription = 'Something you can feel but can\'t touch.';
    
    this.embeddings = {
      'song': 0.85,
      'band': 0.82,
      'concert': 0.78,
      'rhythm': 0.76,
      'guitar': 0.75,
      'piano': 0.73,
      'melody': 0.72,
      'singer': 0.70,
      'dance': 0.68,
      'sound': 0.65,
      'album': 0.63,
      'instrument': 0.62,
      'orchestra': 0.61,
      'symphony': 0.60,
      'jazz': 0.59,
      'rock': 0.58,
      'pop': 0.57,
      'classical': 0.56,
      'composer': 0.55,
      'lyrics': 0.54,
      'note': 0.53,
      'tune': 0.52,
      'beat': 0.51,
      'chord': 0.50,
      'performance': 0.49,
      'musician': 0.48,
      'festival': 0.47,
      'radio': 0.46,
      'audio': 0.45,
      'vinyl': 0.44,
      'playlist': 0.43,
      'recording': 0.42,
      'headphones': 0.41,
      'speaker': 0.40,
      'entertainment': 0.38,
      'art': 0.37,
      'culture': 0.36,
      'harmony': 0.35,
      'voice': 0.34,
      'acoustic': 0.33,
      'electric': 0.32,
      'bass': 0.31,
      'drums': 0.30,
      'violin': 0.29,
      'cello': 0.28,
      'flute': 0.27,
      'trumpet': 0.26,
      'saxophone': 0.25,
      'music': 1.0
    };
  }
  
  getFormattedDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  
  updatePageDescription() {
    const descriptionElement = document.querySelector('.post-description');
    if (descriptionElement) {
      descriptionElement.innerHTML = `Today's theme: ${this.themeDescription}`;
    }
  }
  
  renderGame() {
    this.gameContainer.innerHTML = `
      <div class="guilty-game">
        <div class="guilty-game-board">
          ${!this.gameOver ? `
          <div class="guilty-input-area">
            <input type="text" class="guilty-word-input" placeholder="Enter a word">
            <button class="guilty-submit-btn">Guess</button>
          </div>
          
          ${this.message ? `<div class="guilty-inline-message">
            <svg class="guilty-message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0.88 14 12.25">
              <path d="M7 .875c.388 0 .746.205.943.541l5.906 10.063a1.096 1.096 0 0 1-.943 1.646H1.094c-.391 0-.755-.211-.949-.55s-.191-.76.005-1.096L6.056 1.416c.198-.336.556-.541.944-.541m0 3.5a.654.654 0 0 0-.656.656v3.063a.655.655 0 1 0 1.312 0V5.031A.654.654 0 0 0 7 4.375m.875 6.125a.875.875 0 1 0-1.75 0 .875.875 0 1 0 1.75 0"></path>
            </svg>
            <span class="guilty-message-text">${this.message}</span>
          </div>` : ''}
          
          <div class="guilty-help-container ${this.currentAttempt > 0 ? 'guilty-help-collapsed' : ''}">
            <button class="guilty-help-toggle ${this.currentAttempt === 0 ? 'guilty-help-toggle-disabled' : ''}">
              <span class="guilty-help-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3l58.3 0c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24l0-13.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1l-58.3 0c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>
              </span>
              <span class="guilty-help-text">How to play?</span>
            </button>

            <div class="guilty-instructions">
              <p style="margin-bottom: 0 !important;">Find the hidden word of the day in 6 guesses. Each guess shows how guilty (close) it is to the hidden word. The higher your score, the closer you are. Use the daily theme as your guide, but don't stray too far!</p>
            </div>
          </div>
          ` : ''}
          
          <div class="guilty-attempts ${this.currentAttempt === 0 ? 'guilty-attempts-empty' : ''}">
            ${this.renderAttemptRows()}
          </div>
        </div>
        
        ${this.gameOver && this.showResults ? `
        <div class="guilty-results">
          <p class="guilty-results-title">Results • Guilty by Association</p>
          <p>${this.gameWon 
            ? `Congratulations! The word of the day is "${this.wordOfTheDay}"!` 
            : `Better luck tomorrow!`}</p>
          <div class="guilty-score-display">
            ${this.renderScoreDisplay()}
          </div>
          <div class="guilty-share-container">
            <button class="guilty-share-btn">
              <svg class="guilty-share-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0.87 14 12.25">
                <path d="M8.395.952a.88.88 0 0 0-.52.798V3.5H4.813A4.813 4.813 0 0 0 0 8.313a5.36 5.36 0 0 0 2.74 4.761.45.45 0 0 0 .221.052.54.54 0 0 0 .539-.539c0-.205-.118-.394-.268-.533-.257-.243-.607-.722-.607-1.553A2.626 2.626 0 0 1 5.25 7.876h2.625v1.75c0 .345.202.659.52.798s.684.082.941-.148l4.375-3.938c.183-.167.29-.402.29-.651s-.104-.484-.29-.651L9.336 1.098A.87.87 0 0 0 8.395.95"></path>
              </svg>
              Share your score: ${this.bestScore}
            </button>
          </div>
          <p class="guilty-results-footer">Made with ♥︎ for my wife, who lives in a small town in Kerala, but starts her day by opening The New York Times—to play word games.</p>
        </div>
        ` : ''}
      </div>
    `;
    
    this.setupEventListeners();
    
    if (this.gameOver && this.showResults) {
      const resultsElement = document.querySelector('.guilty-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
  
  renderAttemptRows() {
    let rows = '';
    for (let i = 0; i < this.currentAttempt; i++) {
      const attempt = this.playerScores[i] || null;
      const isLatest = i === this.currentAttempt - 1;
      const isBest = i === this.bestScoreIndex;
      
      // Separate logic for correct words vs best score
      // 1. For correct words: always show as best when in results view
      // 2. For best non-correct score: only show when highlighting
      const isCorrect = attempt && attempt.isCorrect;
      const showAsBest = (isCorrect && this.showResults) || 
                         (isBest && this.gameOver && !this.gameWon && this.highlightingBest);
      
      if (attempt) {
        rows += `
          <div class="guilty-attempt-row ${isLatest && !this.showResults ? 'guilty-latest-attempt' : ''} ${showAsBest ? 'guilty-best-attempt' : ''}">
            <div class="guilty-attempt-number">${i + 1}</div>
            <div class="guilty-attempt-word">${attempt.word}</div>
            <div class="guilty-attempt-score ${attempt ? 'guilty-score-revealed' : ''}" data-score="${attempt.score}">
              ${this.formatScoreDisplay(attempt.score)}
            </div>
          </div>
        `;
      }
    }
    return rows;
  }
  
  formatScore(score) {
    return score === 1 ? '1' : score.toFixed(2);
  }
  
  // Format score for display - special case for perfect score
  formatScoreDisplay(score, isAnimating = false) {
    if (score === 1 && !isAnimating) {
      return '1';
    }
    return score === 1 ? '1.000' : score.toFixed(2);
  }
  
  setupEventListeners() {
    const submitBtn = document.querySelector('.guilty-submit-btn');
    const wordInput = document.querySelector('.guilty-word-input');
    const shareBtn = document.querySelector('.guilty-share-btn');
    const helpToggle = document.querySelector('.guilty-help-toggle');
    
    if (submitBtn && wordInput) {
      // Remove any existing event listeners to prevent duplicates
      const newSubmitBtn = submitBtn.cloneNode(true);
      submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
      
      const newWordInput = wordInput.cloneNode(true);
      wordInput.parentNode.replaceChild(newWordInput, wordInput);
      
      // Add event listeners to the new elements
      newSubmitBtn.addEventListener('click', () => this.submitGuess());
      newWordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !this.inputDisabled) {
          this.submitGuess();
        }
      });
      
      if (this.inputDisabled) {
        newWordInput.disabled = true;
        newSubmitBtn.disabled = true;
      } else {
        newWordInput.focus();
      }
    }
    
    if (shareBtn) {
      const newShareBtn = shareBtn.cloneNode(true);
      shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);
      newShareBtn.addEventListener('click', () => this.shareResults());
    }
    
    if (helpToggle) {
      helpToggle.addEventListener('click', () => this.toggleHelp());
    }
  }
  
  toggleHelp() {
    const helpContainer = document.querySelector('.guilty-help-container');
    
    if (helpContainer) {
      helpContainer.classList.toggle('guilty-help-collapsed');
    }
  }
  
  submitGuess() {
    if (this.gameOver || this.inputDisabled) return;
    
    const wordInput = document.querySelector('.guilty-word-input');
    const word = wordInput.value.trim().toLowerCase();
    
    if (!word) {
      this.showMessage('Please enter a word');
      return;
    }
    
    if (this.usedWords.has(word)) {
      this.showMessage('You already tried this word');
      return;
    }
    
    if (!(word in this.embeddings) && word !== this.wordOfTheDay) {
      this.showMessage('Word not guilty enough');
      return;
    }
    
    this.usedWords.add(word);
    
    // Disable input during animation
    this.inputDisabled = true;
    
    // Clear any message
    this.message = '';
    
    // Calculate score
    const isCorrect = word === this.wordOfTheDay;
    const score = isCorrect ? 1 : (this.embeddings[word] || 0);
    
    // Record the attempt
    this.playerScores[this.currentAttempt] = {
      word,
      score,
      isCorrect
    };
    
    // Update best score
    if (score > this.bestScore) {
      this.bestScore = score;
      this.bestScoreIndex = this.currentAttempt;
    }
    
    // Update the game state
    this.currentAttempt++;
    this.gameWon = isCorrect;
    this.gameOver = this.gameWon || this.currentAttempt >= this.maxAttempts;
    
    // Clear input and remove focus
    wordInput.value = '';
    wordInput.blur();
    
    this.renderGame();
    this.animateScore(this.currentAttempt - 1);
  }
  
  animateScore(attemptIndex) {
    const scoreElements = document.querySelectorAll('.guilty-attempt-score');
    if (!scoreElements.length || attemptIndex >= scoreElements.length) return;
    
    const scoreElement = scoreElements[attemptIndex];
    const attempt = this.playerScores[attemptIndex];
    
    if (scoreElement && attempt) {
      // Animate the score increasing
      let startScore = 0;
      const targetScore = attempt.score;
      const duration = attempt.isCorrect ? 1000 : 800; // Slightly longer for correct word
      const startTime = performance.now();
      
      // First, scroll to the latest attempt
      const latestAttemptRow = document.querySelector('.guilty-latest-attempt');
      if (latestAttemptRow) {
        latestAttemptRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentScore = startScore + (targetScore - startScore) * progress;
        
        scoreElement.textContent = this.formatScoreDisplay(currentScore, true);
        scoreElement.classList.add('guilty-score-revealed');
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          scoreElement.textContent = this.formatScoreDisplay(targetScore);
          
          // If correct word, add a subtle pulse effect
          if (attempt.isCorrect) {
            scoreElement.classList.add('guilty-correct-pulse');
            
            // Move to results more quickly for correct word
            setTimeout(() => {
              this.endGame();
            }, 800);
          } else {
            if (!this.gameOver) {
              setTimeout(() => {
                const inputArea = document.querySelector('.guilty-input-area');
                if (inputArea) {
                  inputArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Only focus back on the input after scrolling back
                  setTimeout(() => {
                    // Re-enable input
                    this.inputDisabled = false;
                    this.renderGame();
                    
                    const wordInput = document.querySelector('.guilty-word-input');
                    if (wordInput) {
                      wordInput.focus();
                    }
                  }, 300);
                }
              }, 800);
            } else {
              this.inputDisabled = true;
              
              // If game over without correct word, highlight the best score
              if (this.gameOver && !this.gameWon) {
                this.highlightBestScore();
              }
            }
          }
        }
      };
      
      requestAnimationFrame(animate);
    }
  }
  
  highlightBestScore() {
    const attemptRows = document.querySelectorAll('.guilty-attempt-row');
    if (!attemptRows.length) return;
    
    const latestAttempt = document.querySelector('.guilty-latest-attempt');
    if (latestAttempt) {
      latestAttempt.classList.add('guilty-highlight-transition');
    }
    
    // After a short delay, move the highlight to the best score
    setTimeout(() => {
      if (latestAttempt) {
        latestAttempt.classList.remove('guilty-highlight-transition');
      }
      
      this.highlightingBest = true;
      this.renderGame();
      
      const bestAttempt = document.querySelectorAll('.guilty-attempt-row')[this.bestScoreIndex];
      
      if (bestAttempt) {
        bestAttempt.classList.add('guilty-highlight-transition');
        bestAttempt.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // After showing the best score, proceed to end game
        setTimeout(() => {
          this.endGame();
        }, 1000);
      } else {
        // If we can't find the best attempt, just end the game
        this.endGame();
      }
    }, 800);
  }
  
  endGame() {
    this.showResults = false;
    this.renderGame();
    
    setTimeout(() => {
      this.showResults = true;
      this.renderGame();
      
      const resultsElement = document.querySelector('.guilty-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
        
        setTimeout(() => {
          this.animateScoreDisplay();
        }, 300);
      }
    }, 1500);
  }
  
  renderScoreDisplay() {
    let display = '<div class="guilty-score-summary">';
    
    for (let i = 0; i < this.currentAttempt; i++) {
      const attempt = this.playerScores[i];
      const isBest = i === this.bestScoreIndex;
      const scoreWidth = attempt.score * 50;
      
      display += `
        <div class="guilty-score-row">
          <div class="guilty-score-bar-container">
            <div class="guilty-score-bar ${isBest ? 'guilty-best-score' : ''}" style="width: 0%;" data-target-width="${scoreWidth}%"></div>
            <div class="guilty-score-value" style="margin-left: ${Math.max(scoreWidth, 5)}%; opacity: 0">${this.formatScoreDisplay(attempt.score)}</div>
          </div>
        </div>
      `;
    }
    
    display += '</div>';
    return display;
  }
  
  animateScoreDisplay() {
    const scoreRows = document.querySelectorAll('.guilty-score-row');
    
    scoreRows.forEach((row, index) => {
      // Initially hide the score value
      const scoreValue = row.querySelector('.guilty-score-value');
      if (scoreValue) {
        scoreValue.style.opacity = '0';
      }
      
      setTimeout(() => {
        const bar = row.querySelector('.guilty-score-bar');
        const targetWidth = bar.getAttribute('data-target-width');
        
        bar.style.width = targetWidth;
        
        // Show score after bar animation completes
        setTimeout(() => {
          if (scoreValue) {
            scoreValue.style.opacity = '1';
          }
        }, 300); // Match the bar transition duration
      }, index * 300);
    });
  }
  
  shareResults() {
    let shareText = `Guilty by Association • ${this.getFormattedDate()}\n`;
    shareText += `Today's theme: "${this.themeDescription}"\n\n`;
    
    for (let i = 0; i < this.currentAttempt; i++) {
      const score = this.playerScores[i].score;
      const isBest = i === this.bestScoreIndex;
      
      let emoji;
      if (score === 1) {
        emoji = '🎯';
      } else if (score >= 0.8) {
        emoji = '🔥';
      } else if (score >= 0.6) {
        emoji = '😊';
      } else if (score >= 0.4) {
        emoji = '😐';
      } else if (score >= 0.2) {
        emoji = '🥶';
      } else {
        emoji = '❄️';
      }
      
      const blockCount = 10;
      const filledBlocks = Math.round(score * blockCount);
      const emptyBlocks = blockCount - filledBlocks;
      const bar = '▓'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
      shareText += `${emoji} ${bar}${isBest ? ' ⭐' : ''} ${this.formatScore(score)}\n`;
    }
    
    shareText += `\nPlay at: navendu.me/playgrounds/guilty/`;
    
    const shareBtn = document.querySelector('.guilty-share-btn');
    const originalText = shareBtn.innerHTML;
    
    shareBtn.innerHTML = `
      <svg class="guilty-share-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0.87 14 12.25">
        <path d="M8.395.952a.88.88 0 0 0-.52.798V3.5H4.813A4.813 4.813 0 0 0 0 8.313a5.36 5.36 0 0 0 2.74 4.761.45.45 0 0 0 .221.052.54.54 0 0 0 .539-.539c0-.205-.118-.394-.268-.533-.257-.243-.607-.722-.607-1.553A2.626 2.626 0 0 1 5.25 7.876h2.625v1.75c0 .345.202.659.52.798s.684.082.941-.148l4.375-3.938c.183-.167.29-.402.29-.651s-.104-.484-.29-.651L9.336 1.098A.87.87 0 0 0 8.395.95"></path>
      </svg>
      Copied!`;
    
    navigator.clipboard.writeText(shareText)
      .then(() => {
        setTimeout(() => {
          shareBtn.innerHTML = originalText;
        }, 2000);
      })
      .catch(err => {
        shareBtn.innerHTML = originalText;
      });
  }
  
  showMessage(message) {
    this.message = message;
    this.renderGame();
    
    setTimeout(() => {
      this.message = '';
      this.renderGame();
    }, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new GuiltyGame();
}); 