import random

# Helper Functions
def get_first_digit(n):
    """
    Returns the first (most significant) digit of a positive integer n.
    Example: get_first_digit(345) == 3
    """
    if n <= 0:
        raise ValueError("Number must be positive for get_first_digit.")
    return int(str(n)[0])

def get_num_digits(n):
    """
    Returns the number of digits in an integer n.
    Example: get_num_digits(345) == 3
    """
    if n == 0:
        return 1
    if n < 0: # Should not happen based on problem constraints (mice/cat are positive)
        n = -n 
    return len(str(n))

# Generation Functions

def generate_type1_cat_greater_mice1_2digit(count):
    """
    Generates questions: 2 digits / 1 digit (cat > first digit of mice)
    Mice: 2 digits (10-99)
    Cat: 1 digit (1-9)
    Condition: Cat's digit > first digit of Mice
    """
    questions = set() # Use a set to automatically handle uniqueness
    max_attempts_per_question = 1000 # Safety break for finding each question
    
    attempts = 0
    while len(questions) < count and attempts < count * max_attempts_per_question:
        attempts += 1
        
        # Cat (C) must be 1-digit. For C > first_digit(Mice), C must be at least 2,
        # because first_digit(Mice) is at least 1 for a 2-digit number.
        cat = random.randint(2, 9)
        
        # Mice (M) must be 2 digits (10-99). M = Cat * Quotient (Q).
        # So, Q range is ceil(10/Cat) to floor(99/Cat).
        min_quotient = (10 + cat - 1) // cat 
        max_quotient = 99 // cat
        
        if min_quotient > max_quotient:
            continue # No valid quotient for this cat to make a 2-digit mice

        # Find suitable quotients
        possible_quotients = []
        for q_candidate in range(min_quotient, max_quotient + 1):
            mice_candidate = cat * q_candidate
            # Double check mice_candidate is 2-digit (should be by Q range)
            if 10 <= mice_candidate <= 99:
                if get_first_digit(mice_candidate) < cat:
                    possible_quotients.append(q_candidate)
        
        if possible_quotients:
            quotient = random.choice(possible_quotients)
            mice = cat * quotient
            questions.add((mice, cat))
            
    if len(questions) < count:
        print(f"Warning (Type 1): Generated only {len(questions)} of {count} requested questions.")
    return list(questions)


def generate_type2_cat_greater_mice1_3digit(count):
    """
    Generates questions: 3 digits / 1 digit (cat > first digit of mice)
    Mice: 3 digits (100-999)
    Cat: 1 digit (1-9)
    Condition: Cat's digit > first digit of Mice
    """
    questions = set()
    max_attempts_per_question = 1000
    
    attempts = 0
    while len(questions) < count and attempts < count * max_attempts_per_question:
        attempts += 1
        cat = random.randint(2, 9) # Cat must be >= 2
        
        # Mice (M) must be 3 digits (100-999). M = Cat * Q.
        # Q range: ceil(100/Cat) to floor(999/Cat).
        min_quotient = (100 + cat - 1) // cat
        max_quotient = 999 // cat

        if min_quotient > max_quotient:
            continue
            
        possible_quotients = []
        for q_candidate in range(min_quotient, max_quotient + 1):
            mice_candidate = cat * q_candidate
            if 100 <= mice_candidate <= 999: # Ensure 3-digit
                if get_first_digit(mice_candidate) < cat:
                    possible_quotients.append(q_candidate)
                
        if possible_quotients:
            quotient = random.choice(possible_quotients)
            mice = cat * quotient
            questions.add((mice, cat))

    if len(questions) < count:
        print(f"Warning (Type 2): Generated only {len(questions)} of {count} requested questions.")
    return list(questions)


def generate_type3_cat_equals_mice1_2or3digit(count):
    """
    Generates questions: 2 or 3 digits / 1 digit (cat = first digit of mice)
    Mice: 2 digits (10-99) or 3 digits (100-999)
    Cat: 1 digit (1-9)
    Condition: Cat's digit = first digit of Mice
    """
    questions = set()
    max_attempts_per_question = 1000
    
    attempts = 0
    while len(questions) < count and attempts < count * max_attempts_per_question:
        attempts += 1
        
        cat = random.randint(1, 9)
        num_mice_digits = random.choice([2, 3])
        
        possible_quotients = []
        if num_mice_digits == 2:
            # Mice (M) is 2 digits [10,99].
            min_quotient = (10 + cat - 1) // cat
            max_quotient = 99 // cat
            if min_quotient > max_quotient: continue

            for q_candidate in range(min_quotient, max_quotient + 1):
                mice_candidate = cat * q_candidate
                if 10 <= mice_candidate <= 99 and get_first_digit(mice_candidate) == cat:
                    possible_quotients.append(q_candidate)
        else: # num_mice_digits == 3
            # Mice (M) is 3 digits [100,999].
            min_quotient = (100 + cat - 1) // cat
            max_quotient = 999 // cat
            if min_quotient > max_quotient: continue
            
            for q_candidate in range(min_quotient, max_quotient + 1):
                mice_candidate = cat * q_candidate
                if 100 <= mice_candidate <= 999 and get_first_digit(mice_candidate) == cat:
                    possible_quotients.append(q_candidate)
        
        if possible_quotients:
            quotient = random.choice(possible_quotients)
            mice = cat * quotient
            questions.add((mice, cat))

    if len(questions) < count:
        print(f"Warning (Type 3): Generated only {len(questions)} of {count} requested questions.")
    return list(questions)


