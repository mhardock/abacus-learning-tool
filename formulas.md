## **Soroban Single-Digit Arithmetic: Allowed Partners (Revised)**

This document outlines various scenarios for single-digit arithmetic on a soroban, detailing the allowed second operand (d2) for a given first operand (d1), including when d1 is 0\. It's designed to be used as input for an AI coding model or for human reference.

### **Introduction: Soroban Basics and Complements**

**1\. Representing Numbers on a Soroban:**

A soroban (Japanese abacus) consists of a frame with vertical rods. Each rod represents a place value (ones, tens, hundreds, etc., from right to left). A horizontal beam divides each rod into two sections:

* **Upper Beads (Heavenly Beads):** There is **one** bead above the beam on each rod. This bead has a value of **5** when moved *towards* the beam.  
* **Lower Beads (Earthly Beads):** There are **four** beads below the beam on each rod. Each of these beads has a value of **1** when moved *towards* the beam.

A number is represented on a rod by the beads moved towards the beam.

* **0:** All beads are away from the beam.  
* **1-4:** Push 1 to 4 lower beads up towards the beam.  
* **5:** Push the upper bead down towards the beam (all lower beads are down).  
* **6-9:** Push the upper bead down (value 5\) and 1 to 4 lower beads up (value 1-4). For example, 7 is the upper bead (5) \+ two lower beads (2).

**2\. 5s Complements (Small Friends / Gofriends):**

5s complements are used for addition or subtraction on a single rod when a direct manipulation of beads for a digit (1-4) isn't possible without involving the 5-bead (the heavenly bead). They simplify operations by using the 5-bead as an intermediary.

* **Concept:** Instead of directly adding/subtracting a number, you add/subtract 5 and then subtract/add its "5s complement."  
* **Pairs (sum to 5):**  
  * 1 and 4  
  * 2 and 3  
* **Addition Example (e.g., 3 \+ 4):**  
  * You have 3 on the rod (three lower beads up). You want to add 4\.  
  * You don't have 4 more lower beads.  
  * Using 5s complement for adding 4: Add 5 (move upper bead down), then Subtract 1 (move one lower bead down). ( \+4 \= \+5 \- 1 )  
  * Result: 3 \+ 5 \- 1 \= 7\.  
* **Subtraction Example (e.g., 6 \- 3):**  
  * You have 6 on the rod (upper bead down, one lower bead up). You want to subtract 3\.  
  * You only have one lower bead up, so you can't directly subtract three lower beads.  
  * Using 5s complement for subtracting 3: Subtract 5 (move upper bead up), then Add 2 (move two lower beads up). ( \-3 \= \-5 \+ 2 )  
  * Result: 6 \- 5 \+ 2 \= 3\.

**3\. 10s Complements (Big Friends / Jufriends / Relatives):**

10s complements are used when an addition on a rod results in a sum greater than 9 (requiring a carry-over to the next rod to the left), or when a subtraction on a rod requires a borrow from the next rod to the left.

* **Concept:** Instead of directly adding/subtracting a number that would require a carry/borrow, you operate on the next rod (add 1 for carry, subtract 1 for borrow) and then perform a complementary operation on the current rod.  
* **Pairs (sum to 10):**  
  * 1 and 9  
  * 2 and 8  
  * 3 and 7  
  * 4 and 6  
  * 5 and 5  
* **Addition Example (e.g., 8 \+ 7 on the ones rod):**  
  * You have 8 on the ones rod. You want to add 7\.  
  * 8 \+ 7 \= 15, which is greater than 9\.  
  * Using 10s complement for adding 7: Add 1 to the tens rod (carry over the 10). On the ones rod, subtract the 10s complement of 7, which is 3\. ( \+7 \= \+10 \- 3 )  
  * Result: Tens rod shows 1, ones rod shows 8 \- 3 \= 5\. The number is 15\.  
