import { QuestionSettings, Question, OperationType } from '../lib/question-types';

/**
 * Parses a rule string according to PHP script's logic.
 * - Converts to lowercase, 'o' to '0'.
 * - Splits by '+' (and trims parts).
 * - For each part: removes invalid chars (keeps 'a','s','d','0'),
 * then LTRIMS '0's from the start of the part, then caps length at 6.
 * - Filters out empty parts. Defaults to ["s"] if all parts become invalid.
 * - Validates all remaining parts against the first part's length and "zero pattern".
 * (Zero pattern: 's0s' -> "101", 'd' -> "1" - compared as numerical values of binary strings).
 * @param ruleString The input rule string (e.g., "ss + sd", "0s + d0a").
 * @returns An array of processed, validated rule strings, or null if fundamentally invalid.
 */

/**
 * Gets the indices of '0' characters in a rule string part.
 * These are used to fix zeros in the generated numbers.
 * @param rulePart A single processed rule string (e.g., "s0d").
 * @returns Array of indices where '0' appears.
 */
function getZeroIndices(rulePart: string): number[] {
    const indices: number[] = [];
    for (let i = 0; i < rulePart.length; i++) {
        if (rulePart[i] === '0') {
            indices.push(i);
        }
    }
    return indices;
}

/**
 * Generates a random N-digit number as a string, with specific digit positions fixed to '0'.
 * The first digit of a multi-digit number will be 1-9 unless it's a fixed '0'.
 * @param numDigits The total number of digits the number string should have.
 * @param rng Random number generator function.
 * @param fixedZeroIndices Array of 0-based indices that must be '0'.
 * @returns A string representing the generated number. Returns empty string if numDigits <= 0.
 */
function generateRandomNumberString(
    numDigits: number,
    rng: () => number,
    fixedZeroIndices: number[]
): string {
    if (numDigits <= 0) return "";

    let s_digits: string[] = new Array(numDigits);
    for (let i = 0; i < numDigits; i++) {
        if (fixedZeroIndices.includes(i)) {
            s_digits[i] = "0";
        } else {
            // First digit of a multi-digit number (that isn't fixed to '0') must be 1-9.
            // Single digit numbers or subsequent digits (not fixed to '0') can be 0-9.
            if (i === 0 && numDigits > 1) {
                s_digits[i] = String(Math.floor(rng() * 9) + 1); // 1-9
            } else {
                s_digits[i] = String(Math.floor(rng() * 10));    // 0-9
            }
        }
    }
    return s_digits.join('');
}

/**
 * Checks if a multiplication pair (x, y) satisfies the processed rules.
 * @param x The first number (multiplicand).
 * @param y The second number (multiplier).
 * @param processedRules Array of validated rule strings.
 * @param xExpectedDigits Expected number of digits for x (length of a rule part).
 * @param yExpectedDigits Expected number of digits for y (number of rules).
 * @returns True if the pair is valid, false otherwise.
 */
