"use client";

import { QuestionSettings, OperationType } from "../lib/question-types";
import { DivisionFormulaType } from "../lib/settings-utils";
import { getFormulaNameById, getDivisionFormulaNameByType } from "../lib/formulas";

interface FormulaDisplayProps {
  settings: QuestionSettings;
}

const FormulaDisplay: React.FC<FormulaDisplayProps> = ({ settings }) => {
  let formulaText = "N/A";

  if (settings) {
    switch (settings.operationType) {
      case OperationType.ADD_SUBTRACT:
        if (settings.addSubScenario) {
          formulaText = getFormulaNameById(settings.addSubScenario);
        }
        break;
      case OperationType.MULTIPLY:
        if (settings.ruleString) {
          formulaText = settings.ruleString;
        }
        break;
      case OperationType.DIVIDE:
        if (settings.divisionFormulaType) {
          formulaText = getDivisionFormulaNameByType(settings.divisionFormulaType as DivisionFormulaType);
        }
        break;
      default:
        formulaText = "N/A";
        break;
    }
  }

  return (
    <div className="text-sm font-medium text-[#5d4037] mb-2">
      Current formula: {formulaText}
    </div>
  );
};

export default FormulaDisplay;