* **Subtraction Example (e.g., 12 \- 7, focusing on the ones rod 2 \- 7):**  
  * You have 1 on the tens rod and 2 on the ones rod. You want to subtract 7\.  
  * On the ones rod, you cannot subtract 7 from 2 directly.  
  * Using 10s complement for subtracting 7: Subtract 1 from the tens rod (borrow 10). On the ones rod, add the 10s complement of 7, which is 3\. ( \-7 \= \-10 \+ 3 )  
  * Result: Tens rod shows 0\. Ones rod shows 2 \+ 3 \= 5\. The number is 5\.

**Definitions for Scenarios Below:**

* d1: The initial digit on a soroban rod (can be 0-9, depending on the scenario).  
* d2: The digit to be added to or subtracted from d1 (typically 1-9, depending on the scenario).  
* **No 5s Complement**: Operations must be performed by direct bead manipulation without using 5-complement techniques (e.g., adding 4 as \+5-1 is disallowed). The logic for determining this follows the principles outlined in the "Algorithm for Soroban Questions (No Complements) \- Revised" document (specifically, the is\_direct\_add and is\_direct\_subtract functions, which check for no 5s *and* no 10s complement for a single rod operation).  
* **No 10s Complement**:  
  * For addition: d1 \+ d2 must be ≤9.  
  * For subtraction: d1 \- d2 must be ≥0.  
* **5s Complement Allowed**: The restriction against using 5-complement techniques *for the overall d1 vs d2 operation* is lifted. However, specific rules apply if a 10s complement is also involved (see Relatives, Mix \+, and Mix \+/- scenarios).  
* **10s Complement Allowed**:  
  * For addition: d1 \+ d2 can be \>9.  
  * For subtraction: d1 \- d2 can be \<0 (implying a borrow from the left rod is used). **Note:** For subtraction where d2 \> d1 on a given rod (thus requiring a 10s complement/borrow), this is only practically possible if the overall value on the abacus across all rods allows for a borrow from the next higher-value rod (e.g., the total value is ≥10 if borrowing from the tens rod for an operation on the ones rod).  