function checkRule(
    x: number,
    y: number,
    processedRules: string[],
    xExpectedDigits: number,
    yExpectedDigits: number
): boolean {
    // Convert numbers to strings, padding with leading zeros to match expected digit count.
    // This ensures that a number like 25 for 3 digits becomes "025" for digit-wise access.
    const xStrDigits = String(x).padStart(xExpectedDigits, '0').split('');
    const yStrDigits = String(y).padStart(yExpectedDigits, '0').split('');

    // This check ensures that the numbers, after padding, match the expected digit counts.
    // E.g. if x=123 and xExpectedDigits=2, padStart won't truncate, xStrDigits would be ["1","2","3"].
    // The generator should ideally produce numbers whose string form (after parseInt) is <= expectedDigits.
    // The padStart handles cases like x=5, xExpectedDigits=2 -> "05".
    if (xStrDigits.length !== xExpectedDigits || yStrDigits.length !== yExpectedDigits) {
         // This condition implies that the number itself has more digits than expected,
         // e.g., x=123, xExpectedDigits=2. This pair should be invalid.
        return false;
    }

    // Iterate through each rule part (corresponds to each digit of y)
    for (let j = 0; j < processedRules.length; j++) {
        const yDigitVal = parseInt(yStrDigits[j]);
        const currentRulePart = processedRules[j]; // e.g., "s0d"

        // Iterate through each character of the current rule part (corresponds to each digit of x)
        for (let i = 0; i < currentRulePart.length; i++) {
            const xDigitVal = parseInt(xStrDigits[i]);
            const ruleChar = currentRulePart[i]; // 'a', 's', 'd', or '0'
            const product = xDigitVal * yDigitVal;

            switch (ruleChar) {
                case 'a': // All products are fine
                    break;
                case 's': // Single digit product (must be > 0)
                    if (!(product > 0 && product < 10)) return false;
                    break;
                case 'd': // Double digit product (or more)
                    if (!(product >= 10)) return false;
                    break;
                case '0': // Product must be exactly 0
                    if (!(product === 0)) return false;
                    break;
                default:
                    // This case should not be reached if parseRules is correct
                    console.error(`checkRule: Invalid rule character encountered: ${ruleChar}`);
                    return false;
            }
        }
    }
    return true; // All checks passed
}

/**
 * Generates a single, random multiplication question based on a rule string.
 * @param settings Object containing the random number generator `rng`.
 * @returns A Question object with operands, expected answer, and question string.
 */
export function generateMultiplicationQuestion(
    settings: QuestionSettings
): Question {
    const processedRules = settings.processedRules;

    if (!processedRules || processedRules.length === 0 || processedRules[0].length === 0) {
        console.error(`generateMultiplicationQuestion: Invalid or empty rules after parsing ruleString: "${settings.ruleString}"`);
        return {
            operands: [0, 0],
            expectedAnswer: 0,
            questionString: `0 x 0 =`,
            operationType: OperationType.MULTIPLY,
        };
    }

    const xDigits = processedRules[0].length; // Number of digits for x
    const yDigits = processedRules.length;   // Number of digits for y

    // Determine fixed zero positions for x from the first rule part
    // (rules are already validated to have consistent zero patterns with the first part)
    const xFixedZeroIndices = getZeroIndices(processedRules[0]);
    
    // y does not have fixed zeros based on its rule structure in the same way;
    // its digits are determined by the number of rule parts.
    const yFixedZeroIndices: number[] = [];

    // Maximum attempts to find a valid question.
    // This prevents infinite loops for very restrictive or impossible rules.
    const MAX_ATTEMPTS = 2000; 

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const xCandidateStr = generateRandomNumberString(xDigits, settings.rng, xFixedZeroIndices);
        const yCandidateStr = generateRandomNumberString(yDigits, settings.rng, yFixedZeroIndices);

        // generateRandomNumberString returns "" if digits <= 0, which should be caught by earlier checks.
        if (xCandidateStr === "" || yCandidateStr === "") {
            console.error("generateMultiplicationQuestion: Failed to generate candidate number strings.");
            continue; 
        }

        const xCandidate = parseInt(xCandidateStr);
        const yCandidate = parseInt(yCandidateStr);

        if (checkRule(xCandidate, yCandidate, processedRules, xDigits, yDigits)) {
            return {
                operands: [xCandidate, yCandidate],
                expectedAnswer: xCandidate * yCandidate,
                questionString: `${xCandidate} x ${yCandidate} =`,
                operationType: OperationType.MULTIPLY,
            };
        }
    }

    console.warn(`generateMultiplicationQuestion: Could not generate a question for rule "${settings.ruleString}" after ${MAX_ATTEMPTS} attempts.`);
    return {
                operands: [0, 0],
                expectedAnswer: 0,
                questionString: `0 x 0 =`,
                operationType: OperationType.MULTIPLY,
            };
}