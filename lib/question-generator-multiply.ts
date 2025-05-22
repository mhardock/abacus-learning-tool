import { QuestionSettings, Question } from '../lib/question-types';

export function generateMultiplicationQuestion(settings: QuestionSettings): Question {
  const { term1Digits = 2, term2Digits = 2 } = settings;
  
  
  const factor1 = Math.floor(settings.rng!() * (Math.pow(10, term1Digits) - Math.pow(10, term1Digits -1))) + Math.pow(10, term1Digits -1);
  const factor2 = Math.floor(settings.rng!() * (Math.pow(10, term2Digits) - Math.pow(10, term2Digits -1))) + Math.pow(10, term2Digits -1);
  
  const expectedAnswer = factor1 * factor2;
  const questionString = `${factor1} x ${factor2} =`;
  
  return {
    operands: [factor1, factor2],
    expectedAnswer,
    questionString,
    operationType: 'multiply',
  };
}