* **Relatives Scenarios (New Rule):** If a 10s complement is used for the overall d1 vs d2 operation:  
  * For addition (d1+d2 \> 9): The rod operation d1 \- (10-d2) must be possible *without* using a 5s complement (and without a further 10s complement, i.e., it's a direct subtraction on the rod).  
  * For subtraction (d1-d2 \< 0): The rod operation d1 \+ (10-d2) must be possible *without* using a 5s complement (and without a further 10s complement, i.e., it's a direct addition on the rod).

### **Scenario 1: Simple 1-4**

* **Rules:**  
  * d1 ranges from 0 to 4\.  
  * d2 ranges from 1 to 4\.  
  * No 5s complement allowed.  
  * No 10s complement allowed.  
  * For addition, the sum d1 \+ d2 must also be ≤4.  
  * For subtraction, the difference d1 \- d2 must be ≥0.  
* **Addition: d1 \+ d2 \= sum (sum** ≤4**, no 5s/10s comp)**  
  * d1 \= 0: d2 \\in \[1, 2, 3, 4\]  
  * d1 \= 1: d2 \\in \[1, 2, 3\]  
  * d1 \= 2: d2 \\in \[1, 2\]  
  * d1 \= 3: d2 \\in \[1\]  
  * d1 \= 4: d2 \\in \[\]  
* **Subtraction: d1 \- d2 \= diff (diff** ≥0**, no 5s/10s comp)**  
  * d1 \= 0: d2 \\in \[\]  
  * d1 \= 1: d2 \\in \[1\]  
  * d1 \= 2: d2 \\in \[1, 2\]  
  * d1 \= 3: d2 \\in \[1, 2, 3\]  
  * d1 \= 4: d2 \\in \[1, 2, 3, 4\]

### **Scenario 2: Simple 1-5**

* **Rules:**  
  * d1 ranges from 0 to 9\.  
  * d2 ranges from 1 to 5\.  
  * No 5s complement allowed.  
  * No 10s complement allowed (sum d1+d2 \\le 9, difference d1-d2 \\ge 0).  
* **Addition: d1 \+ d2 \= sum (sum** ≤9**, d2 \\in \[1,5\], no 5s/10s comp)**  
  * d1 \= 0: d2 \\in \[1, 2, 3, 4, 5\]  
  * d1 \= 1: d2 \\in \[1, 2, 3, 5\]  
  * d1 \= 2: d2 \\in \[1, 2, 5\]  
  * d1 \= 3: d2 \\in \[1, 5\]  
  * d1 \= 4: d2 \\in \[5\]  
  * d1 \= 5: d2 \\in \[1, 2, 3, 4\]  
  * d1 \= 6: d2 \\in \[1, 2, 3\]  
  * d1 \= 7: d2 \\in \[1, 2\]  
  * d1 \= 8: d2 \\in \[1\]  
  * d1 \= 9: d2 \\in \[\]  
* **Subtraction: d1 \- d2 \= diff (diff** ≥0**, d2 \\in \[1,5\], no 5s/10s comp)**  
  * d1 \= 0: d2 \\in \[\]  
  * d1 \= 1: d2 \\in \[1\]  
  * d1 \= 2: d2 \\in \[1, 2\]  
  * d1 \= 3: d2 \\in \[1, 2, 3\]  
  * d1 \= 4: d2 \\in \[1, 2, 3, 4\]  
  * d1 \= 5: d2 \\in \[5\]  
  * d1 \= 6: d2 \\in \[1, 5\]  
  * d1 \= 7: d2 \\in \[1, 2, 5\]  
  * d1 \= 8: d2 \\in \[1, 2, 3, 5\]  
  * d1 \= 9: d2 \\in \[1, 2, 3, 4, 5\]

### **Scenario 3: Simple 1-9**

* **Rules:**  
  * d1 ranges from 0 to 9\.  
  * d2 ranges from 1 to 9\.  
  * No 5s complement allowed.  
  * No 10s complement allowed (sum d1+d2 \\le 9, difference d1-d2 \\ge 0).  
* **Addition: d1 \+ d2 \= sum (sum** ≤9**, no 5s/10s comp)**  
  * d1 \= 0: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 1: d2 \\in \[1, 2, 3, 5, 6, 7, 8\]  
  * d1 \= 2: d2 \\in \[1, 2, 5, 6, 7\]  
  * d1 \= 3: d2 \\in \[1, 5, 6\]  
  * d1 \= 4: d2 \\in \[5\]  
  * d1 \= 5: d2 \\in \[1, 2, 3, 4\]  
  * d1 \= 6: d2 \\in \[1, 2, 3\]  
  * d1 \= 7: d2 \\in \[1, 2\]  
  * d1 \= 8: d2 \\in \[1\]  
  * d1 \= 9: d2 \\in \[\]  
* **Subtraction: d1 \- d2 \= diff (diff** ≥0**, no 5s/10s comp)**  
  * d1 \= 0: d2 \\in \[\]  
  * d1 \= 1: d2 \\in \[1\]  
  * d1 \= 2: d2 \\in \[1, 2\]  
  * d1 \= 3: d2 \\in \[1, 2, 3\]  
  * d1 \= 4: d2 \\in \[1, 2, 3, 4\]  
  * d1 \= 5: d2 \\in \[5\]  
  * d1 \= 6: d2 \\in \[1, 5, 6\]  
  * d1 \= 7: d2 \\in \[1, 2, 5, 6, 7\]  
  * d1 \= 8: d2 \\in \[1, 2, 3, 5, 6, 7, 8\]  
  * d1 \= 9: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]

### **Scenario 4: Friends \+**

* **Rules:**  
  * d1 ranges from 0 to 9\.  
  * d2 ranges from 1 to 9\.  
  * **Addition:** 5s complement allowed. No 10s complement (sum d1+d2 \\le 9).  
  * **Subtraction:** No 5s complement allowed. No 10s complement (difference d1-d2 \\ge 0).  
* **Addition: d1 \+ d2 \= sum (sum** ≤9**, 5s comp allowed)**  
  * d1 \= 0: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 1: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8\]  
  * d1 \= 2: d2 \\in \[1, 2, 3, 4, 5, 6, 7\]  
  * d1 \= 3: d2 \\in \[1, 2, 3, 4, 5, 6\]  
  * d1 \= 4: d2 \\in \[1, 2, 3, 4, 5\]  
  * d1 \= 5: d2 \\in \[1, 2, 3, 4\]  
  * d1 \= 6: d2 \\in \[1, 2, 3\]  
  * d1 \= 7: d2 \\in \[1, 2\]  
  * d1 \= 8: d2 \\in \[1\]  
  * d1 \= 9: d2 \\in \[\]  
