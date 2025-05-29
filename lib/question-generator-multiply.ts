import { QuestionSettings, Question, OperationType } from '../lib/question-types';

/**
 * Gets the indices of '0' characters in a rule string part.
 * These are used to fix zeros in the generated numbers.
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
 * Generates a random N-digit number string.
 * First digit of a multi-digit number will be 1-9.
 * Respects fixed zero positions.
 */


/**
 * Helper function to check if a product satisfies a given rule character.
 */
function product_satisfies_rule(product: number, rule_char: string): boolean {
    switch (rule_char) {
        case 'a': return true;
        case 's': return product > 0 && product < 10;
        case 'd': return product >= 10;
        case '0': return product === 0;
        default:
            console.error(`product_satisfies_rule: Invalid rule character: ${rule_char}`);
            return false;
    }
}

/**
 * Shuffles an array in place.
 */
function shuffle_array<T>(array: T[], rng: () => number): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Selects a random element from an array.
 */
function random_choice_from_array<T>(arr: T[], rng: () => number): T | undefined {
    if (arr.length === 0) return undefined;
    return arr[Math.floor(rng() * arr.length)];
}

/**
 * Pre-computes a list of plausible digits for a single position,
 * given the constraints on it and a guess for the possible digits of the other number.
 * @param isTargetPosFirstDigit Is the current digit position the first digit of its number?
 * @param isTargetPosFixedZero Is the current digit position a fixed zero?
 * @param constraintsOnTargetPos Array of rule characters applying to this target digit (e.g., ['s', 'd'] if target is x_i, and y has 2 digits).
 * @param otherNumPossibleDigitsPerPos Array of arrays, guessing possible digits for each position of the *other* number.
 * @returns Array of valid digits for the target position.
 */
function getPlausibleDigitsForPosition(
    isTargetPosFirstDigit: boolean,
    isTargetPosFixedZero: boolean,
    constraintsOnTargetPos: string[],
    otherNumPossibleDigitsPerPos: Array<number[]>
): number[] {
    if (isTargetPosFixedZero) return [0];

    const valid_digits: number[] = [];
    const candidate_target_digits = isTargetPosFirstDigit ? [1,2,3,4,5,6,7,8,9] : [0,1,2,3,4,5,6,7,8,9];

    for (const cand_target_digit of candidate_target_digits) {
        let can_satisfy_all_constraints = true;
        // Check against each constraint (each constraint corresponds to a digit of the other number)
        for (let other_pos = 0; other_pos < constraintsOnTargetPos.length; other_pos++) {
            const rule_char = constraintsOnTargetPos[other_pos];
            // Possible partner digits for the current digit of the "other" number
            const possible_partners_for_this_constraint = otherNumPossibleDigitsPerPos[other_pos];
            
            if (!possible_partners_for_this_constraint || possible_partners_for_this_constraint.length === 0) {
                // If the other number has no possible digits at this position, this path is invalid.
                // This might happen if pre-computation for the other number already failed.
                can_satisfy_all_constraints = false;
                break;
            }

            let found_partner_for_this_constraint = false;
            for (const partner_digit of possible_partners_for_this_constraint) {
                if (product_satisfies_rule(cand_target_digit * partner_digit, rule_char)) {
                    found_partner_for_this_constraint = true;
                    break;
                }
            }
            if (!found_partner_for_this_constraint) {
                can_satisfy_all_constraints = false;
                break;
            }
        }
        if (can_satisfy_all_constraints) {
            valid_digits.push(cand_target_digit);
        }
    }
    return valid_digits;
}


function generateTimesTableQuestion(settings: QuestionSettings): Question {
    const term1Max = settings.timesTableTerm1Max ?? 9;
    const term2Max = settings.timesTableTerm2Max ?? 9;
    const rng = settings.rng;

    const term1 = Math.floor(rng() * term1Max) + 1;
    const term2 = Math.floor(rng() * term2Max) + 1;
    const answer = term1 * term2;

    return {
        operands: [term1, term2],
        expectedAnswer: answer,
        operationType: OperationType.MULTIPLY,
        questionString: `${term1} x ${term2} =`,
    };
}

/**
 * Generates a single, random multiplication question.
 */
