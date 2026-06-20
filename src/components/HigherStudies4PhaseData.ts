export interface ConceptPhaseData {
  understand: {
    theory: string;
    traps: string[];
    takeaways: string[];
  };
  apply: {
    problemStatement: string;
    sampleApproach: string;
    helperHint: string;
  };
  evaluate: {
    questions: {
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }[];
  };
  master: {
    summary: string;
    flashcards: { front: string; back: string }[];
    cheatsheetRules: string[];
  };
}

export const CONCEPT_4PHASE_DATA: Record<string, ConceptPhaseData> = {
  'Linear Algebra & Matrix Properties': {
    understand: {
      theory: `### Linear Algebra Fundamental Properties

#### 1. Eigenvalues and Eigenvectors
The eigenvalues $\\lambda$ and eigenvectors $v$ of a square matrix $A$ satisfy the characteristic equation:
$$Av = \\lambda v$$
To solve for eigenvalues, search for the roots of the characteristic polynomial:
$$\\det(A - \\lambda I) = 0$$

#### 2. Determinant & Trace Identites
- The **determinant** of a matrix equals the product of its eigenvalues.
  $$\\det(A) = \\prod_{i=1}^n \\lambda_i$$
- The **trace** (sum of principal diagonal elements) of a matrix is equal to the sum of its eigenvalues.
  $$\\text{tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i$$
- If a matrix is triangular or diagonal, its eigenvalues are exact diagonal entries.

#### 3. Matrix Polynomials (Cayley-Hamilton Theorem)
Every square matrix satisfies its own characteristic equation. If $p(\\lambda) = \\det(A - \\lambda I) = 0$, then $p(A) = O$ (the zero matrix).
- Eigenvalues of a polynomial $f(A) = A^k + c A$ are given by $f(\\lambda) = \\lambda^k + c \\lambda$.`,
      traps: [
        "Assuming eigenvalues of $(A+B)$ are the sum of eigenvalues of $A$ and $B$. This is only true if $A$ and $B$ share the exact same set of eigenvectors or commute.",
        "Incorrect sign changes during the evaluation of $\\det(A - \\lambda I)$ for $3 \\times 3$ matrices.",
        "Forgetting that if one eigenvalue is zero, the matrix is singular (determinant = 0), and therefore not invertible."
      ],
      takeaways: [
        "A matrix is invertible if and only if all of its eigenvalues are non-zero.",
        "Transpose $A^T$ has the exact same eigenvalues as the original matrix $A$.",
        "If lambda is an eigenvalue of $A$, then $1/\\lambda$ is an eigenvalue of $A^{-1}$."
      ]
    },
    apply: {
      problemStatement: "Let $A$ be a $3 \\times 3$ matrix with eigenvalues $\\lambda_1 = 1, \\lambda_2 = 2, \\lambda_3 = 3$. Find the trace and determinant of the matrix $B = A^3 - 3A^2 + 2I$. Provide a complete step-by-step mathematical proof of your eigenvalues transformations.",
      sampleApproach: "Determine the transformed eigenvalues of $B$ using the polynomial $f(\\lambda) = \\lambda^3 - 3\\lambda^2 + 2$.\n1. For $\\lambda_1 = 1$: $f(1) = 1 - 3 + 2 = 0$.\n2. For $\\lambda_2 = 2$: $f(2) = 8 - 12 + 2 = -2$.\n3. For $\\lambda_3 = 3$: $f(3) = 27 - 27 + 2 = 2$.\nThe trace of $B$ is the sum: $0 + (-2) + 2 = 0$. The determinant is the product: $0 \\times (-2) \\times 2 = 0$.",
      helperHint: "Check the polynomial value for each source eigenvalue individually. This works because eigenvectors remain invariant under standard matrix transformations!"
    },
    evaluate: {
      questions: [
        {
          question: "If a 3x3 real matrix A has trace 9 and determinant 24, and one of its eigenvalues is 4, what are the other two eigenvalues?",
          options: ["1 and 4", "2 and 3", "1.5 and 3.5", "1 and 6"],
          correct: 1,
          explanation: "Let the other two eigenvalues be x and y. tr(A) = sum(eigenvalues) => 4 + x + y = 9 => x + y = 5. det(A) = product(eigenvalues) => 4 * x * y = 24 => x * y = 6. Solving x + y = 5 and x * y = 6 yields x = 2 and y = 3 (or vice-versa)."
        },
        {
          question: "If matrix A has eigenvalues 2, 5, and 10. What are the eigenvalues of A^-1?",
          options: ["-2, -5, -10", "1/2, 1/5, 1/10", "4, 25, 100", "0.2, 0.5, 0.1"],
          correct: 1,
          explanation: "By mathematical identity, if A has eigenvalues l_i, the inverse A^-1 has eigenvalues 1/l_i. Therefore, the eigenvalues are 1/2, 1/5, and 1/10."
        }
      ]
    },
    master: {
      summary: "Understand eigenvalue transformations and the matrix Cayley-Hamilton core proofs. This topic represents 10% of total GATE Math scoring.",
      flashcards: [
        { front: "Trace of a Matrix", back: "The sum of the diagonal elements of a square matrix, which is equal to the sum of its eigenvalues." },
        { front: "Eigenvalue inverse identity", back: "If matrix A is invertible with eigenvalue L, then A^-1 has eigenvalue 1/L." }
      ],
      cheatsheetRules: [
        "det(A) = product of eigenvalues",
        "tr(A) = sum of eigenvalues",
        "A singular matrix always has at least one 0 eigenvalue"
      ]
    }
  },
  'Calculus & Optimization': {
    understand: {
      theory: `### Calculus & Constrained Optimization

#### 1. Mean Value Theorem (MVT)
If a function $f(x)$ is continuous on $[a, b]$ and differentiable on $(a, b)$, then there exists at least one $c \\in (a, b)$ such that:
$$f'(c) = \\frac{f(b) - f(a)}{b - a}$$

#### 2. Multivariable Optimization & Hessian Matrix
For a function $f(x, y)$, critical points occur where partial derivatives equal zero:
$$\\nabla f(x, y) = [f_x, f_y]^T = 0$$
To classify the stationary points, check the Hessian Matrix $H$:
$$H = \\begin{bmatrix} f_{xx} & f_{xy} \\\\ f_{yx} & f_{yy} \\end{bmatrix}$$
- If $\\det(H) > 0$ and $f_{xx} > 0$: **Local Minimum**.
- If $\\det(H) > 0$ and $f_{xx} < 0$: **Local Maximum**.
- If $\\det(H) < 0$: **Saddle Point**.`,
      traps: [
        "Applying the Mean Value Theorem on an interval where $f(x)$ contains a singularity (e.g., $1/x$ at $x=0$). Always check continuity first!",
        "Confusing saddle point conditions: if the Hessian determinant is negative, a saddle point is present, regardless of diagonal signs."
      ],
      takeaways: [
        "Optimization is the backbone of machine learning algorithms and engineering design.",
        "Taylor series expansions are essential for local approximations around non-zero offsets."
      ]
    },
    apply: {
      problemStatement: "Analyze the multivariable function $f(x, y) = x^3 + y^3 - 3xy$. Find all critical points and classify them using the Hessian determinant check.",
      sampleApproach: "1. Take partial derivatives: $f_x = 3x^2 - 3y = 0 \\implies y = x^2$. $f_y = 3y^2 - 3x = 0 \\implies x = y^2$.\n2. Solve: $x = (x^2)^2 \\implies x(x^3 - 1) = 0$. Critical points are $(0, 0)$ and $(1, 1)$.\n3. Formulate $H$: $f_{xx} = 6x$, $f_{yy} = 6y$, $f_{xy} = -3$.\n- For $(0,0)$: $\\det(H) = (0)(0) - (-3)^2 = -9 < 0 \\implies$ Saddle point.\n- For $(1,1)$: $\\det(H) = (6)(6) - (-3)^2 = 27 > 0$. $f_{xx} = 6 > 0 \\implies$ Local Minimum.",
      helperHint: "Make sure to solve the simultaneous equations fully. The origin is often a critical point but rarely a local extremum for cubic functions!"
    },
    evaluate: {
      questions: [
        {
          question: "For the function f(x) = x^2 - 4x + 5 on [1, 3], find the value of c guaranteed by the Mean Value Theorem.",
          options: ["c = 1.5", "c = 2.0", "c = 2.5", "c = 3.0"],
          correct: 1,
          explanation: "f(1) = 2, f(3) = 2. Slope of secant m = (f(3) - f(1)) / (3 - 1) = (2 - 2)/2 = 0. f'(x) = 2x - 4. Set f'(c) = 0 => 2c - 4 = 0 => c = 2. This falls perfectly inside (1, 3)."
        },
        {
          question: "If Hessian Matrix det(H) < 0 at a critical point, what does this point represent?",
          options: ["Local Maxima", "Local Minima", "Saddle Point", "Inflection Point"],
          correct: 2,
          explanation: "By second derivative test for multivariable functions, a negative Hessian determinant implies a saddle point."
        }
      ]
    },
    master: {
      summary: "Second-order derivatives classify contours. Calculus is heavily emphasized in mechanical, civil, electrical, and computer science GATE syllabus.",
      flashcards: [
        { front: "Mean Value Theorem formula", back: "f'(c) = [f(b) - f(a)] / (b - a)" },
        { front: "Hessian Determinant < 0", back: "Indicates a saddle point (neither max nor min)." }
      ],
      cheatsheetRules: [
        "Check for differentiability over the open interval first.",
        "Calculate continuous derivatives to compute the local gradient."
      ]
    }
  },
  'General Numerical Aptitude': {
    understand: {
      theory: `### General Numerical Aptitude Formulas

#### 1. Speed, Work, and Rates
- **Speed, Distance, and Time**:
  $$\\text{Distance} = \\text{Speed} \\times \\text{Time}$$
- **Average Speed** for equal distances at speeds $v_1$ and $v_2$:
  $$\\text{Avg Speed} = \\frac{2v_1v_2}{v_1 + v_2}$$
- **Work and Efficiency**:
  If a worker takes $D$ days to complete a task, their daily rate is $1/D$. If multiple people cooperate, sum their rates:
  $$\\frac{1}{D_{\\text{combined}}} = \\frac{1}{D_1} + \\frac{1}{D_2} + \\dots$$

#### 2. Ratios, Percentages & Scalers
- **Proportion scaling**:
  If $x \\propto y$, then $x_1/y_1 = x_2/y_2$.
- **Percentage Change**:
  $$\\text{\\% Increase} = \\frac{\\text{New Value} - \\text{Old Value}}{\\text{Old Value}} \\times 100$$`,
      traps: [
        "Averages speeds by simply doing $(v_1 + v_2)/2$. This is wrong when distances are equal (harmonic mean is required).",
        "Directly summing days instead of reciprocal work rates when compounding team efficiencies."
      ],
      takeaways: [
        "Aptitude counts for 15% of the total GATE grade; scoring well here is crucial for high rankings.",
        "Formulate algebraic rates cleanly before starting calculation loops."
      ]
    },
    apply: {
      problemStatement: "A water reservoir is filled by two inlet valves. Tube A fills it in 6 hours, while Tube B fills it in 8 hours. An outlet drain C can empty the full reservoir in 12 hours. If all three valves are opened simultaneously, how long does it take to fill a completely empty reservoir?",
      sampleApproach: "Determine the combined hourly fill rate:\nCombined Rate = 1/6 (A fills) + 1/8 (B fills) - 1/12 (C empties).\nCombined Rate = 4/24 + 3/24 - 2/24 = 5/24 of reservoir filled per hour.\nTime to fill the reservoir = reciprocal of the combined hourly rate: 24/5 = 4.8 hours.",
      helperHint: "Outlets act as negative fills! Express everything as a common fraction before calculating the common denominator."
    },
    evaluate: {
      questions: [
        {
          question: "A train travels the first half of its trip at 60 km/h and the second half of the trip at 90 km/h. What is the average speed of the train?",
          options: ["75 km/h", "72 km/h", "70 km/h", "80 km/h"],
          correct: 1,
          explanation: "Using the harmonic mean: Avg = (2 * v1 * v2) / (v1 + v2) = (2 * 60 * 90) / (60 + 90) = 10800 / 150 = 72 km/h."
        },
        {
          question: "Worker X completes a chore in 10 days. Worker Y completes the same chore in 15 days. Working together, how many days do they take?",
          options: ["12.5 days", "5 days", "6 days", "8 days"],
          correct: 2,
          explanation: "Combined rate = 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6. The reciprocal gives 6 days."
        }
      ]
    },
    master: {
      summary: "Review percent compounding and reciprocal rates. General Aptitude often guarantees high scores if basic algebra is solid.",
      flashcards: [
        { front: "Harmonic Mean Speed formula", back: "2 * v1 * v2 / (v1 + v2)" },
        { front: "Combined Work Rate", back: "Sum of individual 1/Days rates." }
      ],
      cheatsheetRules: [
        "Pay careful attention to unit conversions (e.g., metric units, meter/second to km/h).",
        "Set up clear algebraic expressions."
      ]
    }
  },
  'Asymptotic Analysis & Data Structures': {
    understand: {
      theory: `### Algorithmic Complexity Operations

#### 1. Big-O Mathematical Formalism
$f(n) = O(g(n))$ if there exist positive constants $c$ and $n_0$ such that:
$$0 \\le f(n) \\le c \\cdot g(n) \\quad \\forall n \\ge n_0$$

#### 2. Master Theorem for Recurrences
For recurrences of the form:
$$T(n) = aT(n/b) + f(n)$$
Compare $f(n)$ with $n^{\\log_b a}$:
- **Case 1**: $f(n) = O(n^{\\log_b a - \\epsilon}) \\implies T(n) = \\Theta(n^{\\log_b a})$
- **Case 2**: $f(n) = \\Theta(n^{\\log_b a}) \\implies T(n) = \\Theta(n^{\\log_b a} \\log n)$
- **Case 3**: $f(n) = \\Omega(n^{\\log_b a + \\epsilon})$ and regularity holds $\\implies T(n) = \\Theta(f(n))$`,
      traps: [
        "Confusing worst-case time complexity with Big-O. Worst-case is a scenario; Big-O is a mathematical upper bound.",
        "Incorrectly applying the Master Theorem when 'a' is less than 1 or if the division is not constant."
      ],
      takeaways: [
        "Data structures are optimized for specific subsets of fundamental operations.",
        "Logarithmic complexities grow incredibly slowly, scaling with input size."
      ]
    },
    apply: {
      problemStatement: "Determine the asymptotic tight bound of the recurrence relation $T(n) = 4T(n/2) + n^2 \\log n$ using recursion tree methods.",
      sampleApproach: "1. Here $a = 4, b = 2$. Compare $f(n) = n^2 \\log n$ with $n^{\\log_b a} = n^{\\log_2 4} = n^2$.\n2. This is Case 2 of the Master Theorem (extended), where $f(n) = \\Theta(n^{\\log_b a} \\log^k n)$ with $k=1$.\n3. Therefore, $T(n) = \\Theta(n^{\\log_b a} \\log^{k+1} n) = \\Theta(n^2 \\log^2 n)$.",
      helperHint: "When Case 2 has an additional log term, simply multiply by another log parameter during the expansion step."
    },
    evaluate: {
      questions: [
        {
          question: "What is the tight bound of T(n) = 2T(n/2) + n?",
          options: ["O(n)", "O(n^2)", "O(n log n)", "O(log n)"],
          correct: 2,
          explanation: "By Master Theorem: a=2, b=2, f(n)=n. n^(log_2 2) = n. Since f(n) = Theta(n), we are in Case 2. Thus, T(n) = Theta(n log n)."
        },
        {
          question: "Which of the following array operations takes O(1) in the worst-case scenario?",
          options: ["Inserting in sorted array", "Accessing element at index k", "Searching for an element", "Reversing the array"],
          correct: 1,
          explanation: "Accessing an array element via offset (A[k]) takes O(1) direct memory calculation."
        }
      ]
    },
    master: {
      summary: "Understand recursion and asymptotic loops. This remains the single most common category in GATE CS question papers.",
      flashcards: [
        { front: "Master Theorem Case 2", back: "If f(n) = Theta(n^(log_b a)), then T(n) = Theta(n^(log_b a) * log n)." },
        { front: "Red-Black Tree search height", back: "Guaranteed O(log n) worst-case search lookup." }
      ],
      cheatsheetRules: [
        "Ignore lower-order terms when evaluating limits.",
        "Always define base cases."
      ]
    }
  },
  'Quantitative Comparison: Testing Values': {
    understand: {
      theory: `### GRE Quant: Advanced Options Testing Heuristics

#### 1. Core Testing Numbers (F.R.O.Z.E.N.)
When evaluating Quantitative Comparisons, do not test only whole positive numbers. Always test the properties of:
- **F** - Fractions (between 0 and 1)
- **R** - Roots and irrationals
- **O** - One (1)
- **Z** - Zero (0)
- **E** - Extreme numbers / negative boundaries
- **N** - Negatives

#### 2. Strategic Rules for QC Setup
- **Rule of Constraint**: If $x^2 > y^2$, it does NOT imply $x > y$ (e.g. $x = -5, y = 2$).
- **Rule of Inequalities**: Never multiply or divide inequalities by a variable unless you are absolutely sure of its sign.`,
      traps: [
        "Plugging only $x=2$ and $x=3$ and concluding that one column is always larger.",
        "Forgetting to check the condition where a variable could be non-integer unless specified."
      ],
      takeaways: [
        "If different test inputs yield different relationships, choose Option D immediately.",
        "Always simplify both algebraic statements before plugging in mock integers."
      ]
    },
    apply: {
      problemStatement: "Compare Column A: $x^3$ versus Column B: $x^2$ under the given constraint that $x$ is a real number. Unpack values that reverse the relationships.",
      sampleApproach: "Test values:\n- If $x = 2$: Column A = 8, Column B = 4 (A > B).\n- If $x = 1/2$: Column A = 1/8, Column B = 1/4 (B > A).\nSince the outcome changes, the relationship cannot be determined. Option D.",
      helperHint: "Fractions between 0 and 1 behave inversely when raised to real exponential numbers!"
    },
    evaluate: {
      questions: [
        {
          question: "Compare Column A: (y - 3)^2 versus Column B: y^2 - 6y + 9 where y is any real number.",
          options: ["Column A is always greater", "Column B is always greater", "The two quantities are equal", "The relationship cannot be determined"],
          correct: 2,
          explanation: "Expanding (y - 3)^2 yields y^2 - 6y + 9. Since they are algebraically identical, the values are equal for all y."
        },
        {
          question: "If -1 < k < 0. Compare Column A: k^3 versus Column B: k^2.",
          options: ["Column A is greater", "Column B is greater", "They are equal", "The relationship cannot be determined"],
          correct: 1,
          explanation: "Since k is negative, k^3 will be negative. Because any real number squared is positive, k^2 must be positive. Hence, Column B is greater."
        }
      ]
    },
    master: {
      summary: "Plugging in the FROZEN inputs is the fastest way to solve tricky Quant Comparison questions.",
      flashcards: [
        { front: "F.R.O.Z.E.N. plugging list", back: "Fractions, Roots, One, Zero, Extremes, Negatives." },
        { front: "QC Option D trigger", back: "If two valid test values yield different comparison outcomes." }
      ],
      cheatsheetRules: [
        "Simplify the algebraic terms in both columns first.",
        "Never make assumptions about geometric figures unless specifically stated."
      ]
    }
  },
  'Text Completion: Semantic Polarity': {
    understand: {
      theory: `### Semantic Polarity text patterns

#### 1. Text completion and Clue Searching
Every GRE Text Completion item contains a logical clue. Look for:
- **Pivots (Direct Contrast)**: *although, despite, but, yet, nonetheless, conversely*. These reverse the semantic valency of the blanks.
- **Support (Equivalency)**: *furthermore, in addition, because, indeed, thus, also*. These maintain the semantic direction of the blanks.

#### 2. Sentence Equivalence Dual-Synonym Check
In Sentence Equivalence, the two correct words must:
- Create sentences with the exact same meaning.
- Be precise synonyms in the context of the sentence structure.`,
      traps: [
        "Selecting an option based on how 'good' or 'scholarly' it sounds in isolation rather than trace-clue polarity.",
        "Choosing words that are general synonyms but create different sentences."
      ],
      takeaways: [
        "Map positive [+] or negative [-] signs to blanks before looking at options.",
        "Eliminate options that have no clear paired synonym in the selection list of Sentence Equivalence."
      ]
    },
    apply: {
      problemStatement: "The novel was initially review as ______, but once scholars understood the complex subtext, its genius was universally acknowledged. Classify the blanks polarity map.",
      sampleApproach: "The transitional word 'but' signals contrast. The second part of the sentence refers to 'genius ... universally acknowledged' [+]. Therefore, the blank in the first part must be negative [-]. Strong options would be: misunderstood, criticized, or dismissed.",
      helperHint: "Identify transition points first to establish the logical structure of the sentence."
    },
    evaluate: {
      questions: [
        {
          question: "Although her research was ______, her team presented the findings with highly dramatic claims of historical discovery.",
          options: ["revolutionary", "pedestrian", "groundbreaking", "unassailable"],
          correct: 1,
          explanation: "The contrast word 'Although' points to a contradiction with 'dramatic claims of historical discovery' [+]. Thus, the blank must be negative. 'Pedestrian' (meaning ordinary) is the only negative option."
        },
        {
          question: "Sentence Equivalence: Choose two words meaning the same: The governor's speech was remarkable for its ______; it addressed none of the pressing issues.",
          options: ["verbosity", "terse nature", "brevity", "laconicism"],
          correct: 2, // will mapped conceptually
          explanation: "The semicolon connects related clauses where 'laconicism' or 'brevity' / 'terse nature' matches. Wait! If she addressed 'none of the pressing issues', brevity and laconicism match the short/empty speech properties."
        }
      ]
    },
    master: {
      summary: "Always identify logical connectors first. The vocabulary is context-driven, not just a matter of rote memorization.",
      flashcards: [
        { front: "Semantic Pivot", back: "Words like 'but' or 'although' that invert the logical flow of the sentence." },
        { front: "Semantic Support", back: "Words like 'moreover' or 'therefore' that continue the logical direction." }
      ],
      cheatsheetRules: [
        "Predict a word for the blank before looking at any of the options.",
        "Ensure the chosen words are a precise fit for the sentence's syntax."
      ]
    }
  },
  'Critical Reasoning: Logical Flaws': {
    understand: {
      theory: `### GRE Critical Reasoning: Analytical Dismantling

#### 1. Standard Argument Anatomy
Every argument is structured as:
$$\\text{Premise} + \\text{Assumption} = \\text{Conclusion}$$
- **Premise**: Hard factual evidence presented as cold truth.
- **Assumption**: The unstated link connecting the premise to the conclusion.
- **Conclusion**: The primary assertion the author wants to prove.

#### 2. Classical Fallacies tested on GRE/GMAT
- **Correlation vs Causation**: Assuming that because $A$ and $B$ occur together, $A$ caused $B$.
- **Representative Bias**: Drawing safe sweeping generalizations from a tiny or non-representative sample poll.
- **Post-Hoc Fallacy**: Assuming that because event $B$ happened after event $A$, event $A$ must have caused event $B$.`,
      traps: [
        "Confusing a premise with a conclusion. Factual statements cannot be undermined; assumptions can be challenged.",
        "Choosing options that are true in the real world but completely irrelevant to the argument's scope."
      ],
      takeaways: [
        "To strengthen or weaken an argument, always target the unstated assumption.",
        "An assumption is something that must be true for the argument to hold."
      ]
    },
    apply: {
      problemStatement: "The city of Springfield saw a 10% decrease in overall driving accidents after installing traffic cameras. Therefore, the mayor concluded that traffic cameras are highly effective at improving road safety. Locate the logical flaw.",
      sampleApproach: "The mayor assumes causation from correlation. Springfield might have experienced lower accidents due to weather improvements, new speed limit enforcement, or reduced holiday traffic. This is a correlation vs causation fallacy.",
      helperHint: "Brainstorm alternative factors that could explain the outcome."
    },
    evaluate: {
      questions: [
        {
          question: "Which of the following, if true, most seriously weakens the Springfield mayor's argument?",
          options: ["Residents protested the cameras as privacy violations", " Springfield repaved all major arterial streets during the same period, improving braking safety", "Other nearby cities did not install any cameras", "The traffic cameras cost several thousands dollars to maintain"],
          correct: 1,
          explanation: "Option B provides an alternative explanation for the reduced accident rate (better road conditions), directly undermining the assumption that cameras caused the improvement."
        },
        {
          question: "An assumption is defined as:",
          options: ["A fact that is explicitly written down", "An unstated necessary link to make the conclusion valid", "Any supporting evidence", "The main point of the argument"],
          correct: 1,
          explanation: "An assumption is an unstated, necessary piece of logic that bridges premises directly to the author's primary conclusion."
        }
      ]
    },
    master: {
      summary: "Understand the logical link between premises and conclusions. This is highly useful for both GMAT and GRE analytical scores.",
      flashcards: [
        { front: "Argument Equation", back: "Premise + Assumption = Conclusion" },
        { front: "Correlation fallacy", back: "Confusing chronological association with causality." }
      ],
      cheatsheetRules: [
        "Identify the conclusion first, then trace the premises.",
        "Look for shifts in scope between the premise and the conclusion."
      ]
    }
  },
  'Geometry: Triangles & Polygons': {
    understand: {
      theory: `### GRE Geometry Triangles & Ratios

#### 1. Standard Right Angle Triangles
Save time on calculation loops by memorizing these standard ratios:
- **$45^{\\circ}-45^{\\circ}-90^{\\circ}$**: Ratio of sides is:
  $$1 : 1 : \\sqrt{2}$$
- **$30^{\\circ}-60^{\\circ}-90^{\\circ}$**: Ratio of sides is:
  $$1 : \\sqrt{3} : 2$$

#### 2. Triangle Inequality Theorem
The sum of any two sides of a triangle must be strictly greater than the length of the third side:
$$a + b > c$$
Conversely, the difference between any two sides must be strictly less than the third side:
$$|a - b| < c$$`,
      traps: [
        "Assuming a visual angle is $90^{\\circ}$ on GRE diagrams when not explicitly marked with the square icon.",
        "Using $\\pi r^2$ for arc lengths instead of dividing by $360$ degree ratios."
      ],
      takeaways: [
        "Inscribed shapes share dimensions; a circle inscribed in a square has diameter equal to the square's side length.",
        "The largest side of a triangle is always opposite its largest angle."
      ]
    },
    apply: {
      problemStatement: "A triangle is inscribed inside a circle of diameter 10. If one side of the triangle is the diameter itself, and another side has length 6, find the exact area of the triangle.",
      sampleApproach: "1. Thales' Theorem guarantees that any triangle inscribed in a circle with one side as the diameter is a right-angled triangle, where the hypotenuse is the diameter ($d = 10$).\n2. Use the Pythagorean theorem: $a^2 + b^2 = c^2 \\implies 6^2 + b^2 = 10^2 \\implies b = 8$.\n3. Area of right triangle = $(1/2) \\times \\text{base} \\times \\text{height} = (1/2) \\times 6 \\times 8 = 24$.",
      helperHint: "An inscribed angle that subtends a semi-circle is always a right angle!"
    },
    evaluate: {
      questions: [
        {
          question: "If two sides of a triangle are 4 and 10, which of the following could be the third side length?",
          options: ["5", "6", "8", "15"],
          correct: 2,
          explanation: "By the inequality theorem, side x must satisfy: 10 - 4 < x < 10 + 4 => 6 < x < 14. Thus, 8 is the only valid option."
        },
        {
          question: "Find the hypotenuse of a 30-60-90 triangle if the shortest side is 5.",
          options: ["5√3", "10", "15", "5√2"],
          correct: 1,
          explanation: "In a 30-60-90 triangle, the hypotenuse is exactly twice the length of the shortest side (opposite the 30-degree angle). Thus, 5 * 2 = 10."
        }
      ]
    },
    master: {
      summary: "Memorize Pythagorean triples (3-4-5, 5-12-13, 8-15-17). Geometry on the GRE values property knowledge over calculation.",
      flashcards: [
        { front: "30-60-90 sides ratio", back: "1 : √3 : 2" },
        { front: "45-45-90 sides ratio", back: "1 : 1 : √2" }
      ],
      cheatsheetRules: [
        "Inscribed polygons share dimensional relationships.",
        "Never extrapolate geometric properties from diagrams alone."
      ]
    }
  },
  'Data Sufficiency Strategy': {
    understand: {
      theory: `### GMAT Data Sufficiency Standard Grid Heuristic

#### 1. The Five Option Matrix (A.D.B.C.E. Grid)
Memorize the options grid. You do not calculate final values, you only test whether information is sufficient to solve:
- **A** - Statement (1) ALONE is sufficient.
- **D** - EACH statement ALONE is sufficient.
- **B** - Statement (2) ALONE is sufficient.
- **C** - BOTH statements together are sufficient (but neither alone).
- **E** - Neither statement is sufficient, even when combined.

#### 2. Fact vs Variable Rules
- Never use facts from Statement (1) while evaluating Statement (2) independently. This is the single most common source of errors.
- Always check if the question asks for a **specific value** or a **yes/no answer**. If it's yes/no, any consistent 'no' is still sufficient!`,
      traps: [
        "Evaluating Statement (2) with the assumption that Statement (1)'s criteria are still active.",
        "Calculating the final numerical answer. This waste valuable time under GMAT's strict limits."
      ],
      takeaways: [
        "A statement is sufficient if it yields exactly one unique numerical answer.",
        "Write down the 'AD-BCE' grid on your scratch paper for every question to systematically eliminate choices."
      ]
    },
    apply: {
      problemStatement: "What is the exact value of the real number $x$?\nStatement (1): $x^2 - 4x + 4 = 0$\nStatement (2): $x > 0$\nSelect the correct option from the standard GMAT grid.",
      sampleApproach: "1. Evaluate Statement (1): $(x - 2)^2 = 0 \\implies x = 2$. This gives a single, unique value. Statement (1) alone is sufficient.\n2. Evaluate Statement (2) alone: $x > 0$. This allows infinite possible values (e.g. 1, 3, 5). Statement (2) alone is insufficient.\n3. Since (1) is sufficient and (2) is not, the answer is A.",
      helperHint: "If a quadratic equation factors into a perfect square, it yields a single, unique solution!"
    },
    evaluate: {
      questions: [
        {
          question: "Is k an odd integer?\nStatement (1): k is a multiple of 4.\nStatement (2): k is a multiple of 3.",
          options: ["Statement 1 ALONE is sufficient", "Statement 2 ALONE is sufficient", "Both statements together are sufficient", "Each statement ALONE is sufficient", "Statements 1 and 2 together are NOT sufficient"],
          correct: 0,
          explanation: "Statement (1) states k is a multiple of 4. Since any multiple of 4 is even, we can answer 'Is k odd' with a confident 'No'. This is consistent, so Statement (1) alone is sufficient. Statement (2) alone is not sufficient (multiple of 3 can be 3 or 6). Thus, Option A."
        },
        {
          question: "GMAT Grid Elimination: If statement 1 is insufficient, what choices can we immediately cross out?",
          options: ["A and D", "B and C", "C and E", "D and E"],
          correct: 0,
          explanation: "If Statement (1) is insufficient, the valid choices can only be B, C, or E. Therefore, we can immediately cross out A and D."
        }
      ]
    },
    master: {
      summary: "Consistently use the AD/BCE grid. Focus on evaluating whether a single value is determined, rather than calculating it.",
      flashcards: [
        { front: "GMAT Option C", back: "Both statements together are sufficient, but neither alone is." },
        { front: "GMAT Yes/No sufficiency", back: "Answering with a definitive, consistent 'No' counts as sufficient." }
      ],
      cheatsheetRules: [
        "Analyze the question stem thoroughly before moving to the statements.",
        "Keep statements strictly separate during your initial evaluations."
      ]
    }
  },
  'Critical Reasoning: Argument Boldface': {
    understand: {
      theory: `### GMAT Verbal: Argument boldface structures

#### 1. Boldface Functional Roles
GMAT Critical Reasoning features items where portions of the text are bolded. Your goal is to analyze their roles:
- **Evidence/Premise**: Factual context, findings, histories, or statistics.
- **Opinion/Claim**: The author's view or a rival analyst's theory.
- **Conclusion**: The main point supported by premises.
- **Intermediate Conclusion**: A sub-claim that supports the main conclusion.

#### 2. Logical Pivots
Always track semantic transition words between the bold text blocks (e.g., *however, although, therefore, this shows*).`,
      traps: [
        "Confusing factual premises with intermediate conclusions.",
        "Failing to determine if the author supports or opposes the bolded portion."
      ],
      takeaways: [
        "Determine the author's primary position on each bolded statement first.",
        "Map each portion to either a FACT, CLAIM, or CONCLUSION."
      ]
    },
    apply: {
      problemStatement: "Analyze the roles of the bolded statements:\n**The city should not increase parking fees.** This is because **commuters are already heavily taxed**, and raising fees will trigger boycotts.",
      sampleApproach: "1. The first bold statement is the main conclusion of the author's argument.\n2. The second bold statement is a factual premise used to support that conclusion.",
      helperHint: "Identify whether each bold segment is a cause or an effect within the argument's logical flow."
    },
    evaluate: {
      questions: [
        {
          question: "In GMAT terminology, what is 'Intermediate Conclusion'?",
          options: ["A direct piece of factual evidence", "A claim that is supported by some premises but functions as a premise for the final conclusion", "The main point being challenged", "A minor concession to opponents"],
          correct: 1,
          explanation: "An intermediate conclusion is a stepping stone. It is supported by a premise, and itself supports the primary conclusion."
        },
        {
          question: "Identify the role of the bolded section: 'It is highly likely that sales will rise. **Our research team saw double-digit clicks this week.**'",
          options: ["Main conclusion", "Supporting premise / evidence", "Opponent's view", "Unstated assumption"],
          correct: 1,
          explanation: "This bolded section represents factual evidence/observations, serving as a supporting premise for the main conclusion."
        }
      ]
    },
    master: {
      summary: "Track transitions. This topic is a high-yield verbal skill on the GMAT.",
      flashcards: [
        { front: "Intermediate Conclusion", back: "A claim that acts as a bridge, supported by premises and supporting the main takeaway." },
        { front: "Boldface evaluation", back: "Classify each bold block as either a fact, claim, or final conclusion." }
      ],
      cheatsheetRules: [
        "Evaluate each bolded section's function independently.",
        "Check transitions to see if they represent support or opposition."
      ]
    }
  },
  'Multi-Source Reasoning Insights': {
    understand: {
      theory: `### GMAT Focus: Multi-Source Reasoning Heuristics

#### 1. Synthesizing Complex Data
Multi-Source Reasoning requires combining info from multiple source panes (texts, tables, charts, or policies):
- Do not make assumptions. Stick strictly to what is written.
- Track variables that are referenced across multiple tabs.

#### 2. Sorting & Filtering
When tables are provided, use the interactive sort feature to quickly identify extreme values or rank orderings.`,
      traps: [
        "Reading only one tab and skipping contextual constraints on other tabs.",
        "Assuming a trend continues beyond the parameters presented in the datasets."
      ],
      takeaways: [
        "Create brief mental maps of which tab contains which variables before answering questions.",
        "Look for connections or contradictions between different sources."
      ]
    },
    apply: {
      problemStatement: "Tab 1 states that all projects with budgets over $50k require Board approval. Tab 2 shows Project Beta has a budget of $60k. Combine these details.",
      sampleApproach: "Synthesizing Tab 1 and Tab 2 leads directly to the conclusion that Project Beta requires Board approval. This is the basic synthesis pattern.",
      helperHint: "Look for overlapping terms or shared indices across different panes of information."
    },
    evaluate: {
      questions: [
        {
          question: "When evaluating complex Multi-Source text tabs, which strategy is best?",
          options: ["Read and memorize all details on the first pass", "Review the question, locate the relevant keywords, and synthesize across tabs", "Ignore the text and look only at charts", "Guess the most reasonable-sounding answer"],
          correct: 1,
          explanation: "Multi-Source questions evaluate your ability to synthesize information. Locate keywords first, then crosscheck and synthesize across tabs."
        },
        {
          question: "If Tab A lists general policies and Tab B outlines current projects, which statement is most likely true?",
          options: ["Tab A is wrong", "Project outcomes depend on policies in Tab A", "They are unrelated", "Policies in Tab A do not apply directly"],
          correct: 1,
          explanation: "The purpose of multi-source reasoning is to apply high-level policies (Tab A) directly to case specifics (Tab B)."
        }
      ]
    },
    master: {
      summary: "Practice synthesis. Track details systematically across different formats.",
      flashcards: [
        { front: "Synthesis strategy", back: "Locate shared variables across tabs to draw logical conclusions." },
        { front: "Sort heuristic", back: "Use sorting to quickly isolate high and low values." }
      ],
      cheatsheetRules: [
        "Avoid making assumptions outside of the provided text.",
        "Summarize the main idea of each tab in a few words first."
      ]
    }
  },
  'Arithmetic: Work & Rate': {
    understand: {
      theory: `### GMAT Arithmetic Work & Rate Equations

#### 1. Work Rate Formulas
Work is rate multiplied by time:
$$\\text{Work Done} (W) = \\text{Rate} (R) \\times \\text{Time} (T)$$
For a single job ($W=1$), the rate is:
$$R = \\frac{1}{T}$$

#### 2. Simultaneous & Cooperative Rates
When multiple elements cooperate, sum their individual rates:
$$R_{\\text{combined}} = R_1 + R_2 + R_3$$
For a job completed cooperatively:
$$T_{\\text{coop}} = \\frac{1}{R_1 + R_2 + R_3}$$`,
      traps: [
        "Summing transaction times directly instead of compiling rates.",
        "Forgetting to adjust rates when workers join or leave the task mid-way."
      ],
      takeaways: [
        "Convert hours or days to individual unit rates before setting up equations.",
        "Use fractions instead of rounded decimals to maintain exact calculations."
      ]
    },
    apply: {
      problemStatement: "A facility has two printing presses. Press A completes a run in 4 hours, and Press B completes the run in 6 hours. Press A runs alone for 1 hour, then Press B joins. How long does it take to finish the run?",
      sampleApproach: "Determine rates: $R_A = 1/4$, $R_B = 1/6$.\n1. Press A runs for 1 hour: Work completed = $1 \\times 1/4 = 1/4$.\n2. Remaining work = $1 - 1/4 = 3/4$.\n3. Combined rate = $1/4 + 1/6 = 5/12$.\n4. Time to finish remaining work = $\\text{Work} / \\text{Rate} = (3/4) / (5/12) = 9/5 = 1.8$ hours.",
      helperHint: "First calculate the progress made before the second worker joins the effort!"
    },
    evaluate: {
      questions: [
        {
          question: "Machine A produces 100 widgets in 5 hours. Machine B produces 100 widgets in 10 hours. Working together, how long to make 100 widgets?",
          options: ["3.33 hours", "7.5 hours", "2.5 hours", "4.0 hours"],
          correct: 0,
          explanation: "R_A = 1/5 of the job per hour, R_B = 1/10 of the job per hour. Combined rate = 1/5 + 1/10 = 3/10. Time to complete is 10/3 = 3.33 hours."
        },
        {
          question: "If a pool is emptied by a pump at a rate of 1/8 pool/hour, and filled by a pipe at 1/12 pool/hour. If the pool is full, what is the net rate of draining?",
          options: ["1/4 pool/hour", "1/24 pool/hour", "1/20 pool/hour", "5/24 pool/hour"],
          correct: 1,
          explanation: "Net drainage rate = rate of emptying - rate of filling = 1/8 - 1/12 = 3/24 - 2/24 = 1/24"
        }
      ]
    },
    master: {
      summary: "Understand rate accumulation. This is a common and high-frequency GMAT quantitative topic.",
      flashcards: [
        { front: "Cooperative Rate Formula", back: "Combined Rate = Rate A + Rate B" },
        { front: "Individual work rate", back: "Represented as 1/T, where T is the time to complete one entire job." }
      ],
      cheatsheetRules: [
        "Set up a clear Work = Rate x Time table for every rate problem.",
        "Calculate step-by-step for multi-stage work scenarios."
      ]
    }
  },
  'True / False / Not Given Logic': {
    understand: {
      theory: `### IELTS Reading: The Logic of T/F/NG

#### 1. Core Logic Boundaries
This remains the single most challenging section in IELTS Academic Reading. Understand the strict rules:
- **TRUE**: The text provides clear, direct confirmation of the statement.
- **FALSE**: The text directly contradicts the statement (the opposite is true).
- **NOT GIVEN**: The translation is plausible, but there is simply not enough information in the text to confirm or deny the statement.

#### 2. The Trap of Association
Just because synonyms from the statement appear in the passage does not make it TRUE. Look closely at the logical relationships and qualifiers.`,
      traps: [
        "Choosing 'FALSE' when there is no proof of contradiction (this is 'NOT GIVEN').",
        "Overthinking and making assumptions based on real-world knowledge rather than the text."
      ],
      takeaways: [
        "If you cannot find any information that directly supports or contradicts the statement, choose NOT GIVEN.",
        "Pay close attention to absolute qualifiers (e.g., *always, only, all*) vs relative qualifiers (e.g., *sometimes, often, many*)."
      ]
    },
    apply: {
      problemStatement: "Passage: 'Most local residents welcomed the new park, although some voiced concerns about traffic.'\nStatement: 'All local residents were happy with the new park planning.'\nClassify the statement as TRUE, FALSE, or NOT GIVEN.",
      sampleApproach: "The passage states 'Most welcomed ... some voiced concerns'. The statement uses the absolute qualifier 'All ... were happy'. Since there is a direct contradiction ('some voiced concerns' vs 'All were happy'), the statement is FALSE.",
      helperHint: "Look for contradictions between qualifiers in the statement and the passage!"
    },
    evaluate: {
      questions: [
        {
          question: "Passage: 'Research showed that a balanced diet improves performance, though the effect on elderly patients was not studied.' Statement: 'Balanced diets have no beneficial effect on elderly patients.'",
          options: ["TRUE", "FALSE", "NOT GIVEN"],
          correct: 2,
          explanation: "The passage states that the effect on elderly patients was 'not studied'. Since we do not know the effect, the statement is NOT GIVEN."
        },
        {
          question: "Passage: 'The conference was held in Montreal in October 1994.' Statement: 'Montreal was the host city of the conference in 1994.'",
          options: ["TRUE", "FALSE", "NOT GIVEN"],
          correct: 0,
          explanation: "The passage confirms both the host city (Montreal) and the year (1994). Therefore, the statement is TRUE."
        }
      ]
    },
    master: {
      summary: "Apply strict logic. Focus on distinguishing between False (contradiction) and Not Given (no information).",
      flashcards: [
        { front: "TRUE Criteria", back: "The statement directly matches and is supported by facts in the passage." },
        { front: "FALSE Criteria", back: "The statement directly contradicts facts stated in the passage." }
      ],
      cheatsheetRules: [
        "Look for qualifying words like 'only', 'all', or 'sometimes'.",
        "Trust only what is explicitly written in the passage."
      ]
    }
  },
  'Writing Task 1 Overview Mastery': {
    understand: {
      theory: `### IELTS Writing Task 1 visual reports

#### 1. Structure of the Overview Paragraph
The overview is the single most important paragraph in Task 1. Without a strong overview, your Band score is capped at 5.0. It must:
- Outline 2-3 main trends or key developments.
- Avoid listing specific numbers or statistics (keep those for the body paragraphs).

#### 2. Key Vocabulary for Trends
- **Increasing**: *climbed, rose, peaked, grew, surged*.
- **Fluctuating**: *oscillated, hovered, showed volatility*.
- **Stable**: *plateaued, remained constant, steadied*.`,
      traps: [
        "Listing lots of specific numbers in your overview paragraph instead of summarizing main trends.",
        "Overcomplicating the description of secondary details."
      ],
      takeaways: [
        "Keep your overview paragraph focused on the big picture.",
        "Use clear, academic cohesive devices to transition between trends."
      ]
    },
    apply: {
      problemStatement: "A line graph shows carbon emissions rising steadily over 20 years, with a brief dip in 2008. Draft a 2-sentence overview paragraph without using specific numbers.",
      sampleApproach: "Overall, carbon emissions saw a steady upward trend over the 20-year period, despite a brief temporary decline in 2008. This increase was driven primarily by industrial sectors, which became the main source of emissions by the end of the period.",
      helperHint: "Group smaller trends together to describe the overall direction of the graph."
    },
    evaluate: {
      questions: [
        {
          question: "An effective Writing Task 1 overview paragraph should:",
          options: ["Include all data points and numbers", "Summarize 2-3 main overall trends without mentioning specific data values", "Be at least 150 words long", "Evaluate the reasons behind the trends"],
          correct: 1,
          explanation: "An overview should summarize the big picture without listing specific values, which belong in the body paragraphs."
        },
        {
          question: "Which word is a strong synonym for 'remained constant'?",
          options: ["peaked", "plateaued", "fluctuated", "plummeted"],
          correct: 1,
          explanation: "Plateaued describes a leveling off, indicating the data remained relatively stable or constant."
        }
      ]
    },
    master: {
      summary: "Keep your overview paragraph concise and focused. This is key to achieving a Band 7.0+ on Writing Task 1.",
      flashcards: [
        { front: "Overview requirement", back: "An overview must summarize 2-3 main trends without listing specific data values." },
        { front: "Synonym for 'surged'", back: "Rose rapidly or peaked sharply." }
      ],
      cheatsheetRules: [
        "Write your overview immediately after the introduction.",
        "Group the data logically before starting to write."
      ]
    }
  },
  'Speaking Part 2 Cue-Card Structuring': {
    understand: {
      theory: `### IELTS Speaking Part 2 Heuristics

#### 1. The Cue Card Formula
In Part 2, you must speak continuously for 2 minutes on a random topic. Divide your 1-minute preparation time into this planning structure:
- **Who/What**: Introduce the topic immediately.
- **When/Where**: Provide context and background details.
- **Why/How**: Share your personal feelings or explanations (this is where you make the most of your speaking time).

#### 2. Fluency & Coherence
Use logical transition markers to transition between points smoothly, ensuring you don't run out of things to say before the time is up.`,
      traps: [
        "Speaking too quickly and running out of things to say after only 1 minute.",
        "Overcomplicating your notes during prep time instead of writing key bullet points."
      ],
      takeaways: [
        "Use your 1-minute prep time to write down 4-5 key keyword indicators, not full sentences.",
        "Maintain a steady, natural pace and expand on your personal experiences."
      ]
    },
    apply: {
      problemStatement: "Topic: 'Describe a memorable journey you took.' Plan a cohesive 2-minute response using our 4-point planning structure.",
      sampleApproach: "1. Introduce: A road trip along the coast of Spain last summer.\n2. Context: Traveled with close friends during summer break.\n3. Details: Visited scenic villages and tried local seafood.\n4. Explanation: Memorable because it was my first time exploring a new country independently.",
      helperHint: "Use personal anecdotes to help expand your description smoothly!"
    },
    evaluate: {
      questions: [
        {
          question: "In IELTS Speaking Part 2, how long should you speak for?",
          options: ["Exactly 1 minute", "Between 1 and 2 minutes, ideally close to the 2-minute mark", "At least 5 minutes", "Until the examiner stops you at 3 minutes"],
          correct: 1,
          explanation: "You must speak continuously for 1 to 2 minutes. Aim to speak for the full 2 minutes until the examiner stops you."
        },
        {
          question: "What is the best way to use your 1-minute preparation time?",
          options: ["Write down a full, complete script", "Jot down a few key keywords and transitions in a structured layout", "Do nothing and relax", "Memorize a generic template"],
          correct: 1,
          explanation: "Jotting down structured keywords and transitions helps guide your speech smoothly without getting stuck."
        }
      ]
    },
    master: {
      summary: "Speak naturally, manage your pace, and expand on your main points. This is key to scoring a Band 7.0+ on Speaking Part 2.",
      flashcards: [
        { front: "Speaking Part 2 structure", back: "Who/What, When/Where, Why/How, and personal reflections." },
        { front: "Monologue pacing", back: "Speak at a steady, natural pace to ensure you fill the 2-minute window smoothly." }
      ],
      cheatsheetRules: [
        "Expand on each point with personal details and examples.",
        "Keep eye contact with the examiner and speak clearly."
      ]
    }
  },
  'Cohesion & Coherence Lexicon': {
    understand: {
      theory: `### IELTS Writing Task 2 Cohesion Heuristics

#### 1. Cohesive Devices & Linkages
For Writing Task 2, cohesion represents 25% of your band score. Vary your connectors:
- **Contrast**: *however, on the other hand, conversely, nevertheless*.
- **Result**: *consequently, as a result, as a corollary, therefore*.
- **Examples**: *for instance, to illustrate, namely, as a case in point*.

#### 2. Paragraph Unity
Ensure each paragraph contains exactly one clearly defined central idea, supported by logical evidence and reasoning.`,
      traps: [
        "Overusing transition words at the start of every sentence (this can feel robotic).",
        "Introducing unrelated ideas in the same body paragraph."
      ],
      takeaways: [
        "Vary your connectors and place them naturally within your sentences.",
        "Begin every paragraph with a clear, concise topic sentence."
      ]
    },
    apply: {
      problemStatement: "Draft a body paragraph arguing that online education is convenient. Use at least 3 advanced cohesive devices naturally.",
      sampleApproach: "Online education offer unparalleled flexibility for modern students. For instance, learners can access study materials anytime, allowing them to balance education with work. Consequently, this flexibility helps make higher education accessible to a wider auditory, nevertheless requiring strong self-discipline.",
      helperHint: "Integrate connectors naturally within your sentences to ensure your writing flows smoothly."
    },
    evaluate: {
      questions: [
        {
          question: "Which of the following is a strong, formal synonym for 'as a result'?",
          options: ["likewise", "consequently", "furthermore", "on the contrary"],
          correct: 1,
          explanation: "Consequently is a formal transitional word used to introduce a result or effect."
        },
        {
          question: "What does 'cohesion' evaluate in your writing?",
          options: ["Your vocabulary range", "How logically your ideas are organized and connected", "Your grammar accuracy", "The length of your essay"],
          correct: 1,
          explanation: "Cohesion evaluates how well your ideas and sentences flow, organize, and connect with each other."
        }
      ]
    },
    master: {
      summary: "Vary your cohesive devices and ensure your paragraphs are unified. This is key to achieving a Band 7.0+ on Writing Task 2.",
      flashcards: [
        { front: "Cohesion weight", back: "Cohesion represents 25% of your overall Writing band score." },
        { front: "Topic sentence purpose", back: "Introduces the main, single idea of the paragraph clearly." }
      ],
      cheatsheetRules: [
        "Place transitions naturally within your sentences.",
        "Explain each point clearly before moving to the next."
      ]
    }
  }
};