* **Subtraction: d1 \- d2 \= diff (diff** ≥0**, no 5s/10s comp)**  
  * (Same as Scenario 3 Subtraction)

### **Scenario 5: Friends \+/-**

* **Rules:**  
  * d1 ranges from 0 to 9\.  
  * d2 ranges from 1 to 9\.  
  * **Addition:** 5s complement allowed. No 10s complement (sum d1+d2 \\le 9).  
  * **Subtraction:** 5s complement allowed. No 10s complement (difference d1-d2 \\ge 0).  
* **Addition: d1 \+ d2 \= sum (sum** ≤9**, 5s comp allowed)**  
  * (Same as Scenario 4 Addition)  
* **Subtraction: d1 \- d2 \= diff (diff** ≥0**, 5s comp allowed)**  
  * d1 \= 0: d2 \\in \[\]  
  * d1 \= 1: d2 \\in \[1\]  
  * d1 \= 2: d2 \\in \[1, 2\]  
  * d1 \= 3: d2 \\in \[1, 2, 3\]  
  * d1 \= 4: d2 \\in \[1, 2, 3, 4\]  
  * d1 \= 5: d2 \\in \[1, 2, 3, 4, 5\]  
  * d1 \= 6: d2 \\in \[1, 2, 3, 4, 5, 6\]  
  * d1 \= 7: d2 \\in \[1, 2, 3, 4, 5, 6, 7\]  
  * d1 \= 8: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8\]  
  * d1 \= 9: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]

### **Scenario 6: Relatives \+**

* **Rules:**  
  * d1 ranges from 0 to 9\.  
  * d2 ranges from 1 to 9\.  
  * **Addition:** 5s complement allowed for the overall d1+d2. 10s complement allowed. If 10s complement is used, the rod operation d1 \- (10-d2) must not require a 5s complement.  
  * **Subtraction:** 5s complement allowed. No 10s complement (difference d1-d2 \\ge 0). (Note: For subtraction where d2 \> d1 on a given rod, which would imply a 10s complement/borrow, this scenario's "No 10s complement" rule for subtraction means such cases are not applicable here. If 10s complement *were* allowed for subtraction, it would only be practically possible if the overall value on the abacus allows for a borrow from the next higher-value rod.)  
* **Addition: d1 \+ d2 \= sum (New Rule Applied)**  
  * d1 \= 0: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 1: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 2: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 3: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 4: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 5: d2 \\in \[1, 2, 3, 4, 5\]  
  * d1 \= 6: d2 \\in \[1, 2, 3, 4, 5, 9\]  
  * d1 \= 7: d2 \\in \[1, 2, 3, 4, 5, 8, 9\]  
  * d1 \= 8: d2 \\in \[1, 2, 3, 4, 5, 7, 8, 9\]  
  * d1 \= 9: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
* **Subtraction: d1 \- d2 \= diff (diff** ≥0**, 5s comp allowed, no 10s comp)**  
  * (Same as Scenario 5 Subtraction)

### **Scenario 7: Relatives \+/-**

* **Rules:**  
  * d1 ranges from 0 to 9\.  
  * d2 ranges from 1 to 9\.  
  * **Addition:** (Same rules and list as Scenario 6 Addition \- New Rule Applied)  
  * **Subtraction:** 5s complement allowed for the overall d1-d2. 10s complement allowed. If 10s complement is used (i.e., d1-d2 \< 0), the rod operation d1 \+ (10-d2) must not require a 5s complement. (Note: For subtraction where d2 \> d1 on a given rod, this is only practically possible if the overall value on the abacus allows for a borrow from the next higher-value rod.)  
* **Addition: d1 \+ d2 \= sum (New Rule Applied)**  
  * (Same as Scenario 6 Addition)  
* **Subtraction: d1 \- d2 \= diff (New Rule Applied)**  
  * d1 \= 0: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 1: d2 \\in \[1, 2, 3, 4, 5, 7, 8, 9\]  
  * d1 \= 2: d2 \\in \[1, 2, 3, 4, 5, 8, 9\]  
  * d1 \= 3: d2 \\in \[1, 2, 3, 4, 5, 9\]  
  * d1 \= 4: d2 \\in \[1, 2, 3, 4, 5\]  
  * d1 \= 5: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 6: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 7: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 8: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 9: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]

