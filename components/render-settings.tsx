import { CardContent } from "@/components/ui/card";
import { getFormulaNameById } from "@/lib/formulas";
import { QuestionSettings } from "@/lib/question-types";

interface SettingsDisplayCardProps {
  settings: QuestionSettings;
}

export const SettingsDisplayCard: React.FC<SettingsDisplayCardProps> = ({ settings }) => {
  switch (settings.operationType) {
    case 'add_subtract':
      return (
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Operation:</span>
            <span className="text-[#5d4037] font-semibold">Addition/Subtraction</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Formula:</span>
            <span className="text-[#5d4037] font-semibold">{getFormulaNameById(settings.addSubScenario || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Min. Terms:</span>
            <span className="text-[#5d4037] font-semibold">{settings.minAddSubTerms}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Max. Terms:</span>
            <span className="text-[#5d4037] font-semibold">{settings.maxAddSubTerms}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Min. Digits per Term:</span>
            <span className="text-[#5d4037] font-semibold">{settings.minAddSubTermDigits}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Max. Digits per Term:</span>
            <span className="text-[#5d4037] font-semibold">{settings.maxAddSubTermDigits}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Weighting Multiplier:</span>
            <span className="text-[#5d4037] font-semibold">{settings.addSubWeightingMultiplier}</span>
          </div>
        </CardContent>
      );
    case 'multiply':
      return (
        <CardContent className="space-y-2 text-sm">
           <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Operation:</span>
            <span className="text-[#5d4037] font-semibold">Multiplication</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Term 1 Digits:</span>
            <span className="text-[#5d4037] font-semibold">{settings.term1Digits}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Term 2 Digits:</span>
            <span className="text-[#5d4037] font-semibold">{settings.term2Digits}</span>
          </div>
        </CardContent>
      );
    case 'divide':
       return (
        <CardContent className="space-y-2 text-sm">
           <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Operation:</span>
            <span className="text-[#5d4037] font-semibold">Division</span>
          </div>
           <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Division Type:</span>
            <span className="text-[#5d4037] font-semibold">{settings.divisionFormulaType}</span>
          </div>
          {settings.divisionFormulaType === 'TYPE5_ANY_DIGITS' && (
            <>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Divisor Digits:</span>
                <span className="text-[#5d4037] font-semibold">{settings.divisorDigits}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Dividend Digits Min:</span>
                <span className="text-[#5d4037] font-semibold">{settings.dividendDigitsMin}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Dividend Digits Max:</span>
                <span className="text-[#5d4037] font-semibold">{settings.dividendDigitsMax}</span>
              </div>
            </>
          )}
        </CardContent>
      );
    default:
      return (
         <CardContent className="space-y-2 text-sm">
           <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Operation:</span>
              <span className="text-[#5d4037] font-semibold">Unknown</span>
            </div>
            <p className="text-sm text-muted-foreground">No specific settings to display for this operation type.</p>
         </CardContent>
      );
  }
};