"use client"

import { useState, useEffect } from "react"
import { jsPDF } from "jspdf"
import { Button } from "./ui/button"
import { Input } from "@/components/ui/input"
// Import QuestionSettings and Question, and OperationType
import { QuestionSettings, Question, OperationType } from "@/lib/question-types"
import { generateQuestion } from "@/lib/question-generator"
import { getFormulaNameById } from "@/lib/formulas"
import { generateWorksheetId, getFormattedDate, loadFromLocalStorage, saveToLocalStorage } from "@/lib/utils"

interface WorksheetGeneratorProps {
  settings: QuestionSettings
}

// Define interface for saved worksheet settings
interface WorksheetSettings {
  numQuestions: number
  worksheetTitle: string
  paperSize: string
  showQuestionNumbers: boolean
  showDate: boolean
}

// Define interface for stored worksheet
interface StoredWorksheet {
  id: string
  title: string
  date: string
  questions: Question[] // Use the updated Question interface
  settings: QuestionSettings
}

// Worksheet generator component
const WorksheetGenerator = ({ settings }: WorksheetGeneratorProps) => {
  // Load saved settings from localStorage on initial render
  const loadSavedSettings = (): WorksheetSettings => loadFromLocalStorage<WorksheetSettings>('worksheetSettings', {
    numQuestions: 20,
    worksheetTitle: "",
    paperSize: "letter",
    showQuestionNumbers: true,
    showDate: true,
  });

  // Load saved worksheets from localStorage
  const loadSavedWorksheets = (): StoredWorksheet[] => loadFromLocalStorage<StoredWorksheet[]>('savedWorksheets', []);

  // State with default values from saved settings
  const [numQuestions, setNumQuestions] = useState(20)
  const [isGenerating, setIsGenerating] = useState(false)
  const [worksheetTitle, setWorksheetTitle] = useState("")
  const [paperSize, setPaperSize] = useState("letter") // "letter" or "a4"
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(true)
  const [showDate, setShowDate] = useState(true)

  // State for layout warnings
  const [showLayoutWarning, setShowLayoutWarning] = useState(false)

  // State for saved worksheets
  const [savedWorksheets, setSavedWorksheets] = useState<StoredWorksheet[]>([])
  const [worksheetIdToLoad, setWorksheetIdToLoad] = useState("")
  const [showSavedWorksheets, setShowSavedWorksheets] = useState(false)

  // Initialize state from localStorage on mount
  useEffect(() => {
    const savedSettings = loadSavedSettings();
    setNumQuestions(savedSettings.numQuestions);
    setWorksheetTitle(savedSettings.worksheetTitle);
    setPaperSize(savedSettings.paperSize);
    setShowQuestionNumbers(savedSettings.showQuestionNumbers);
    setShowDate(savedSettings.showDate);

    // Load saved worksheets
    setSavedWorksheets(loadSavedWorksheets());
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const settingsToSave: WorksheetSettings = {
        numQuestions,
        worksheetTitle,
        paperSize,
        showQuestionNumbers,
        showDate,
      };

      localStorage.setItem('worksheetSettings', JSON.stringify(settingsToSave));
    }
  }, [numQuestions, worksheetTitle, paperSize, showQuestionNumbers, showDate]);

  // Check if current settings would create questions that might affect layout (only for add/subtract with many terms)
  useEffect(() => {
    const isAddSubtract = settings.operationType === OperationType.ADD_SUBTRACT;
    // Check the number of terms for add/subtract
    const hasManyTerms = isAddSubtract && ((settings.minAddSubTerms || 0) > 7 || (settings.maxAddSubTerms || 0) > 7);

    if (hasManyTerms) {
      setShowLayoutWarning(true);
    } else {
      setShowLayoutWarning(false);
    }
  }, [settings.operationType, settings.minAddSubTerms, settings.maxAddSubTerms]);


  // Save worksheet to localStorage
  const saveWorksheetToStorage = (worksheetId: string, questions: Question[]): void => {
    if (typeof window === 'undefined') {
      return;
    }
    const newStoredWorksheet: StoredWorksheet = {
      id: worksheetId,
      title: worksheetTitle || `Worksheet ${getFormattedDate()}`,
      date: getFormattedDate(),
      questions: questions,
      settings: { ...settings } // Save the current settings with the worksheet
    };
    const updatedWorksheets = [...savedWorksheets, newStoredWorksheet];
    if (updatedWorksheets.length > 20) { // Keep only the last 20 worksheets
      updatedWorksheets.shift();
    }
    setSavedWorksheets(updatedWorksheets);
    saveToLocalStorage('savedWorksheets', updatedWorksheets);
  };

  // Delete a saved worksheet
  const deleteWorksheet = (worksheetId: string): void => {
    const updatedWorksheets = savedWorksheets.filter(
      worksheet => worksheet.id !== worksheetId
    );
    setSavedWorksheets(updatedWorksheets);
    saveToLocalStorage('savedWorksheets', updatedWorksheets);
  };

  // Load a saved worksheet by ID
  const loadWorksheetById = (id: string): StoredWorksheet | null => {
    const worksheet = savedWorksheets.find(w => w.id === id);
    return worksheet || null;
  };

  // Create worksheet PDF
  const createWorksheetPdf = (questions: Question[], showAnswers: boolean = false, worksheetId: string, worksheetSettings: QuestionSettings): jsPDF => {
    // Initialize PDF with selected paper size
    const pdf = paperSize === "a4"
      ? new jsPDF({ format: "a4" })
      : new jsPDF(); // Default is letter size

    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    // Add title with formula type
    // Use the operationType and scenario from the worksheetSettings that were saved with the worksheet
     let formulaType = "";
     if (worksheetSettings.operationType === OperationType.ADD_SUBTRACT) {
       formulaType = getFormulaNameById(worksheetSettings.addSubScenario || 0); // Assuming getFormulaNameById handles scenario IDs for add/subtract
     } else {
       formulaType = worksheetSettings.operationType.charAt(0).toUpperCase() + worksheetSettings.operationType.slice(1); // "Multiply" or "Divide"
     }


    pdf.setFontSize(14);

    // Different title for worksheet vs answer sheet with custom title if provided
    let title;
    if (worksheetTitle.trim()) { // Use the state variable worksheetTitle for the PDF title
      title = showAnswers
        ? `Answer Sheet - ${worksheetTitle}`
        : `${worksheetTitle}`;
    } else {
      title = showAnswers
        ? `Answer Sheet - ${formulaType}`
        : `Abacus Worksheet - ${formulaType}`;
    }

    pdf.text(title, pageWidth / 2, 15, { align: "center" });

    // Add worksheet ID in top right corner
    pdf.setFontSize(10);
    pdf.text(`ID: ${worksheetId}`, pageWidth - 10, 10, { align: "right" });

    // Add date in top left corner if enabled
    if (showDate) {
      pdf.text(`Date: ${getFormattedDate()}`, 10, 10);
    }

    // Set default font size for questions
    pdf.setFontSize(12); // Slightly larger font for readability

    // Define layout parameters
    const margin = 10;
    const headerFooterSpace = 30; // Reduced space for headers and footers
    const columnHeaderY = 30; // Moved column headers up
    const questionContentStartY = columnHeaderY; // Start content immediately at column header position

    const isHorizontalLayout = worksheetSettings.operationType === OperationType.MULTIPLY || worksheetSettings.operationType === OperationType.DIVIDE;

    let columns;
    let questionWidth;
    let rowSpacing;
    let questionPaddingX; // Horizontal padding within a question cell
    let questionPaddingY; // Vertical padding within a question cell
    let approximateRowHeight; // Approximate height needed for a row (now more like cell height)
    let questionsPerPage; // Define here to be accessible later

    const availableHeight = pageHeight - questionContentStartY - margin; // Adjusted available height


    if (isHorizontalLayout) {
      columns = 2; // Two columns for multiplication and division
      questionWidth = (pageWidth - (margin * 2)) / columns;
      questionPaddingX = 5; // Horizontal padding within a question cell
      questionPaddingY = -1; // Standard padding within a question cell
      approximateRowHeight = 10; // Slightly reduced cell height while ensuring questions fit properly
      rowSpacing = 0; // Cells will be contiguous, borders will separate

      // Column Headers are drawn once before the loop, and then on new pages
      // pdf.setFont("helvetica", "bold"); // Font is set before loop or on new page
      // pdf.setFontSize(10);
      // pdf.text("Column A", margin + (questionWidth / 2), columnHeaderY, { align: "center" });
      // pdf.text("Column B", margin + questionWidth + (questionWidth / 2), columnHeaderY, { align: "center" });
      // pdf.setFont("helvetica", "normal");
      // pdf.setFontSize(12); // Reset to question font size

      const rowsPerPage = Math.max(1, Math.floor(availableHeight / approximateRowHeight));
      questionsPerPage = columns * rowsPerPage;

    } else { // Addition/Subtraction
      // Determine optimal column count based on max number of terms for vertical layout
      const maxTermsInAnyQuestion = Math.max(...questions.map(q => q.operands?.length || 0)); // Added nullish coalescing for safety

      // Adjust columns based on the max terms
      columns = 5; // Default 5 questions per row
      if (maxTermsInAnyQuestion > 12) {
        columns = 3; // Further reduce for extremely long questions
      } else if (maxTermsInAnyQuestion > 8) {
        columns = 4; // Reduce to 4 columns for very long questions
      }
      questionWidth = (pageWidth - (margin * 2)) / columns;
      rowSpacing = 10; // Spacing between rows for vertical layout
      questionPaddingX = 5;
      questionPaddingY = 5;
       // Estimate height for vertical layout: terms * spacing + answer line + padding
      approximateRowHeight = (maxTermsInAnyQuestion * 5) + 10 + questionPaddingY * 2;
      // Use pageHeight - headerFooterSpace for vertical layout's availableHeight
      const verticalAvailableHeight = pageHeight - headerFooterSpace - margin;
      const rowsPerPage = Math.max(1, Math.floor(verticalAvailableHeight / (approximateRowHeight + rowSpacing)));
      questionsPerPage = columns * rowsPerPage;
    }

    // The loop then uses columns, questionWidth, approximateRowHeight, and questionsPerPage, which are now all defined regardless of the branch.

    // Arrange questions in a grid layout
    for (let i = 0; i < questions.length; i++) {
      // Calculate position
      const positionOnPage = i % questionsPerPage;
      
      // For multiplication and division, distribute questions evenly with sequential numbering
      let col, row, displayQuestionNumber;
      if (isHorizontalLayout) {
        // Always use the original question number for display
        displayQuestionNumber = i + 1;
        
        // Calculate total questions for this page
        const questionsOnCurrentPage = Math.min(questionsPerPage, questions.length - (Math.floor(i / questionsPerPage) * questionsPerPage));
        
        // Calculate rows per column (evenly distributed)
        const rowsPerColumn = Math.ceil(questionsOnCurrentPage / 2);
        
        // For questions in first half of sequential numbering (1-10 of 20), put in left column
        if ((positionOnPage % questionsPerPage) < Math.ceil(questionsOnCurrentPage / 2)) {
          col = 0;
          row = positionOnPage % rowsPerColumn;
        }
        // For second half of sequential numbering (11-20 of 20), put in right column
        else {
          col = 1;
          row = positionOnPage % rowsPerColumn;
        }
      } else {
        // Keep original horizontal numbering for addition/subtraction
        col = positionOnPage % columns;
        row = Math.floor(positionOnPage / columns);
        displayQuestionNumber = i + 1;
      }

      // Add a new page if needed
      if (i > 0 && positionOnPage === 0) {
        pdf.addPage();

        // Add worksheet ID to each page
        pdf.setFontSize(10);
        pdf.text(`ID: ${worksheetId}`, pageWidth - 10, 10, { align: "right" });

        // Add date to each page if enabled
        if (showDate) {
          pdf.text(`Date: ${getFormattedDate()}`, 10, 10);
        }
        // Column headers have been removed for multiplication and division

        // Reset font size for questions
        pdf.setFontSize(12);
      }

      // Calculate coordinates for the question block
      const x = margin + (col * questionWidth);
      const currentQuestionCellY = isHorizontalLayout
        ? questionContentStartY + (row * approximateRowHeight)
        : 25 + (row * (approximateRowHeight + rowSpacing)); // Original startY for vertical

      // Calculate the center point of the question area (used by both vertical layout number centering and horizontal line centering)
      const centerX = x + (questionWidth / 2);

      const question = questions[i];

      if (isHorizontalLayout) {
        // Draw the cell border
        pdf.rect(x, currentQuestionCellY, questionWidth, approximateRowHeight);

        // Properly center text vertically within the cell using questionPaddingY
        const textBaselineY = currentQuestionCellY + (approximateRowHeight / 2) + (pdf.getFontSize() / 3) + questionPaddingY / 2; // Better vertical centering

        // Draw question number if enabled
        let questionNumberWidth = 0;
        if (showQuestionNumbers) {
          pdf.setFont("helvetica", "bold");
          const questionNumberText = `(${displayQuestionNumber})`;
          questionNumberWidth = pdf.getTextWidth(questionNumberText) + 2; // Add a small buffer
          pdf.text(questionNumberText, x + questionPaddingX, textBaselineY);
          pdf.setFont("helvetica", "normal");
        }

        // Horizontal layout for multiplication and division
        const questionText = question.questionString;
        const questionTextWidth = pdf.getTextWidth(questionText);

        // Position for the question string
        const textX = x + questionPaddingX + questionNumberWidth; // Start after number (or padding if no number)

        pdf.text(questionText, textX, textBaselineY);

        // For multiplication and division, we no longer draw an answer line
        const answerLineStartX = textX + questionTextWidth + 5; // Calculate this for positioning answers in answer sheet
        
        // Removed line drawing code

        // Add the answer if this is an answer sheet
        if (showAnswers) {
          pdf.setFont("helvetica", "bold");
          const answerText = question.expectedAnswer.toString();
          // Position the answer to the right of the equals sign on the same line
          const answerX = answerLineStartX + 2; // Small offset from where the line would have been
          pdf.text(answerText, answerX, textBaselineY); // Position answer on the same line
            pdf.setFont("helvetica", "normal");
          }

      } else {
          // Vertical layout for addition/subtraction
          const numberSpacing = 5; // Spacing between numbers
          // Ensure operands is an array before mapping
          const itemsInCurrentQuestion = question.operands?.length || 0;

          // Calculate vertical adjustment to center shorter questions within their cell height
           // Use the calculated max terms for the vertical layout for consistent spacing
           const contentHeight = (itemsInCurrentQuestion * numberSpacing) + 10; // Numbers height + line height
           const verticalAdjustment = Math.max(0, (approximateRowHeight - contentHeight) / 2);


          let localY = currentQuestionCellY + questionPaddingY + verticalAdjustment; // Start drawing numbers with padding and adjustment

          // Draw each number centered
          // Ensure operands is an array before iterating
          (question.operands || []).forEach((num: number, idx: number) => {
            const numText = num < 0 ? Math.abs(num).toString() : num.toString();
             // Determine if it's the first number (no sign) or subsequent (with sign)
            const displayNumText = idx === 0 ? num.toString() : (num < 0 ? `-${numText}` : numText); // Show '-' for negative, no sign for positive

            const textWidth = pdf.getTextWidth(displayNumText);
             // Position the text centered within the column width using centerX
            pdf.text(displayNumText, centerX - (textWidth / 2), localY);
            localY += numberSpacing;
          });

          // Place the line immediately after the last number with zero gap
          const lineY = localY - numberSpacing + 1;
          const lineWidth = questionWidth * 0.6; // Match line width from horizontal layout for consistency
          pdf.line(centerX - (lineWidth / 2), lineY, centerX + (lineWidth / 2), lineY);

          // Add the answer if this is an answer sheet
          if (showAnswers) {
            pdf.setFont("helvetica", "bold");
            const answerText = question.expectedAnswer.toString();
            const answerWidth = pdf.getTextWidth(answerText);
            pdf.text(answerText, centerX - (answerWidth / 2), lineY + 4); // Center below the line
            pdf.setFont("helvetica", "normal");
          }
      }
    }

    return pdf;
  };

  // Generate new questions
  const generateNewQuestions = (count: number): Question[] => {
    const questions = [];
    for (let i = 0; i < count; i++) {
      questions.push(generateQuestion(settings)); // Use the current settings
    }
    return questions;
  };

  // Generate only the worksheet
  const generateWorksheet = () => {
    setIsGenerating(true);

    try {
      // Create questions
      const questions = generateNewQuestions(numQuestions);

      // Generate unique ID for this worksheet
      const worksheetId = generateWorksheetId();

      // Save worksheet to localStorage along with current settings
      saveWorksheetToStorage(worksheetId, questions);

      // Create the worksheet PDF using the current settings
      const pdf = createWorksheetPdf(questions, false, worksheetId, settings);

      // Download PDF
      pdf.save(`worksheet-${worksheetId}.pdf`);
    } catch (error) {
      console.error("Error generating worksheet:", error);
      alert(`Error generating worksheet: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate both worksheet and answer sheet
  const generateWorksheetWithAnswers = () => {
    setIsGenerating(true);

    try {
      // Create questions - same set for both worksheet and answer sheet
      const questions = generateNewQuestions(numQuestions);

      // Generate unique ID for this worksheet
      const worksheetId = generateWorksheetId();

      // Save worksheet to localStorage along with current settings
      saveWorksheetToStorage(worksheetId, questions);

      // Create the worksheet PDF
      const worksheet = createWorksheetPdf(questions, false, worksheetId, settings);

      // Create the answer sheet PDF
      const answerSheet = createWorksheetPdf(questions, true, worksheetId, settings);

      // Download both PDFs
      worksheet.save(`worksheet-${worksheetId}.pdf`);
      answerSheet.save(`answers-${worksheetId}.pdf`);
    } catch (error) {
      console.error("Error generating worksheet with answers:", error);
      alert(`Error generating worksheet with answers: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate a previously saved worksheet
  const regenerateWorksheet = () => {
    if (!worksheetIdToLoad.trim()) {
      return;
    }

    setIsGenerating(true);

    try {
      // Load stored worksheet which includes questions and settings
      const storedWorksheet = loadWorksheetById(worksheetIdToLoad);

      if (!storedWorksheet) {
        alert(`No worksheet found with ID: ${worksheetIdToLoad}`);
        setIsGenerating(false);
        return;
      }

      // Use the questions and settings from the loaded worksheet
      const { questions, settings: loadedSettings } = storedWorksheet;

      // Create the worksheet PDF
      const worksheet = createWorksheetPdf(questions, false, worksheetIdToLoad, loadedSettings);

      // Create the answer sheet PDF
      const answerSheet = createWorksheetPdf(questions, true, worksheetIdToLoad, loadedSettings);

      // Download both PDFs
      worksheet.save(`worksheet-${worksheetIdToLoad}.pdf`);
      answerSheet.save(`answers-${worksheetIdToLoad}.pdf`);
    } catch (error) {
      console.error("Error regenerating worksheet:", error);
       alert(`Error regenerating worksheet: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGenerating(false);
      setWorksheetIdToLoad("");
    }
  };

  return (
    <div className="space-y-4">
      {showLayoutWarning && (
        <div className="rounded-md bg-yellow-50 p-3 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.873-1.037 2.157-1.037 3.03 0l6.28 7.84c.873 1.038.681 1.882-.426 1.882H2.631c-1.107 0-1.299-.844-.426-1.882l6.28-7.84zm-.017 9.662H11.531v2h-3.063v-2zm0-7h3.063v5h-3.063v-5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Layout notice</h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>The current settings may create addition or subtraction questions with many terms. The worksheet layout will automatically adjust, but text may appear smaller or with different spacing.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="worksheetTitle" className="text-sm font-medium block mb-2">
            Worksheet Title (optional):
          </label>
          <Input
            id="worksheetTitle"
            type="text"
            placeholder="e.g., Abacus Practice Week 3"
            value={worksheetTitle}
            onChange={(e) => setWorksheetTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="numQuestions" className="text-sm font-medium block mb-2">
            Number of Questions:
          </label>
          <Input
            id="numQuestions"
            type="number"
            min="1"
            max="1000"
            value={numQuestions}
            onChange={(e) => {
              // Limit to 1000 questions maximum
              const value = parseInt(e.target.value) || 5;
              setNumQuestions(Math.min(value, 1000));
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="paperSize" className="text-sm font-medium block mb-2">
            Paper Size:
          </label>
          <select
            id="paperSize"
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="letter">Letter (8.5&quot; x 11&quot;)</option>
            <option value="a4">A4 (210mm x 297mm)</option>
          </select>
        </div>

        <div className="flex flex-col justify-end">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showQuestionNumbers}
                onChange={(e) => setShowQuestionNumbers(e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              Show Question Numbers
            </label>

            <label className="text-sm font-medium flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showDate}
                onChange={(e) => setShowDate(e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              Include Date on Worksheet
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Button
          onClick={generateWorksheet}
          disabled={isGenerating}
          className="flex-1"
        >
          {isGenerating ? "Generating..." : "Generate Worksheet"}
        </Button>

        <Button
          onClick={generateWorksheetWithAnswers}
          disabled={isGenerating}
          variant="outline"
          className="flex-1"
        >
          Generate Worksheet + Answer Key
        </Button>
      </div>

      <div className="border-t pt-4 mt-4">
        <Button
          onClick={() => setShowSavedWorksheets(!showSavedWorksheets)}
          variant="ghost"
          className="mb-2 text-sm"
        >
          {showSavedWorksheets ? "Hide Saved Worksheets" : "Show Saved Worksheets"}
        </Button>

        {showSavedWorksheets && (
          <div className="space-y-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label htmlFor="worksheetIdToLoad" className="text-sm font-medium block mb-2">
                  Worksheet ID:
                </label>
                <Input
                  id="worksheetIdToLoad"
                  type="text"
                  placeholder="Enter worksheet ID"
                  value={worksheetIdToLoad}
                  onChange={(e) => setWorksheetIdToLoad(e.target.value)}
                />
              </div>
              <Button
                onClick={regenerateWorksheet}
                disabled={isGenerating || !worksheetIdToLoad.trim()}
                className="mb-0"
              >
                Regenerate
              </Button>
            </div>

            {savedWorksheets.length > 0 ? (
              <div className="max-h-48 overflow-y-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                       <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th> {/* Added Type column */}
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-2 whitespace-nowrap text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {savedWorksheets.slice().reverse().map((worksheet) => (
                      <tr key={worksheet.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                          {worksheet.id}
                        </td>
                         <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {worksheet.settings.operationType}
                        </td> {/* Display operation type */}
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {worksheet.title}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {worksheet.date}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => setWorksheetIdToLoad(worksheet.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                          >
                            Use
                          </button>
                          <button
                            onClick={() => deleteWorksheet(worksheet.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No saved worksheets yet.</p>
            )}
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground mt-2">
        Creates a printable PDF worksheet with {numQuestions} questions based on your current settings.
        The worksheet + answer key option creates two matching files with the same ID.
        Your worksheets are automatically saved for reuse later.
      </div>
    </div>
  )
}

export default WorksheetGenerator