### **Scenario 8: Mix \+**

* **Rules:**  
  * d1 ranges from 0 to 9\.  
  * d2 ranges from 1 to 9\.  
  * **Addition:** 5s complement allowed. 10s complement allowed. If 10s complement is used for d1+d2 (i.e., sum \> 9), the subsequent rod operation d1-(10-d2) *can* also use a 5s complement if needed. If no 10s complement is used (i.e., sum ≤9), 5s complement is allowed for d1+d2.  
  * **Subtraction:** 5s complement allowed. 10s complement allowed. If 10s complement is used for d1-d2 (i.e., diff \< 0), the subsequent rod operation d1+(10-d2) must *not* use a 5s complement. If no 10s complement is used (i.e., diff ≥0), 5s complement is allowed for d1-d2. (Note: For subtraction where d2 \> d1 on a given rod, this is only practically possible if the overall value on the abacus allows for a borrow from the next higher-value rod.)  
* **Addition: d1 \+ d2 \= sum**  
  * For all d1 \\in \[0,9\]: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
* **Subtraction: d1 \- d2 \= diff**  
  * (Same as Scenario 7: Relatives \+/- Subtraction)  
  * d1 \= 0: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 1: d2 \\in \[1, 2, 3, 4, 5, 7, 8, 9\]  
  * d1 \= 2: d2 \\in \[1, 2, 3, 4, 5, 8, 9\]  
  * d1 \= 3: d2 \\in \[1, 2, 3, 4, 5, 9\]  
  * d1 \= 4: d2 \\in \[1, 2, 3, 4, 5\]  
  * d1 \= 5: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 6: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 7: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 8: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
  * d1 \= 9: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]

### **Scenario 9: Mix \+/-**

* **Rules:**  
  * d1 ranges from 0 to 9\.  
  * d2 ranges from 1 to 9\.  
  * **Addition:** 5s complement allowed. 10s complement allowed. If 10s complement is used for d1+d2 (i.e., sum \> 9), the subsequent rod operation d1-(10-d2) *can* also use a 5s complement if needed. If no 10s complement is used (i.e., sum ≤9), 5s complement is allowed for d1+d2.  
  * **Subtraction:** 5s complement allowed. 10s complement allowed. If 10s complement is used for d1-d2 (i.e., diff \< 0), the subsequent rod operation d1+(10-d2) *can* also use a 5s complement if needed. If no 10s complement is used (i.e., diff ≥0), 5s complement is allowed for d1-d2. (Note: For subtraction where d2 \> d1 on a given rod, this is only practically possible if the overall value on the abacus allows for a borrow from the next higher-value rod.)  
* **Addition: d1 \+ d2 \= sum**  
  * For all d1 \\in \[0,9\]: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]  
* **Subtraction: d1 \- d2 \= diff**  
  * For all d1 \\in \[0,9\]: d2 \\in \[1, 2, 3, 4, 5, 6, 7, 8, 9\]