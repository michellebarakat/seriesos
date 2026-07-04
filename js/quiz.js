// SeriesOS — Quiz page
// 7-question personality quiz that matches the user to a curated show

import { tmdbApi } from "./api.js";
import { curatedCollection } from "./data.js";

// Quiz questions and options
// Each option has a "scores" object that adds points to specific show IDs
const questions = [
  {
    text: "How much time do you have right now?",
    options: [
      { label: "Just one episode to test the waters", scores: { 17: 3, 18: 3, 19: 3, 10: 2, 11: 2 } },
      { label: "A full evening, I'm ready to commit", scores: { 1: 3, 2: 3, 6: 3, 26: 3, 21: 2 } },
      { label: "The entire weekend, I'm not moving", scores: { 4: 3, 16: 3, 13: 3, 14: 3, 22: 2 } },
      { label: "Just something to fall asleep to", scores: { 17: 3, 18: 2, 19: 2, 27: 2 } },
    ],
  },
  {
    text: "What's your mood right now?",
    options: [
      { label: "I want something intense that keeps me on edge", scores: { 1: 3, 2: 3, 5: 3, 23: 3, 3: 2 } },
      { label: "I want to laugh and have a good time", scores: { 17: 3, 18: 3, 19: 3, 29: 2, 27: 2 } },
      { label: "I want something romantic and feel-good", scores: { 6: 3, 7: 3, 8: 3, 16: 3, 28: 2 } },
      { label: "I want something that messes with my head", scores: { 3: 3, 20: 3, 1: 2, 2: 2, 5: 2 } },
    ],
  },
  {
    text: "Pick the kind of main character you want to follow:",
    options: [
      { label: "A morally grey anti-hero doing questionable things", scores: { 1: 3, 2: 3, 3: 3, 29: 2, 5: 2 } },
      { label: "A smart professional who's really good at their job", scores: { 4: 3, 26: 3, 30: 3, 23: 2, 21: 2 } },
      { label: "Someone navigating love and messy relationships", scores: { 6: 3, 7: 3, 8: 3, 9: 2, 15: 2 } },
      { label: "A group of friends going through things together", scores: { 17: 3, 13: 3, 14: 2, 18: 2, 15: 2 } },
    ],
  },
        {
    text: "What kind of setting do you want to escape into?",
    options: [
        { label: "A big city full of power, money and drama", scores: { 26: 3, 5: 3, 3: 3, 23: 2, 11: 2 } },
        { label: "Somewhere adventurous and out of the ordinary", scores: { 13: 3, 22: 3, 20: 3, 21: 2, 10: 2 } },
        { label: "A cozy familiar world I can feel comfortable in", scores: { 17: 3, 18: 3, 19: 3, 27: 2, 28: 2 } },
        { label: "A romantic world full of tension and chemistry", scores: { 6: 3, 7: 3, 8: 3, 16: 3, 9: 2 } },
    ],
    },
  {
    text: "How many seasons are you willing to commit to?",
    options: [
      { label: "One season max, short and sharp", scores: { 23: 3, 16: 3, 7: 2, 8: 2, 10: 2 } },
      { label: "Two or three seasons is perfect", scores: { 3: 3, 5: 3, 13: 3, 15: 3, 22: 2 } },
      { label: "Four or five seasons, I want a full story", scores: { 1: 3, 2: 3, 26: 3, 29: 3, 14: 2 } },
      { label: "Give me something I can live in for months", scores: { 4: 3, 17: 3, 18: 3, 27: 3, 30: 2 } },
    ],
  },
  {
    text: "What kind of ending do you prefer?",
    options: [
      { label: "Cliffhangers every episode, I love the suspense", scores: { 1: 3, 5: 3, 3: 3, 23: 3, 2: 2 } },
      { label: "Satisfying endings where things get resolved", scores: { 17: 3, 19: 3, 18: 3, 26: 2, 30: 2 } },
      { label: "I want to feel something deep even if it hurts", scores: { 6: 3, 15: 3, 20: 3, 1: 2, 2: 2 } },
      { label: "I want to smile, not stress", scores: { 18: 3, 19: 3, 29: 3, 8: 2, 7: 2 } },
    ],
  },
  {
    text: "Finally, what describes your current life situation?",
    options: [
      { label: "I'm stressed and need something easy to watch", scores: { 17: 3, 18: 3, 19: 3, 10: 2, 11: 2 } },
      { label: "I just went through something and need a distraction", scores: { 6: 3, 7: 3, 29: 3, 8: 2, 13: 2 } },
      { label: "Life is good and I want to celebrate with a binge", scores: { 1: 3, 5: 3, 26: 3, 13: 3, 23: 2 } },
      { label: "I'm bored and want something totally new", scores: { 20: 3, 3: 3, 22: 3, 21: 3, 30: 2 } },
    ],
  },
];