def generate_type4_cat_smaller_mice1_2digit(count):
    """
    Generates questions: 2 digits / 1 digit (cat < first digit of mice)
    Mice: 2 digits (10-99)
    Cat: 1 digit (1-9)
    Condition: Cat's digit < first digit of Mice
    """
    questions = set()
    max_attempts_per_question = 1000

    attempts = 0
    while len(questions) < count and attempts < count * max_attempts_per_question:
        attempts += 1
        
        # Cat (C) can be 1-8. If C=9, first_digit(Mice) cannot be > C (max first_digit is 9).
        cat = random.randint(1, 8) 
        
        # Mice (M) must be 2 digits (10-99). M = Cat * Q.
        min_quotient = (10 + cat - 1) // cat
        max_quotient = 99 // cat
        
        if min_quotient > max_quotient:
            continue

        possible_quotients = []
        for q_candidate in range(min_quotient, max_quotient + 1):
            mice_candidate = cat * q_candidate
            if 10 <= mice_candidate <= 99:
                if get_first_digit(mice_candidate) > cat:
                    possible_quotients.append(q_candidate)
        
        if possible_quotients:
            quotient = random.choice(possible_quotients)
            mice = cat * quotient
            questions.add((mice, cat))
                
    if len(questions) < count:
        print(f"Warning (Type 4): Generated only {len(questions)} of {count} requested questions.")
    return list(questions)


def generate_type5_any_digits_no_restriction(count, min_mice_digits=2, max_mice_digits=5):
    """
    Generates questions: Any number of digits / 1 digit (no restriction)
    Mice: min_mice_digits to max_mice_digits (default 2 to 5 digits)
    Cat: 1 digit (1-9)
    No specific restriction on cat vs. first digit of mice.
    Soroban rules imply mice should have at least 2 digits if cat is 1 digit.
    """
    if min_mice_digits < 2:
        print("Warning (Type 5): min_mice_digits should be at least 2 for typical Soroban division with 1-digit cat. Adjusting to 2.")
        min_mice_digits = 2
    if min_mice_digits > max_mice_digits:
        raise ValueError("min_mice_digits cannot be greater than max_mice_digits.")

    questions = set()
    max_attempts_per_question = 1000
    
    attempts = 0
    while len(questions) < count and attempts < count * max_attempts_per_question:
        attempts += 1
        
        cat = random.randint(1, 9)
        num_m_digits = random.randint(min_mice_digits, max_mice_digits)
        
        min_mice_val = 10**(num_m_digits - 1)
        max_mice_val = (10**num_m_digits) - 1
        
        # Q range: ceil(min_M/Cat) to floor(max_M/Cat)
        min_quotient = (min_mice_val + cat - 1) // cat
        max_quotient = max_mice_val // cat
        
        if min_quotient > max_quotient: 
            continue # No quotient produces mice in the desired digit range for this cat
            
        quotient = random.randint(min_quotient, max_quotient)
        mice = cat * quotient
        
        # Final check for digit count (should be guaranteed by Q range, but good for safety)
        if get_num_digits(mice) == num_m_digits:
            questions.add((mice, cat))
                
    if len(questions) < count:
        print(f"Warning (Type 5): Generated only {len(questions)} of {count} requested questions for {min_mice_digits}-{max_mice_digits} digit mice.")
    return list(questions)


if __name__ == '__main__':
    num_questions_to_generate = 5

    print(f"Type 1: 2 digits / 1 digit (cat > first digit of mice)")
    q_type1 = generate_type1_cat_greater_mice1_2digit(num_questions_to_generate)
    for m, c in q_type1:
        print(f"{m} / {c} (Quotient: {m//c}, Cat: {c}, Mice_1st_digit: {get_first_digit(m)})")
    print("-" * 30)

    print(f"Type 2: 3 digits / 1 digit (cat > first digit of mice)")
    q_type2 = generate_type2_cat_greater_mice1_3digit(num_questions_to_generate)
    for m, c in q_type2:
        print(f"{m} / {c} (Quotient: {m//c}, Cat: {c}, Mice_1st_digit: {get_first_digit(m)})")
    print("-" * 30)

    print(f"Type 3: 2 or 3 digits / 1 digit (cat = first digit of mice)")
    q_type3 = generate_type3_cat_equals_mice1_2or3digit(num_questions_to_generate)
    for m, c in q_type3:
        print(f"{m} / {c} (Quotient: {m//c}, Cat: {c}, Mice_1st_digit: {get_first_digit(m)})")
    print("-" * 30)

    print(f"Type 4: 2 digits / 1 digit (cat < first digit of mice)")
    q_type4 = generate_type4_cat_smaller_mice1_2digit(num_questions_to_generate)
    for m, c in q_type4:
        print(f"{m} / {c} (Quotient: {m//c}, Cat: {c}, Mice_1st_digit: {get_first_digit(m)})")
    print("-" * 30)

    print(f"Type 5: Any number of digits (2-4) / 1 digit (no restriction)")
    q_type5 = generate_type5_any_digits_no_restriction(num_questions_to_generate, min_mice_digits=2, max_mice_digits=4)
    for m, c in q_type5:
        print(f"{m} / {c} (Quotient: {m//c}, Mice_digits: {get_num_digits(m)})")
    print("-" * 30)
    
    print(f"Type 5: Any number of digits (4-6) / 1 digit (no restriction)")
    q_type5_large = generate_type5_any_digits_no_restriction(num_questions_to_generate, min_mice_digits=4, max_mice_digits=6)
    for m, c in q_type5_large:
        print(f"{m} / {c} (Quotient: {m//c}, Mice_digits: {get_num_digits(m)})")
    print("-" * 30)
