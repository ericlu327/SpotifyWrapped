import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * SpotifyWrappedTrivia Component
 *
 * This component renders a trivia game based on the user's Spotify Wrapped data.
 * It features a timer for each question, score tracking, and game-over handling.
 *
 * Features:
 * - Fetches user's Spotify Wrapped data.
 * - Generates trivia questions based on Wrapped data.
 * - Tracks current question, user score, and remaining time.
 * - Handles game restart and navigation to the home page.
 *
 * State:
 * - wrappedData: Stores Spotify Wrapped data fetched from the API.
 * - currentQuestionIndex: Tracks the index of the current question.
 * - score: Tracks the user's current score.
 * - selectedAnswer: Stores the answer selected by the user for the current question.
 * - gameOver: Boolean indicating whether the game is over.
 * - timer: Countdown timer for each question.
 */
function SpotifyWrappedTrivia() {
  const [wrappedData, setWrappedData] = useState(null); // Stores Wrapped data
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Tracks current question
  const [score, setScore] = useState(0); // Tracks user score
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Tracks selected answer
  const [gameOver, setGameOver] = useState(false); // Indicates game over state
  const [timer, setTimer] = useState(10); // Timer for each question (10 seconds)
  const navigate = useNavigate();

  /**
   * Shuffles an array in random order.
   *
   * @param {Array} array - The array to shuffle.
   * @returns {Array} A new array with shuffled elements.
   */
  const shuffleArray = (array) => {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  // Fetch Spotify Wrapped data on component mount
  useEffect(() => {
    const fetchWrappedData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}spotify/wrapped-history/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setWrappedData(data);
        } else {
          alert("Failed to fetch Wrapped data.");
        }
      } catch (error) {
        console.error("Error fetching Wrapped data:", error);
        alert("An error occurred while fetching Wrapped data.");
      }
    };

    fetchWrappedData();
  }, []);

  /**
   * Generates trivia questions based on Spotify Wrapped data.
   *
   * @returns {Array} An array of question objects.
   */
  const generateQuestions = () => {
    if (!wrappedData || !wrappedData[0]) return [];

    const questions = [
      {
        question: "Who was your top artist of the year?",
        correctAnswer: wrappedData[0]?.artists?.[0]?.name || "",
        options: shuffleArray(
          wrappedData[0]?.artists?.map((artist) => artist.name).slice(0, 4) || []
        ),
      },
    ];

    return questions;
  };

  const questions = generateQuestions();

  // Timer countdown for each question
  useEffect(() => {
    if (timer === 0) {
      handleAnswer();
    } else if (!gameOver) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, gameOver]);

  /**
   * Handles the user's answer submission and progresses to the next question.
   */
  const handleAnswer = () => {
    if (selectedAnswer === questions[currentQuestionIndex]?.correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }
    setSelectedAnswer(null);
    setTimer(10); // Reset timer for next question

    if (currentQuestionIndex === questions.length - 1) {
      setGameOver(true); // End game if last question
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  /**
   * Restarts the trivia game, resetting all state variables.
   */
  const handleRestart = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setGameOver(false);
    setTimer(10);
    setSelectedAnswer(null);
  };

  if (!wrappedData) {
    return <div>Loading Wrapped Data...</div>;
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-spotifyWhite dark:bg-spotifyBlack text-spotifyGreen dark:text-white py-8">
        <h1 className="text-4xl font-bold mb-4 text-spotifyGreen animate__animated animate__fadeIn">
          Game Over!
        </h1>
        <p className="text-2xl mb-6 animate__animated animate__fadeIn animate__delay-1s">
          Your Score: {score} / {questions.length}
        </p>
        <button
          onClick={handleRestart}
          className="py-2 px-6 mb-4 bg-spotifyGreen text-white dark:text-black rounded-lg hover:bg-spotifyGreenHover transition-all duration-300 transform hover:scale-105"
        >
          Restart Game
        </button>
        <button
          onClick={() => navigate("/")}
          className="py-2 px-6 bg-spotifyGreen text-white dark:text-black rounded-lg hover:bg-spotifyGreenHover transition-all duration-300 transform hover:scale-105"
        >
          Go Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-spotifyWhite dark:bg-spotifyBlack text-spotifyGreen dark:text-white p-6 relative animate__animated animate__fadeIn">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 text-spotifyGreen dark:text-white bg-transparent hover:bg-spotifyGreen p-2 rounded-full transition-all duration-300"
      >
        &lt; Back
      </button>

      <div className="w-full max-w-xl bg-spotifyLight: dark:bg-spotifyDark rounded-lg shadow-xl p-8 space-y-6 animate__animated animate__fadeIn animate__delay-1s">
        <h1 className="text-3xl font-bold mb-6 text-spotifyGreen">Spotify Wrapped Trivia!</h1>

        <div className="text-xl mb-6">Question {currentQuestionIndex + 1} of {questions.length}</div>

        <div className="text-2xl mb-6 text-center">{questions[currentQuestionIndex]?.question}</div>

        <div className="space-y-4">
          {questions[currentQuestionIndex]?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(option)}
              className={`p-4 w-full bg-spotifyLight dark:bg-spotifyDark text-spotifyGreen dark:text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-spotifyGreenHover ${
                selectedAnswer === option ? "bg-spotifyGreen" : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-between w-full">
          <div className="text-xl">Time: {timer}s</div>
          <div className="text-xl">Score: {score}</div>
        </div>

        <button
          onClick={handleAnswer}
          disabled={!selectedAnswer}
          className="mt-6 py-2 px-6 bg-spotifyGreen text-white dark:text-black rounded-lg shadow-lg hover:bg-spotifyGreenHover transition-all duration-300 transform hover:scale-105"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}

export default SpotifyWrappedTrivia;
