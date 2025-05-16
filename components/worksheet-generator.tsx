"use client"

import { useState, useEffect } from "react"
import { jsPDF } from "jspdf"
import { Button } from "./ui/button"
import { Input } from "@/components/ui/input"
import { generateQuestion, QuestionSettings, Question } from "@/lib/question-generator"

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
  questions: Question[]
  settings: QuestionSettings
}

// Worksheet generator component
const WorksheetGenerator = ({ settings }: WorksheetGeneratorProps) => {
  // Load saved settings from localStorage on initial render
  const loadSavedSettings = (): WorksheetSettings => {
    if (typeof window === 'undefined') {
      return {
        numQuestions: 5,
        worksheetTitle: "",
        paperSize: "letter",
        showQuestionNumbers: true,
        showDate: true,
      };
    }
    
    const savedSettings = localStorage.getItem('worksheetSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error("Error loading saved worksheet settings:", e);
      }
    }
    
    return {
      numQuestions: 5,
      worksheetTitle: "",
      paperSize: "letter",
      showQuestionNumbers: true,
      showDate: true,
    };
  };

  // Load saved worksheets from localStorage
  const loadSavedWorksheets = (): StoredWorksheet[] => {
    if (typeof window === 'undefined') {
      return [];
    }
    
    const savedWorksheets = localStorage.getItem('savedWorksheets');
    if (savedWorksheets) {
      try {
        return JSON.parse(savedWorksheets);
      } catch (e) {
        console.error("Error loading saved worksheets:", e);
      }
    }
    
    return [];
  };

  // State with default values from saved settings
  const [numQuestions, setNumQuestions] = useState(5)
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

  // Check if current settings would create questions with many numbers
  useEffect(() => {
    // Warn if min or max numbers is high (which would create questions with many numbers)
    if (settings.minNumbers > 7 || settings.maxNumbers > 7) {
      setShowLayoutWarning(true);
    } else {
      setShowLayoutWarning(false);
    }
  }, [settings.minNumbers, settings.maxNumbers]);

  // Get formula description based on scenario number
  const getFormulaDescription = (scenario: number): string => {
    const formulas: Record<number, string> = {
      1: "Simple 1-4",
      2: "Simple 1-5",
      3: "Simple 1-9",
      4: "Friends +",
      5: "Friends +/-",
      6: "Relatives +",
      7: "Relatives +/-",
      8: "Mix +",
      9: "Mix +/-"
    };
    return formulas[scenario] || `Scenario ${scenario}`;
  };

  // Generate a unique worksheet ID
  const generateWorksheetId = (): string => {
    // Create a 6-character alphanumeric ID
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omitted similar characters like O/0, I/1
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  // Format current date as MM/DD/YYYY
  const getFormattedDate = (): string => {
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
  };

  // Save worksheet to localStorage
  const saveWorksheetToStorage = (worksheetId: string, questions: Question[]): void => {
    if (typeof window === 'undefined') {
      return;
    }
    
    // Create new stored worksheet object
    const newStoredWorksheet: StoredWorksheet = {
      id: worksheetId,
      title: worksheetTitle || `Worksheet ${getFormattedDate()}`,
      date: getFormattedDate(),
      questions: questions,
      settings: { ...settings }
    };
    
    // Add to existing worksheets
    const updatedWorksheets = [...savedWorksheets, newStoredWorksheet];
    
    // Only keep the most recent 20 worksheets
    if (updatedWorksheets.length > 20) {
      updatedWorksheets.shift(); // Remove oldest
    }
    
    // Save to state and localStorage
    setSavedWorksheets(updatedWorksheets);
    localStorage.setItem('savedWorksheets', JSON.stringify(updatedWorksheets));
  };

  // Delete a saved worksheet
  const deleteWorksheet = (worksheetId: string): void => {
    const updatedWorksheets = savedWorksheets.filter(
      worksheet => worksheet.id !== worksheetId
    );
    
    setSavedWorksheets(updatedWorksheets);
    localStorage.setItem('savedWorksheets', JSON.stringify(updatedWorksheets));
  };

  // Load a saved worksheet by ID
  const loadWorksheetById = (id: string): Question[] | null => {
    const worksheet = savedWorksheets.find(w => w.id === id);
    return worksheet ? worksheet.questions : null;
  };

  // Create worksheet PDF
  const createWorksheetPdf = (questions: Question[], showAnswers: boolean = false, worksheetId: string): jsPDF => {
    // Initialize PDF with selected paper size
    const pdf = paperSize === "a4" 
      ? new jsPDF({ format: "a4" })
      : new jsPDF(); // Default is letter size
    
    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    
    // Add title with formula type
    const formulaType = getFormulaDescription(settings.scenario);
    pdf.setFontSize(14);
    
    // Different title for worksheet vs answer sheet with custom title if provided
    let title;
    if (worksheetTitle.trim()) {
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
    
    // Set default font size
    pdf.setFontSize(10);
    
    // Define layout
    const margin = 10;
    
    // Determine optimal column count based on max numbers in questions
    // Calculate max numbers in any question to determine grid layout
    const maxNumbersInAnyQuestion = Math.max(...questions.map(q => q.numbers.length));
    
    // Adjust columns based on the max numbers in questions
    let columns = 5; // Default 5 questions per row
    if (maxNumbersInAnyQuestion > 12) {
      columns = 3; // Further reduce for extremely long questions
    } else if (maxNumbersInAnyQuestion > 8) {
      columns = 4; // Reduce to 4 columns for very long questions
    }
    
    const questionWidth = (pageWidth - (margin * 2)) / columns; // Width per question
    const minQuestionHeight = 45; // Minimum height for questions
    const numberSpacing = 5; // Spacing between numbers
    
    // Dynamically adjust question height based on the maximum number of items
    // Base height + additional height for each item
    const baseLinesHeight = 5; // Number of lines that fit in the base height
    const additionalLines = Math.max(0, maxNumbersInAnyQuestion - baseLinesHeight);
    const dynamicQuestionHeight = minQuestionHeight + (additionalLines * numberSpacing);
    
    // Calculate rows per page based on the available height
    const headerFooterSpace = 35; // Space for headers, footers, margins
    const availableHeight = pageHeight - headerFooterSpace;
    const rowsPerPage = Math.max(1, Math.floor(availableHeight / dynamicQuestionHeight));
    const questionsPerPage = columns * rowsPerPage;
    
    // Arrange questions in a grid layout
    for (let i = 0; i < questions.length; i++) {
      // Calculate position
      const positionOnPage = i % questionsPerPage;
      const col = positionOnPage % columns;
      const row = Math.floor(positionOnPage / columns);
      
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
        
        pdf.setFontSize(10);
      }
      
      // Calculate coordinates
      const x = margin + (col * questionWidth);
      const startY = 25 + (row * dynamicQuestionHeight);
      
      // Calculate the center point of the question area
      const centerX = x + (questionWidth / 2);
      const lineWidth = 20; // Width of the answer line
      
      // Draw question number if enabled
      if (showQuestionNumbers) {
        pdf.setFont("helvetica", "bold");
        pdf.text(`${i + 1}.`, x, startY);
        pdf.setFont("helvetica", "normal");
      }
      
      // Get the current question
      const question = questions[i];
      
      // Calculate vertical adjustment if the question has fewer items than the max
      const itemsInCurrentQuestion = question.numbers.length;
      const verticalAdjustment = Math.max(0, (maxNumbersInAnyQuestion - itemsInCurrentQuestion) * numberSpacing / 2);
      
      // Draw each number centered, with adjustment to vertically center shorter questions
      let localY = startY + verticalAdjustment;
      const questionNumbers = question.numbers.map((num: number) => 
        num < 0 ? num.toString() : Math.abs(num).toString()
      );
      
      questionNumbers.forEach((numText: string) => {
        const textWidth = pdf.getTextWidth(numText);
        pdf.text(numText, centerX - (textWidth / 2), localY);
        localY += numberSpacing;
      });
      
      // Place the line immediately after the last number with zero gap
      const lineY = localY - numberSpacing + 1;
      pdf.line(centerX - (lineWidth / 2), lineY, centerX + (lineWidth / 2), lineY);
      
      // Add the answer if this is an answer sheet
      if (showAnswers) {
        pdf.setFont("helvetica", "bold");
        const answerText = question.expectedAnswer.toString();
        const answerWidth = pdf.getTextWidth(answerText);
        pdf.text(answerText, centerX - (answerWidth / 2), lineY + 4);
        pdf.setFont("helvetica", "normal");
      }
    }
    
    return pdf;
  };

  // Generate new questions
  const generateNewQuestions = (count: number): Question[] => {
    const questions = [];
    for (let i = 0; i < count; i++) {
      questions.push(generateQuestion(settings));
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
      
      // Save worksheet to localStorage
      saveWorksheetToStorage(worksheetId, questions);
      
      // Create the worksheet PDF
      const pdf = createWorksheetPdf(questions, false, worksheetId);
      
      // Download PDF
      pdf.save(`worksheet-${worksheetId}.pdf`);
    } catch (error) {
      console.error("Error generating worksheet:", error);
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
      
      // Save worksheet to localStorage
      saveWorksheetToStorage(worksheetId, questions);
      
      // Create the worksheet PDF
      const worksheet = createWorksheetPdf(questions, false, worksheetId);
      
      // Create the answer sheet PDF
      const answerSheet = createWorksheetPdf(questions, true, worksheetId);
      
      // Download both PDFs
      worksheet.save(`worksheet-${worksheetId}.pdf`);
      answerSheet.save(`answers-${worksheetId}.pdf`);
    } catch (error) {
      console.error("Error generating worksheet with answers:", error);
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
      // Load questions from saved worksheet
      const questions = loadWorksheetById(worksheetIdToLoad);
      
      if (!questions) {
        alert(`No worksheet found with ID: ${worksheetIdToLoad}`);
        setIsGenerating(false);
        return;
      }
      
      // Create the worksheet PDF
      const worksheet = createWorksheetPdf(questions, false, worksheetIdToLoad);
      
      // Create the answer sheet PDF
      const answerSheet = createWorksheetPdf(questions, true, worksheetIdToLoad);
      
      // Download both PDFs
      worksheet.save(`worksheet-${worksheetIdToLoad}.pdf`);
      answerSheet.save(`answers-${worksheetIdToLoad}.pdf`);
    } catch (error) {
      console.error("Error regenerating worksheet:", error);
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
                <p>The current settings may create questions with many numbers. The worksheet layout will automatically adjust, but text may appear smaller or with different spacing.</p>
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
                        Title
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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