export function generateMultiplicationQuestion(
    settings: QuestionSettings
): Question {
    if (settings.isTimesTableMode === true) {
        return generateTimesTableQuestion(settings);
    }
    const processedRules = settings.processedRules;
    const rng = settings.rng;
    const MAX_MAIN_ATTEMPTS = 100;
    const MAX_Y_CONSTRUCTION_ATTEMPTS = 20;

    if (!processedRules || processedRules.length === 0 || processedRules.some(part => part.length === 0)) {
        console.error(`generateMultiplicationQuestion: Invalid rules: "${settings.ruleString}"`);
        return { operands: [0,0], expectedAnswer: 0, questionString: "0 x 0 =", operationType: OperationType.MULTIPLY };
    }

    const xDigits = processedRules[0].length;
    const yDigits = processedRules.length;
    const xFixedZeroIndices = getZeroIndices(processedRules[0]);

    // --- Precompute plausible_x_digits_per_pos ---
    const plausible_x_digits_per_pos: Array<number[]> = new Array(xDigits);
    const initial_y_digits_guess: Array<number[]> = [];
    for(let j=0; j < yDigits; j++) {
        initial_y_digits_guess.push( (j === 0 && yDigits > 0) ? [1,2,3,4,5,6,7,8,9] : [0,1,2,3,4,5,6,7,8,9] );
    }

    for (let i = 0; i < xDigits; i++) {
        const is_fixed_zero = xFixedZeroIndices.includes(i);
        // Constraints on x_i are [rule(x_i*y_0), rule(x_i*y_1), ..., rule(x_i*y_{yDigits-1})]
        // which means processedRules[j][i] for j=0..yDigits-1
        const constraints_on_x_i = processedRules.map(rulePart => rulePart[i]);
        plausible_x_digits_per_pos[i] = getPlausibleDigitsForPosition(
            i === 0 && xDigits > 1 && !is_fixed_zero,
            is_fixed_zero,
            constraints_on_x_i,
            initial_y_digits_guess,
        );
        if (plausible_x_digits_per_pos[i].length === 0 && !is_fixed_zero) {
             console.warn(`No plausible initial digits for x[${i}]. Rule: ${settings.ruleString}`);
             return { operands: [0,0], expectedAnswer: 0, questionString: "0 x 0 =", operationType: OperationType.MULTIPLY };
        }
    }

    // --- Precompute plausible_y_digits_per_pos ---
    const plausible_y_digits_per_pos: Array<number[]> = new Array(yDigits);
    const initial_x_digits_guess: Array<number[]> = [];
     for(let i=0; i < xDigits; i++) {
        const is_fixed_zero = xFixedZeroIndices.includes(i);
        if(is_fixed_zero) initial_x_digits_guess.push([0]);
        else initial_x_digits_guess.push( (i === 0 && xDigits > 1) ? [1,2,3,4,5,6,7,8,9] : [0,1,2,3,4,5,6,7,8,9] );
    }

    for (let j = 0; j < yDigits; j++) {
        // Constraints on y_j are [rule(x_0*y_j), rule(x_1*y_j), ..., rule(x_{xDigits-1}*y_j)]
        // which means processedRules[j][i] for i=0..xDigits-1, i.e., the rulePart itself
        const constraints_on_y_j = processedRules[j].split('');
        plausible_y_digits_per_pos[j] = getPlausibleDigitsForPosition(
            j === 0 && yDigits > 0,
            false, // y digits are not fixed zero by rule structure
            constraints_on_y_j,
            initial_x_digits_guess,
        );
         if (plausible_y_digits_per_pos[j].length === 0) {
             console.warn(`No plausible initial digits for y[${j}]. Rule: ${settings.ruleString}`);
             return { operands: [0,0], expectedAnswer: 0, questionString: "0 x 0 =", operationType: OperationType.MULTIPLY };
        }
    }

    for (let mainAttempt = 0; mainAttempt < MAX_MAIN_ATTEMPTS; mainAttempt++) {
        // 1. Construct xStr using plausible_x_digits_per_pos
        const xStrDigits: string[] = [];
        let xConstructionPossible = true;
        for(let i=0; i < xDigits; i++) {
            const candidates = plausible_x_digits_per_pos[i];
            if (candidates.length === 0) { // Should be caught by pre-computation check
                xConstructionPossible = false;
                break;
            }
            const chosenDigit = random_choice_from_array(candidates, rng);
            if (chosenDigit === undefined) { // Should not happen if candidates.length > 0
                 xConstructionPossible = false;
                 break;
            }
            // Ensure first digit of multi-digit x is not 0 unless it's a fixed zero
            if (i === 0 && xDigits > 1 && chosenDigit === 0 && !xFixedZeroIndices.includes(i)) {
                // This chosen '0' for the first digit is problematic if not fixed.
                // Try to pick a non-zero candidate if available.
                const nonZeroCandidates = candidates.filter(d => d !== 0);
                if (nonZeroCandidates.length > 0) {
                    xStrDigits.push(String(random_choice_from_array(nonZeroCandidates, rng)));
                } else {
                    // Only '0' was plausible and it's not fixed zero - this x is problematic.
                    xConstructionPossible = false; break;
                }
            } else {
                 xStrDigits.push(String(chosenDigit));
            }
        }

        if (!xConstructionPossible) continue; // Try a new mainAttempt for x

        const xStr = xStrDigits.join('');
        const xNum = parseInt(xStr);

        // 2. Construct y for this xStr
        for (let yAttempt = 0; yAttempt < MAX_Y_CONSTRUCTION_ATTEMPTS; yAttempt++) {
            const yCandidateDigits: number[] = new Array(yDigits);
            let yConstructionSucceeded = true;

            for (let j = 0; j < yDigits; j++) { // For each digit of y
                const currentRulePart = processedRules[j];
                let chosen_y_digit_for_this_j: number | undefined = undefined;

                // Start with pre-filtered plausible digits for y[j]
                const digit_candidates_for_y_j = plausible_y_digits_per_pos[j].slice();
                shuffle_array(digit_candidates_for_y_j, rng);

                for (const y_d_candidate of digit_candidates_for_y_j) {
                    // First digit of y must be > 0 if y has multiple digits.
                    // If y has one digit, it can be 0 only if rules allow (e.g. x * 0 = 0).
                    if (j === 0 && yDigits > 0 && y_d_candidate === 0) {
                        // If it's the first digit and it's 0, only allow if y is single-digit
                        // OR if all rules for this y_d_candidate are '0' (implying 0 is expected)
                        // This logic is tricky; for now, if y_search_start was 1-9, this won't be 0.
                        // If plausible_y_digits_per_pos[0] includes 0, it means 0 *could* work.
                        // Let's refine: if yDigits > 1, first digit of y cannot be 0.
                        if (yDigits > 1 && y_d_candidate === 0) continue;
                    }

                    let is_y_d_candidate_valid_for_all_x_digits = true;
                    for (let i = 0; i < xDigits; i++) {
                        const x_digit_val = parseInt(xStr[i]);
                        const rule_char = currentRulePart[i];
                        const product = x_digit_val * y_d_candidate;
                        if (!product_satisfies_rule(product, rule_char)) {
                            is_y_d_candidate_valid_for_all_x_digits = false;
                            break;
                        }
                    }

                    if (is_y_d_candidate_valid_for_all_x_digits) {
                        chosen_y_digit_for_this_j = y_d_candidate;
                        break;
                    }
                }

                if (chosen_y_digit_for_this_j === undefined) {
                    yConstructionSucceeded = false;
                    break;
                }
                yCandidateDigits[j] = chosen_y_digit_for_this_j;
            }

            if (yConstructionSucceeded) {
                const yStr = yCandidateDigits.join('');
                const yNum = parseInt(yStr);

                // Final check for y: if y is multi-digit, it shouldn't be 0 (e.g. "00")
                // and its first digit shouldn't be 0.
                if (yDigits > 1 && (yNum === 0 || yCandidateDigits[0] === 0)) {
                    continue; // This y is not well-formed for multi-digit, try another yAttempt.
                }
                // If y is single digit and yNum is 0, it's acceptable if rules led to it.

                return {
                    operands: [xNum, yNum],
                    expectedAnswer: xNum * yNum,
                    questionString: `${xNum} x ${yNum} =`,
                    operationType: OperationType.MULTIPLY,
                };
            }
        } // End yConstruction attempt loop
    } // End mainAttempt loop

    console.warn(`generateMultiplicationQuestion: Could not generate a question for rule "${settings.ruleString}" after ${MAX_MAIN_ATTEMPTS} main attempts with pre-filtering.`);
    return { operands: [0,0], expectedAnswer: 0, questionString: "0 x 0 =", operationType: OperationType.MULTIPLY };
}