class QuizPage {
  constructor() {
    this.currentQuestion = 0;
    this.scores = {};

    // Initialize all show scores to 0
    curatedCollection.forEach(item => { this.scores[item.id] = 0; });

    // Screen elements
    this.introScreen = document.getElementById("quizIntro");
    this.questionScreen = document.getElementById("quizQuestions");
    this.resultScreen = document.getElementById("quizResult");

    // Question elements
    this.progressFill = document.getElementById("progressFill");
    this.progressText = document.getElementById("progressText");
    this.questionText = document.getElementById("questionText");
    this.optionsContainer = document.getElementById("optionsContainer");

    // Buttons
    document.getElementById("startBtn").addEventListener("click", () => this.startQuiz());
    document.getElementById("retakeBtn").addEventListener("click", () => this.resetQuiz());
  }

  startQuiz() {
    this.introScreen.style.display = "none";
    this.questionScreen.style.display = "block";
    this.renderQuestion();
  }

  renderQuestion() {
    const q = questions[this.currentQuestion];
    const progress = ((this.currentQuestion) / questions.length) * 100;

    this.progressFill.style.width = `${progress}%`;
    this.progressText.textContent = `Question ${this.currentQuestion + 1} of ${questions.length}`;
    this.questionText.textContent = q.text;

    this.optionsContainer.innerHTML = q.options.map((opt, i) => `
      <button class="quiz-option-btn" data-index="${i}">
        ${opt.label}
      </button>
    `).join("");

    this.optionsContainer.querySelectorAll(".quiz-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const optionIndex = parseInt(btn.dataset.index);
        this.selectAnswer(optionIndex, btn);
      });
    });
  }

  selectAnswer(optionIndex, btn) {
    // Highlight selected option
    this.optionsContainer.querySelectorAll(".quiz-option-btn")
      .forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    // Add scores from this answer
    const selectedOption = questions[this.currentQuestion].options[optionIndex];
    Object.entries(selectedOption.scores).forEach(([id, points]) => {
      this.scores[parseInt(id)] = (this.scores[parseInt(id)] || 0) + points;
    });

    // Move to next question after short delay
    setTimeout(() => {
      this.currentQuestion++;
      if (this.currentQuestion < questions.length) {
        this.renderQuestion();
      } else {
        this.showResult();
      }
    }, 400);
  }

  async showResult() {
    // Find the show with the highest score
    const winnerId = Object.entries(this.scores)
      .sort((a, b) => b[1] - a[1])[0][0];

    const winner = curatedCollection.find(item => item.id === parseInt(winnerId));

    // Switch screens
    this.questionScreen.style.display = "none";
    this.resultScreen.style.display = "block";

    // Show loading state for poster
    document.getElementById("resultPoster").src = "";
    document.getElementById("resultTitle").textContent = winner.title;
    document.getElementById("resultCategory").textContent = winner.category;
    document.getElementById("resultBlurb").textContent = winner.yourBlurb;
    document.getElementById("resultReview").textContent = winner.yourReview;

    // Fetch poster and rating from TMDB
    try {
      const match = await tmdbApi.findBestMatch(winner.title);
      if (match) {
        const poster = tmdbApi.getImageUrl(match.data.poster_path);
        const rating = match.data.vote_average
          ? match.data.vote_average.toFixed(1)
          : "N/A";
        document.getElementById("resultPoster").src = poster || "assets/placeholder.jpg";
        document.getElementById("resultRating").innerHTML =
          `<i class="bi bi-star-fill"></i> ${rating}`;
      }
    } catch (err) {
      document.getElementById("resultPoster").src = "assets/placeholder.jpg";
    }
  }

  resetQuiz() {
    // Reset all scores
    curatedCollection.forEach(item => { this.scores[item.id] = 0; });
    this.currentQuestion = 0;

    // Reset progress bar
    this.progressFill.style.width = "0%";

    // Go back to intro
    this.resultScreen.style.display = "none";
    this.introScreen.style.display = "block";
  }
}

const quiz = new QuizPage();