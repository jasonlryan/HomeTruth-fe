import { getQuizAnswers, getQuizQuestions } from '../api/api';

/**
 * Check if user has completed the quiz by verifying they have answered all questions
 * @returns {Promise<boolean>} True if quiz is completed, false otherwise
 */
export const checkQuizCompletion = async () => {
  try {
    console.log("checkQuizCompletion: Starting quiz completion check");
    // Get both questions and answers
    const [questionsRes, answersRes] = await Promise.all([
      getQuizQuestions(),
      getQuizAnswers()
    ]);

    const questions = questionsRes?.data || [];
    const answers = answersRes?.data || [];
    

    // If no questions exist, consider quiz completed
    if (questions.length === 0) {
      return true;
    }

    // Check if user has answered all questions
    for (const question of questions) {
      const userAnswers = answers.find(a => a.id === question.id)?.user_answer || [];
      
      // For questions that require answers, check if any answer exists
      const hasAnswer = userAnswers.some(ua => ua.is_answered);
      
      
      if (!hasAnswer) {
        return false; // Found an unanswered question
      }
    }

    return true; // All questions answered
  } catch (error) {
    console.error('Error checking quiz completion:', error);
    // If there's an error, assume quiz is not completed to be safe
    return false;
  }
};

/**
 * Check if user has answered any questions (partial completion)
 * @returns {Promise<boolean>} True if user has answered at least one question
 */
export const checkPartialQuizCompletion = async () => {
  try {
    const answersRes = await getQuizAnswers();
    const answers = answersRes?.data || [];

    // Check if any question has been answered
    for (const answer of answers) {
      const userAnswers = answer.user_answer || [];
      const hasAnyAnswer = userAnswers.some(ua => ua.is_answered);
      
      if (hasAnyAnswer) {
        return true; // Found at least one answered question
      }
    }

    return false; // No questions answered
  } catch (error) {
    console.error('Error checking partial quiz completion:', error);
    return false;
  }
};
