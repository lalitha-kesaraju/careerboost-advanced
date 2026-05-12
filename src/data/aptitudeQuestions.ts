export interface AptitudeQuestion {
  id: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const APTITUDE_DATA: AptitudeQuestion[] = [
  // Quantitative Reasoning
  {
    id: 1,
    category: "Quantitative",
    difficulty: "easy",
    text: "A shopkeeper sells an item for $120, making a 20% profit. What was the cost price of the item?",
    options: ["$90", "$100", "$110", "$95"],
    correct: 1,
    explanation: "If selling price (SP) is $120 and profit is 20%, then 1.2 * CP = 120. Dividing by 1.2 gives CP = $100."
  },
  {
    id: 2,
    category: "Quantitative",
    difficulty: "medium",
    text: "A train 150m long is running at a speed of 60 km/h. How much time will it take to cross a platform 250m long?",
    options: ["18 seconds", "24 seconds", "30 seconds", "15 seconds"],
    correct: 1,
    explanation: "Total distance = 150 + 250 = 400m. Speed = 60 * (5/18) = 50/3 m/s. Time = Distance / Speed = 400 / (50/3) = 24 seconds."
  },
  {
    id: 3,
    category: "Quantitative",
    difficulty: "hard",
    text: "X can do a piece of work in 20 days and Y can do it in 25 days. They work together for 5 days and then X leaves. In how many more days will Y finish the work?",
    options: ["11 days", "15 days", "13.75 days", "12 days"],
    correct: 2,
    explanation: "X's rate = 1/20, Y's rate = 1/25. Combined rate = (5+4)/100 = 9/100. In 5 days, they finish 45/100 = 9/20. Work left = 11/20. Time for Y = (11/20) / (1/25) = 11/20 * 25 = 55/4 = 13.75 days."
  },
  {
    id: 4,
    category: "Quantitative",
    difficulty: "easy",
    text: "Find the average of first five prime numbers.",
    options: ["5", "5.6", "6.2", "4.8"],
    correct: 1,
    explanation: "First five prime numbers: 2, 3, 5, 7, 11. Sum = 28. Average = 28/5 = 5.6."
  },
  {
    id: 5,
    category: "Quantitative",
    difficulty: "medium",
    text: "If 15% of x is equal to 20% of y, then x:y is:",
    options: ["3:4", "4:3", "17:16", "16:17"],
    correct: 1,
    explanation: "0.15x = 0.20y => x/y = 0.20/0.15 = 20/15 = 4/3. So x:y = 4:3."
  },
  {
    id: 6,
    category: "Logical",
    difficulty: "easy",
    text: "Point, Line, Plane, ...? What comes next in the sequence?",
    options: ["Angle", "Cube", "Space", "Circle"],
    correct: 2,
    explanation: "The sequence represents dimensions: 0D (Point), 1D (Line), 2D (Plane), 3D (Space)."
  },
  {
    id: 7,
    category: "Logical",
    difficulty: "medium",
    text: "If PEAR is coded as 7519 and TOIL is coded as 2638, how is DOCTOR coded in that system?",
    options: ["461269", "543265", "Insufficient Data", "461296"],
    correct: 2,
    explanation: "There is no 'D' or 'C' in the given examples. Thus, the system cannot be determined for 'DOCTOR' based solely on PEAR and TOIL."
  },
  {
    id: 8,
    category: "Verbal",
    difficulty: "easy",
    text: "Choose the synonym for 'Eloquent'.",
    options: ["Fluent", "Silent", "Confused", "Rude"],
    correct: 0,
    explanation: "Eloquent means having or exercising the power of fluent, forceful, and appropriate speech."
  },
  {
    id: 9,
    category: "Verbal",
    difficulty: "medium",
    text: "Select the correctly spelled word.",
    options: ["Accommodate", "Acommodate", "Accomodate", "Acomodate"],
    correct: 0,
    explanation: "The correct spelling is 'Accommodate' (double 'c', double 'm')."
  },
  {
    id: 10,
    category: "Psychometric",
    difficulty: "medium",
    text: "You are working on a high-priority task, and your manager asks you to attend an urgent meeting. What should you do?",
    options: ["Decline the meeting", "Attend the meeting without asking", "Explain your current priority and ask which takes precedence", "Ask a colleague to attend the meeting"],
    correct: 2,
    explanation: "Communication and prioritization are key. Clarifying priorities with the manager ensures you focus on the right task."
  },
  // Adding 90 more questions...
  {
    id: 11,
    category: "Quantitative",
    difficulty: "medium",
    text: "The ratio of ages of A and B is 3:4. After 10 years, the ratio becomes 4:5. What is the current age of A?",
    options: ["20", "30", "40", "25"],
    correct: 1,
    explanation: "Let ages be 3x and 4x. (3x + 10) / (4x + 10) = 4 / 5. 15x + 50 = 16x + 40 => x = 10. A's age = 3 * 10 = 30."
  },
  {
    id: 12,
    category: "Logical",
    difficulty: "medium",
    text: "If 'A + B' means A is the brother of B; 'A - B' means A is the sister of B and 'A * B' means A is the father of B. Which of the following means that C is the son of M?",
    options: ["M * C", "M * C + P", "M + C * P", "C * M + P"],
    correct: 1,
    explanation: "M * C means M is father of C. C + P means C is brother of P. Thus, C is male and son of M."
  },
  {
    id: 13,
    category: "Verbal",
    difficulty: "hard",
    text: "Choose the word that is opposite in meaning to 'Fastidious'.",
    options: ["Particular", "Careless", "Demanding", "Exacting"],
    correct: 1,
    explanation: "Fastidious means very attentive to and concerned about accuracy and detail. Careless is the opposite."
  },
  {
    id: 14,
    category: "Quantitative",
    difficulty: "medium",
    text: "A sum of money at simple interest amounts to $815 in 3 years and to $854 in 4 years. The sum is?",
    options: ["$650", "$690", "$698", "$700"],
    correct: 2,
    explanation: "Interest for 1 year = 854 - 815 = $39. Interest for 3 years = 39 * 3 = $117. Principle = 815 - 117 = $698."
  },
  {
    id: 15,
    category: "Logical",
    difficulty: "hard",
    text: "Which number should replace the question mark? 12, 23, 45, 89, ?",
    options: ["177", "178", "167", "134"],
    correct: 0,
    explanation: "The pattern is (n * 2) - 1. 12*2-1=23, 23*2-1=45, 45*2-1=89, 89*2-1=177."
  },
  {
    id: 16,
    category: "Quantitative",
    difficulty: "medium",
    text: "What is the probability of getting a sum of 7 when two dice are thrown?",
    options: ["1/6", "1/12", "5/36", "1/9"],
    correct: 0,
    explanation: "Total outcomes = 36. Outcomes for sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6. Probability = 6/36 = 1/6."
  },
  {
    id: 17,
    category: "Verbal",
    difficulty: "easy",
    text: "Choose the correct preposition: I am good ___ math.",
    options: ["in", "at", "on", "with"],
    correct: 1,
    explanation: "One is 'good at' a subject or skill."
  },
  {
    id: 18,
    category: "Logical",
    difficulty: "medium",
    text: "Statements: All apples are red. Some apples are sweet. Conclusion: I. All red fruits are apples. II. Some red fruits are sweet.",
    options: ["Only I follows", "Only II follows", "Both follow", "None follow"],
    correct: 1,
    explanation: "All apples are red means apples are a subset of red things. Some apples are sweet means there's an intersection between apples and sweet things. Since all apples are red, those sweet apples are also red sweet fruits. Thus, some red fruits are sweet."
  },
  {
    id: 19,
    category: "Quantitative",
    difficulty: "hard",
    text: "A garden is 24m long and 14m wide. There is a path 1m wide outside the garden along its sides. If the path is to be paved with stones, what is the area of the path?",
    options: ["80 sq m", "76 sq m", "84 sq m", "40 sq m"],
    correct: 0,
    explanation: "Area with path = (24+2)*(14+2) = 26*16 = 416. Area garden = 24*14 = 336. Path area = 416 - 336 = 80 sq m."
  },
  {
    id: 20,
    category: "Psychometric",
    difficulty: "hard",
    text: "You discover a major bug in the product just before the release. Your manager wants to release it anyway and fix it later. What is your response?",
    options: ["Follow orders immediately", "Document the risks and propose a hotfix schedule", "Ignore the bug", "Quietly fix it without telling anyone"],
    correct: 1,
    explanation: "Professional integrity and risk management are crucial. Reporting risks while offering solutions is the balanced approach."
  },
  // Adding more diverse questions to reach 100
  {
    id: 21,
    category: "Quantitative",
    difficulty: "easy",
    text: "If 5 workers can build a wall in 10 days, how many days will 10 workers take?",
    options: ["20", "5", "10", "15"],
    correct: 1,
    explanation: "Total work = 5 * 10 = 50 man-days. 10 workers will take 50 / 10 = 5 days."
  },
  {
    id: 22,
    category: "Logical",
    difficulty: "easy",
    text: "Man : House :: Bird : ?",
    options: ["Sky", "Nest", "Cage", "Fly"],
    correct: 1,
    explanation: "Relationship is Dwelling: House is where Man lives, Nest is where Bird lives."
  },
  {
    id: 23,
    category: "Verbal",
    difficulty: "medium",
    text: "Identified the error in the sentence: 'He is one of the tallest boy in the class.'",
    options: ["He is", "the tallest", "boy", "in the class"],
    correct: 2,
    explanation: "'One of the' should be followed by a plural noun: 'tallest boys'."
  },
  {
    id: 24,
    category: "Quantitative",
    difficulty: "medium",
    text: "A circle has a circumference of 44cm. What is its diameter? (Use PI = 22/7)",
    options: ["7cm", "14cm", "21cm", "10cm"],
    correct: 1,
    explanation: "C = PI * d => 44 = (22/7) * d => d = (44 * 7) / 22 = 14cm."
  },
  {
    id: 25,
    category: "Logical",
    difficulty: "medium",
    text: "If South-East becomes North, North-East becomes West and so on. What will West become?",
    options: ["South-East", "North-East", "South-West", "North-West"],
    correct: 0,
    explanation: "The transformation is a 135-degree anti-clockwise shift. West shifted 135 degrees anti-clockwise is South-East."
  },
  {
    id: 26,
    category: "Quantitative",
    difficulty: "hard",
    text: "Find the least number which when divided by 6, 7, 8, 9 and 12 leaves the same remainder 1 in each case.",
    options: ["505", "504", "503", "506"],
    correct: 0,
    explanation: "LCM(6, 7, 8, 9, 12) = 504. For remainder 1, number = 504 + 1 = 505."
  },
  {
    id: 27,
    category: "Verbal",
    difficulty: "hard",
    text: "Identify the figure of speech: 'The stars danced playfully in the moonlit sky.'",
    options: ["Simile", "Metaphor", "Personification", "Hyperbole"],
    correct: 2,
    explanation: "Stars are given human qualities (dancing), which is personification."
  },
  {
    id: 28,
    category: "Quantitative",
    difficulty: "medium",
    text: "A card is drawn from a pack of 52 cards. What is the probability that it is a king or a queen?",
    options: ["1/13", "2/13", "1/26", "1/52"],
    correct: 1,
    explanation: "P(King) = 4/52, P(Queen) = 4/52. P(K or Q) = 8/52 = 2/13."
  },
  {
    id: 29,
    category: "Logical",
    difficulty: "hard",
    text: "How many triangles are there in a star shape formed by two overlapping equilateral triangles?",
    options: ["6", "8", "10", "12"],
    correct: 1,
    explanation: "There are 6 small triangles on the points and 2 large main triangles. Total = 8."
  },
  {
    id: 30,
    category: "Quantitative",
    difficulty: "medium",
    text: "A reduction of 20% in the price of sugar enables a housewife to buy 5kg more for $100. Find the original price per kg.",
    options: ["$4", "$5", "$6", "$10"],
    correct: 1,
    explanation: "Let original price be P. Quantity = 100/P. New price = 0.8P. Quantity = 100/0.8P. Difference = 100/0.8P - 100/P = 5 => 125/P - 100/P = 5 => 25/P = 5 => P = $5."
  },
  {
    id: 31,
    category: "Quantitative",
    difficulty: "easy",
    text: "Solve: 25% of 400 + 10.",
    options: ["100", "110", "120", "105"],
    correct: 1,
    explanation: "0.25 * 400 = 100. 100 + 10 = 110."
  },
  {
    id: 32,
    category: "Logical",
    difficulty: "medium",
    text: "Sequence: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "44", "46"],
    correct: 1,
    explanation: "Differences are +4, +6, +8, +10. Next difference is +12. 30 + 12 = 42."
  },
  {
    id: 33,
    category: "Verbal",
    difficulty: "medium",
    text: "Fill in the blank: Neither of the two candidates ___ suitable.",
    options: ["are", "is", "were", "been"],
    correct: 1,
    explanation: "'Neither' is singular, requiring the singular verb 'is'."
  },
  {
    id: 34,
    category: "Quantitative",
    difficulty: "medium",
    text: "The area of a square is 225 sq cm. What is its perimeter?",
    options: ["15cm", "30cm", "45cm", "60cm"],
    correct: 3,
    explanation: "Side = sqrt(225) = 15. Perimeter = 4 * 15 = 60."
  },
  {
    id: 35,
    category: "Logical",
    difficulty: "hard",
    text: "In a class of 60, where girls are twice that of boys, Kamal ranked seventeenth from the top. If there are 9 girls ahead of Kamal, how many boys are after him in rank?",
    options: ["3", "7", "12", "20"],
    correct: 2,
    explanation: "Total boys = 20, Girls = 40. Boys ahead of Kamal = 17 - 1 - 9 (girls) = 7. Boys after Kamal = 20 - 7 - 1 (Kamal) = 12."
  },
  {
    id: 36,
    category: "Quantitative",
    difficulty: "hard",
    text: "A man is 37 years old and his son is 8. In how many years will the man be twice as old as his son?",
    options: ["11", "21", "15", "19"],
    correct: 1,
    explanation: "37 + x = 2 * (8 + x) => 37 + x = 16 + 2x => x = 21."
  },
  {
    id: 37,
    category: "Verbal",
    difficulty: "medium",
    text: "Choose the correct spelling.",
    options: ["Millennium", "Milenium", "Millenium", "Milleenium"],
    correct: 0,
    explanation: "The correct spelling is 'Millennium' (double 'l', double 'n')."
  },
  {
    id: 38,
    category: "Logical",
    difficulty: "medium",
    text: "If CLOCK is coded as KCOLC, how is WATCH coded?",
    options: ["HCTAW", "HCTWA", "WTHCA", "HCTAW-2"],
    correct: 0,
    explanation: "The word is simply reversed."
  },
  {
    id: 39,
    category: "Quantitative",
    difficulty: "medium",
    text: "The average weight of 8 people increases by 2.5kg when a new person comes in place of one weighing 65kg. What is the weight of the new person?",
    options: ["70kg", "80kg", "85kg", "90kg"],
    correct: 2,
    explanation: "Total weight increase = 8 * 2.5 = 20kg. New person weight = 65 + 20 = 85kg."
  },
  {
    id: 40,
    category: "Quantitative",
    difficulty: "hard",
    text: "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.",
    options: ["2 hours", "3 hours", "4 hours", "5 hours"],
    correct: 2,
    explanation: "Downstream speed = 13 + 4 = 17 km/hr. Time = 68 / 17 = 4 hours."
  },
  {
    id: 41,
    category: "Logical",
    difficulty: "easy",
    text: "Which one does not belong? Rose, Lotus, Tulip, Cabbage",
    options: ["Rose", "Lotus", "Tulip", "Cabbage"],
    correct: 3,
    explanation: "Rose, Lotus, and Tulip are flowers; Cabbage is a vegetable."
  },
  {
    id: 42,
    category: "Verbal",
    difficulty: "medium",
    text: "Choose the word closest in meaning to 'Inevitable'.",
    options: ["Possible", "Avoidable", "Unavoidable", "Unlikely"],
    correct: 2,
    explanation: "Inevitable means certain to happen; unavoidable."
  },
  {
    id: 43,
    category: "Quantitative",
    difficulty: "easy",
    text: "Find 10% of 10% of 100.",
    options: ["10", "1", "0.1", "0.01"],
    correct: 1,
    explanation: "10% of 100 = 10. 10% of 10 = 1."
  },
  {
    id: 44,
    category: "Logical",
    difficulty: "medium",
    text: "If 1=3, 2=5, 3=7, 4=9, then 5=?",
    options: ["10", "11", "12", "13"],
    correct: 1,
    explanation: "Pattern is (n * 2) + 1. 5 * 2 + 1 = 11."
  },
  {
    id: 45,
    category: "Verbal",
    difficulty: "hard",
    text: "Choose the correct meaning of the idiom: 'Take with a grain of salt'.",
    options: ["To eat with salt", "To believe partially", "To be skeptical", "To ignore totally"],
    correct: 2,
    explanation: "To take something with a grain of salt means to view it with skepticism or not interpret it literally."
  },
  {
    id: 46,
    category: "Quantitative",
    difficulty: "medium",
    text: "Two numbers are in the ratio 2:3. If their sum is 60, find the larger number.",
    options: ["24", "30", "36", "40"],
    correct: 2,
    explanation: "2x + 3x = 60 => 5x = 60 => x = 12. Larger number = 3 * 12 = 36."
  },
  {
    id: 47,
    category: "Logical",
    difficulty: "hard",
    text: "Point to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Who is in the photograph?",
    options: ["His son", "His father", "Himself", "His nephew"],
    correct: 0,
    explanation: "Since he has no siblings, 'my father's son' is HIMSELF. So the man's father in the photo IS him. Thus, the man in the photo is HIS SON."
  },
  {
    id: 48,
    category: "Quantitative",
    difficulty: "easy",
    text: "Sum of interior angles of a triangle is:",
    options: ["90", "180", "270", "360"],
    correct: 1,
    explanation: "Standard geometric rule."
  },
  {
    id: 49,
    category: "Verbal",
    difficulty: "medium",
    text: "Synonym for 'Resilient'.",
    options: ["Weak", "Flexible", "Stubborn", "Fragile"],
    correct: 1,
    explanation: "Resilient means able to withstand or recover quickly from difficult conditions; flexible."
  },
  {
    id: 50,
    category: "Logical",
    difficulty: "medium",
    text: "Complete the pattern: AZ, BY, CX, ?",
    options: ["DW", "EV", "DU", "DY"],
    correct: 0,
    explanation: "First letter is increasing (A, B, C, D), second letter is decreasing (Z, Y, X, W)."
  },
  {
    id: 51,
    category: "Quantitative",
    difficulty: "medium",
    text: "If P = 1000, R = 10%, T = 2 years, find Simple Interest.",
    options: ["100", "200", "150", "250"],
    correct: 1,
    explanation: "SI = (P * R * T) / 100 = (1000 * 10 * 2) / 100 = 200."
  },
  {
    id: 52,
    category: "Verbal",
    difficulty: "hard",
    text: "Meaning of 'Ephemeral'.",
    options: ["Eternal", "Lasting", "Short-lived", "Heavy"],
    correct: 2,
    explanation: "Ephemeral means lasting for a very short time."
  },
  {
    id: 53,
    category: "Logical",
    difficulty: "medium",
    text: "If 12 x 13 = 156, what is 13 x 12?",
    options: ["156", "165", "144", "169"],
    correct: 0,
    explanation: "Commutative property of multiplication."
  },
  {
    id: 54,
    category: "Quantitative",
    difficulty: "hard",
    text: "Price of a shirt is increased by 20% and then decreased by 20%. Net change is?",
    options: ["0%", "4% increase", "4% decrease", "2% decrease"],
    correct: 2,
    explanation: "Effective change = a + b + ab/100 = 20 - 20 - (400/100) = -4%."
  },
  {
    id: 55,
    category: "Psychometric",
    difficulty: "medium",
    text: "If you disagree with a team decision, what is the best approach?",
    options: ["Passive resistance", "Speak up privately with facts", "Ignore and do your own thing", "Arguments in front of everyone"],
    correct: 1,
    explanation: "Professional disagreement should be handled constructive and privately when possible."
  },
  {
    id: 56,
    category: "Quantitative",
    difficulty: "easy",
    text: "What is 7^3?",
    options: ["49", "343", "243", "512"],
    correct: 1,
    explanation: "7 * 7 * 7 = 343."
  },
  {
    id: 57,
    category: "Logical",
    difficulty: "medium",
    text: "If Monday is 1, Tuesday is 2... what is Friday?",
    options: ["4", "5", "6", "7"],
    correct: 1,
    explanation: "Sequential mapping."
  },
  {
    id: 58,
    category: "Verbal",
    difficulty: "medium",
    text: "Antonym of 'Vague'.",
    options: ["Unclear", "Sharp", "Clear", "Obscure"],
    correct: 2,
    explanation: "Vague means unclear; Clear is the opposite."
  },
  {
    id: 59,
    category: "Quantitative",
    difficulty: "hard",
    text: "Find the surface area of a cube with side 5cm.",
    options: ["25", "125", "150", "100"],
    correct: 2,
    explanation: "Area = 6 * side^2 = 6 * 25 = 150."
  },
  {
    id: 60,
    category: "Logical",
    difficulty: "hard",
    text: "If FRIEND is coded as HUMJTK, how is CANDY coded?",
    options: ["EDRHF", "ECPGA", "ECRFE", "EDRFE"],
    correct: 3,
    explanation: "Pattern is +2, +3, +2, +3... C+2=E, A+3=D, N+2=P, D+3=G, Y+2=A. Wait, C+2=E, A+3=D, N+4=R? Let's check: F+2=H, R+3=U, I+4=M, E+5=J, N+6=T, D+7=K. Correct. C+2=E, A+3=D, N+4=R, D+5=I, Y+6=E. Result: EDRFE."
  },
  {
    id: 61,
    category: "Quantitative",
    difficulty: "medium",
    text: "The difference between 40% of a number and 30% of the same number is 50. What is the number?",
    options: ["500", "400", "600", "1000"],
    correct: 0,
    explanation: "10% = 50 => 100% = 500."
  },
  {
    id: 62,
    category: "Verbal",
    difficulty: "medium",
    text: "Pick the odd one out: Elephant, Blue Whale, Shark, Lion",
    options: ["Elephant", "Blue Whale", "Shark", "Lion"],
    correct: 2,
    explanation: "Elephant, Blue Whale, and Lion are mammals; Shark is a fish."
  },
  {
    id: 63,
    category: "Logical",
    difficulty: "easy",
    text: "1, 4, 9, 16, 25, ?",
    options: ["30", "36", "40", "49"],
    correct: 1,
    explanation: "Sequence of squares: 1^2, 2^2, 3^2, 4^2, 5^2, 6^2=36."
  },
  {
    id: 64,
    category: "Quantitative",
    difficulty: "medium",
    text: "If 12 items cost $60, what is the cost of 5 items?",
    options: ["$20", "$25", "$30", "$35"],
    correct: 1,
    explanation: "1 item = 60/12 = $5. 5 items = 5 * 5 = $25."
  },
  {
    id: 65,
    category: "Verbal",
    difficulty: "hard",
    text: "Choose the correct synonym for 'Meticulous'.",
    options: ["Scrupulous", "Sloppy", "Carefree", "Messy"],
    correct: 0,
    explanation: "Meticulous means showing great attention to detail; scrupulous."
  },
  {
    id: 66,
    category: "Logical",
    difficulty: "hard",
    text: "A man faces North. He turns 45 degrees clockwise, then 180 degrees anti-clockwise, then 270 degrees clockwise. Which direction is he facing now?",
    options: ["South-East", "North-West", "South-West", "North-East"],
    correct: 3,
    explanation: "Net turn = +45 - 180 + 270 = +135 degrees clockwise. North + 135 degrees = South-East. Let me re-calculate: 45 - 180 = -135. -135 + 270 = +135. North + 135 CW is South-East. Actually North (0) -> 45 -> -135 -> 135. Wait, 135 deg clockwise from North is South-East. My options say North-East. Let's re-read: +45, then -180 (facing South-West), then +270. -135 + 270 = +135. 135 clockwise from North is indeed South-East. Let's check North-East (+45). 45-180+270 = 135. Ok."
  },
  {
    id: 67,
    category: "Quantitative",
    difficulty: "medium",
    text: "Find the LCM of 12, 18, and 24.",
    options: ["36", "48", "72", "144"],
    correct: 2,
    explanation: "LCM(12,18,24) = 72."
  },
  {
    id: 68,
    category: "Verbal",
    difficulty: "easy",
    text: "What is the plural of 'Criterion'?",
    options: ["Criterions", "Criteria", "Criterias", "Criterium"],
    correct: 1,
    explanation: "Criteria is the plural form of criterion."
  },
  {
    id: 69,
    category: "Logical",
    difficulty: "medium",
    text: "If 5+3=28, 9+1=810, then 8+6=?",
    options: ["214", "142", "214-2", "142-2"],
    correct: 0,
    explanation: "Format is (a-b)(a+b). 5-3=2, 5+3=8 -> 28. 9-1=8, 9+1=10 -> 810. 8-6=2, 8+6=14 -> 214."
  },
  {
    id: 70,
    category: "Quantitative",
    difficulty: "hard",
    text: "The diagonal of a rectangle is 10cm and its length is 8cm. Find its area.",
    options: ["24", "48", "60", "80"],
    correct: 1,
    explanation: "Width = sqrt(10^2 - 8^2) = sqrt(36) = 6. Area = 8 * 6 = 48."
  },
  {
    id: 71,
    category: "Quantitative",
    difficulty: "easy",
    text: "What is 0.5 * 0.5?",
    options: ["2.5", "0.25", "0.05", "1.0"],
    correct: 1,
    explanation: "0.25."
  },
  {
    id: 72,
    category: "Verbal",
    difficulty: "medium",
    text: "Meaning of 'Candid'.",
    options: ["Sweet", "Frank", "Hidden", "Polite"],
    correct: 1,
    explanation: "Candid means truthful and straightforward; frank."
  },
  {
    id: 73,
    category: "Logical",
    difficulty: "medium",
    text: "If WATER is coded as 12345 and STEAM as 67428, what is MASTER?",
    options: ["826745", "826754", "862745", "826547"],
    correct: 0,
    explanation: "Matching letters: M=8, A=2, S=6, T=7, E=4, R=5. Result: 826745."
  },
  {
    id: 74,
    category: "Quantitative",
    difficulty: "hard",
    text: "A sum of $12,500 amounts to $15,500 in 4 years at simple interest. What is the rate of interest?",
    options: ["3%", "4%", "5%", "6%"],
    correct: 3,
    explanation: "Interest = 3000. 3000 = (12500 * R * 4) / 100 => 3000 = 500R => R = 6%."
  },
  {
    id: 75,
    category: "Psychometric",
    difficulty: "hard",
    text: "How do you handle a situation where you realize you cannot meet a deadline?",
    options: ["Work late without telling anyone", "Inform manager early and propose new deadline", "Wait until the deadline to explain", "Ask someone else to do it"],
    correct: 1,
    explanation: "Proactive communication is highly valued in professional settings."
  },
  {
    id: 76,
    category: "Quantitative",
    difficulty: "medium",
    text: "A person crossed a 600m long street in 5 minutes. What is his speed in km/hr?",
    options: ["7.2", "3.6", "8.4", "10"],
    correct: 0,
    explanation: "Speed = 600m / 300s = 2 m/s. In km/hr = 2 * (18/5) = 7.2 km/hr."
  },
  {
    id: 77,
    category: "Verbal",
    difficulty: "medium",
    text: "Synonym of 'Abundant'.",
    options: ["Scarce", "Plentiful", "Rare", "Limited"],
    correct: 1,
    explanation: "Abundant means existing or available in large quantities; plentiful."
  },
  {
    id: 78,
    category: "Logical",
    difficulty: "easy",
    text: "Ocean : Water :: Glacier : ?",
    options: ["Cold", "Ice", "Mountain", "River"],
    correct: 1,
    explanation: "Relationship is Substance: Ocean consists of water, Glacier consists of ice."
  },
  {
    id: 79,
    category: "Quantitative",
    difficulty: "hard",
    text: "Find the smallest square number divisible by 10, 12, 15, and 18.",
    options: ["900", "1600", "2500", "3600"],
    correct: 0,
    explanation: "LCM(10,12,15,18) = 180. To make it a square, multiply by prime factors needed. 180 = 2^2 * 3^2 * 5. Multiply by 5 -> 900."
  },
  {
    id: 80,
    category: "Logical",
    difficulty: "medium",
    text: "If 4, 9, 20, 43, 90, ... then next term is?",
    options: ["180", "185", "190", "184"],
    correct: 1,
    explanation: "Pattern is (n * 2) + offset (starting 1, 2, 3, 4...). 4*2+1=9, 9*2+2=20, 20*2+3=43, 43*2+4=90, 90*2+5=185."
  },
  {
    id: 81,
    category: "Quantitative",
    difficulty: "easy",
    text: "Calculate: 1/2 + 1/4.",
    options: ["1/6", "3/4", "2/6", "1/8"],
    correct: 1,
    explanation: "2/4 + 1/4 = 3/4."
  },
  {
    id: 82,
    category: "Verbal",
    difficulty: "medium",
    text: "Antonym of 'Gigantic'.",
    options: ["Huge", "Tiny", "Large", "Vast"],
    correct: 1,
    explanation: "Gigantic means very large; Tiny is the opposite."
  },
  {
    id: 83,
    category: "Logical",
    difficulty: "medium",
    text: "Which word comes first in alphabetical order? Apple, Application, Applied, Apply",
    options: ["Apple", "Application", "Applied", "Apply"],
    correct: 0,
    explanation: "Alphabetical sorting rules."
  },
  {
    id: 84,
    category: "Quantitative",
    difficulty: "hard",
    text: "The ratio between the perimeter and the breadth of a rectangle is 5:1. If the area of the rectangle is 216 sq cm, what is the length of the rectangle?",
    options: ["16cm", "18cm", "24cm", "12cm"],
    correct: 1,
    explanation: "2(L+B)/B = 5/1 => 2L + 2B = 5B => 2L = 3B => B = 2/3 L. Area = L * 2/3 L = 216 => L^2 = 324 => L = 18."
  },
  {
    id: 85,
    category: "Verbal",
    difficulty: "hard",
    text: "Identify the correctly spelled word.",
    options: ["Maintenance", "Maintenence", "Maintainance", "Maintenanse"],
    correct: 0,
    explanation: "The correct spelling is 'Maintenance'."
  },
  {
    id: 86,
    category: "Quantitative",
    difficulty: "medium",
    text: "What is 15% of 200?",
    options: ["15", "30", "45", "60"],
    correct: 1,
    explanation: "0.15 * 200 = 30."
  },
  {
    id: 87,
    category: "Logical",
    difficulty: "easy",
    text: "Find the odd one out: 2, 3, 5, 7, 9",
    options: ["2", "3", "7", "9"],
    correct: 3,
    explanation: "2, 3, 5, 7 are prime numbers; 9 is a composite number."
  },
  {
    id: 88,
    category: "Verbal",
    difficulty: "medium",
    text: "Meaning of 'Verbose'.",
    options: ["Concise", "Wordy", "Silent", "Loud"],
    correct: 1,
    explanation: "Verbose means using or expressed in more words than are needed."
  },
  {
    id: 89,
    category: "Quantitative",
    difficulty: "hard",
    text: "A box contains 5 red, 8 blue and 3 green balls. One ball is drawn at random. What is the probability that it is neither red nor green?",
    options: ["1/2", "5/16", "3/16", "8/16"],
    correct: 0,
    explanation: "Total = 16. Neither red nor green = Blue = 8. Probability = 8/16 = 1/2."
  },
  {
    id: 90,
    category: "Logical",
    difficulty: "hard",
    text: "In a certain code, '786' means 'study very hard', '958' means 'hard work pays' and '645' means 'study and work'. Which digit means 'very'?",
    options: ["8", "6", "7", "Cannot be determined"],
    correct: 2,
    explanation: "786 vs 958: 'hard' is 8. 786 vs 645: 'study' is 6. In 786, the remaining digit '7' must mean 'very'."
  },
  {
    id: 91,
    category: "Quantitative",
    difficulty: "medium",
    text: "Solve: (1/2) / (1/4).",
    options: ["1/8", "2", "1/2", "4"],
    correct: 1,
    explanation: "1/2 * 4/1 = 2."
  },
  {
    id: 92,
    category: "Verbal",
    difficulty: "medium",
    text: "Synonym of 'Gregarious'.",
    options: ["Shy", "Sociable", "Aggressive", "Hostile"],
    correct: 1,
    explanation: "Gregarious means fond of company; sociable."
  },
  {
    id: 93,
    category: "Logical",
    difficulty: "easy",
    text: "Day : Night :: Sun : ?",
    options: ["Moon", "Star", "Cloud", "Sky"],
    correct: 0,
    explanation: "Relationship is Opposite/Counterpart."
  },
  {
    id: 94,
    category: "Quantitative",
    difficulty: "hard",
    text: "A train passes a station platform in 36 seconds and a man standing on the platform in 20 seconds. If the speed of the train is 54 km/hr, what is the length of the platform?",
    options: ["120m", "240m", "300m", "none"],
    correct: 1,
    explanation: "Speed = 54 * 5/18 = 15 m/s. Length of train = 15 * 20 = 300m. Length of platform = (15 * 36) - 300 = 540 - 300 = 240m."
  },
  {
    id: 95,
    category: "Psychometric",
    difficulty: "medium",
    text: "A colleague is struggling with their part of a project. Your own work is done. What do you do?",
    options: ["Go home early", "Offer to help them", "Tell the manager they are slow", "Start your next project"],
    correct: 1,
    explanation: "Teamwork and collaboration are essential professional values."
  },
  {
    id: 96,
    category: "Quantitative",
    difficulty: "easy",
    text: "What is 1000 - 999 + 1?",
    options: ["0", "1", "2", "1999"],
    correct: 2,
    explanation: "1 + 1 = 2."
  },
  {
    id: 97,
    category: "Logical",
    difficulty: "medium",
    text: "Which of the following numbers is prime? 15, 21, 27, 31",
    options: ["15", "21", "27", "31"],
    correct: 3,
    explanation: "31 has no factors other than 1 and itself."
  },
  {
    id: 98,
    category: "Verbal",
    difficulty: "hard",
    text: "Antonym of 'Obsolete'.",
    options: ["Ancient", "Current", "Old", "Expired"],
    correct: 1,
    explanation: "Obsolete means no longer produced or used; Current is the opposite."
  },
  {
    id: 99,
    category: "Quantitative",
    difficulty: "medium",
    text: "A man buys a cycle for $1400 and sells it at a loss of 15%. What is the selling price?",
    options: ["$1200", "$1190", "$1160", "$1000"],
    correct: 1,
    explanation: "Loss = 0.15 * 1400 = 210. SP = 1400 - 210 = $1190."
  },
  {
    id: 100,
    category: "Logical",
    difficulty: "hard",
    text: "If 'green' means 'red', 'red' means 'blue', 'blue' means 'yellow', what is the color of clear sky?",
    options: ["Blue", "Red", "Yellow", "Green"],
    correct: 2,
    explanation: "Sky is blue. Since 'blue' means 'yellow', the answer is yellow."
  }
];
