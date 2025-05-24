import { QuestionSettings, Question, OperationType } from '../lib/question-types';
import { generateAdditionSubtractionQuestion } from './question-generator-add-sub';
import { generateMultiplicationQuestion } from './question-generator-multiply';
import { generateDivisionQuestion } from './question-generator-divide';

export function generateQuestion(settings: QuestionSettings): Question {
  switch (settings.operationType) {
    case OperationType.ADD_SUBTRACT:
      return generateAdditionSubtractionQuestion(settings);
    case OperationType.MULTIPLY:
      return generateMultiplicationQuestion(settings);
    case OperationType.DIVIDE:
      return generateDivisionQuestion(settings);
    default:
      // Fallback or error, though TypeScript should ensure operationType is valid
      console.error("Unknown operation type:", settings.operationType);
      // As a fallback, generate an add/subtract question if settings are somewhat compatible
      // Or throw an error if settings are completely incompatible.
      // For now, simple fallback with a warning.
      if(settings.minAddSubTerms !== undefined) { // A loose check
         return generateAdditionSubtractionQuestion(settings);
      }
      throw new Error(`Unsupported operation type: ${settings.operationType}`);
  }
}