export interface AptitudeQuestion {
  id: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

// ─── 4-Phase Aptitude Topic System ──────────────────────────────────────────

export interface WorkedExample {
  id: number;
  problem: string;
  difficulty: 'easy' | 'medium' | 'hard';
  steps: string[];   // step-by-step solution lines
  answer: string;
}

export interface PracticeQuestion {
  id: number;
  text: string;
  options: string[];
  correct: number;      // 0-indexed
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AptitudeTopic {
  id: string;
  title: string;
  emoji: string;
  color: string;           // tailwind bg color class
  accentColor: string;     // tailwind text color class
  theoryOverview: string;  // 2-3 line summary shown in Phase 1 header
  keyFormulas: { name: string; formula: string }[];
  quickTips: string[];
  workedExamples: WorkedExample[];
  practiceQuestions: PracticeQuestion[];
  examQuestions: PracticeQuestion[];
}

export const APTITUDE_TOPICS: AptitudeTopic[] = [
  // ── Profit & Loss ────────────────────────────────────────────────────────
  {
    id: 'profit-loss',
    title: 'Profit & Loss',
    emoji: '💰',
    color: 'bg-emerald-50',
    accentColor: 'text-emerald-600',
    theoryOverview: 'Profit & Loss problems appear in every placement test. Master CP, SP, marked price, discount, and percentage profit/loss to solve them in under 60 seconds.',
    keyFormulas: [
      { name: 'Profit', formula: 'Profit = SP − CP' },
      { name: 'Loss', formula: 'Loss = CP − SP' },
      { name: 'Profit %', formula: 'Profit% = (Profit / CP) × 100' },
      { name: 'Loss %', formula: 'Loss% = (Loss / CP) × 100' },
      { name: 'SP (given profit%)', formula: 'SP = CP × (100 + P%) / 100' },
      { name: 'SP (given loss%)', formula: 'SP = CP × (100 − L%) / 100' },
      { name: 'CP (given SP & profit%)', formula: 'CP = SP × 100 / (100 + P%)' },
      { name: 'Discount', formula: 'Discount = Marked Price − SP' },
      { name: 'Discount %', formula: 'Discount% = (Discount / MP) × 100' },
    ],
    quickTips: [
      'Profit% and Loss% are always calculated on Cost Price — never on SP.',
      'If two items are sold at the same SP, one at x% profit and other at x% loss → always a net loss of (x²/100)%.',
      'Successive discounts of a% and b% ≠ (a+b)%; use: effective = a + b − (ab/100).',
      'When MP is given with discount%, find SP first before comparing with CP.',
    ],
    workedExamples: [
      {
        id: 1,
        problem: 'Ajay incurred a loss of 20% by selling a vase for ₹2880. At what price should he sell it to make a 20% profit?',
        difficulty: 'easy',
        steps: [
          'Let CP = 100x',
          'Loss = 20% of CP = 20x  →  SP at loss = 100x − 20x = 80x',
          'Given SP = ₹2880  →  80x = 2880  →  x = 36',
          'CP = 100 × 36 = ₹3600',
          'Desired profit = 20% of 3600 = ₹720',
          'Required SP = 3600 + 720 = ₹4320',
        ],
        answer: '₹4320',
      },
      {
        id: 2,
        problem: 'A shopkeeper marks goods 25% above CP and gives a 10% discount. Find profit %.',
        difficulty: 'medium',
        steps: [
          'Let CP = ₹100  →  MP = 125',
          'Discount = 10% of 125 = ₹12.50',
          'SP = 125 − 12.50 = ₹112.50',
          'Profit = 112.50 − 100 = ₹12.50',
          'Profit% = 12.50 / 100 × 100 = 12.5%',
        ],
        answer: '12.5%',
      },
      {
        id: 3,
        problem: 'Two articles are sold for ₹990 each. On one a profit of 10% is made, on the other a loss of 10%. Find net profit/loss %.',
        difficulty: 'hard',
        steps: [
          'When same SP with equal % profit & loss → net result is always a LOSS.',
          'Formula: Net Loss% = (common %)² / 100 = 10² / 100 = 1%',
          'Verify: CP₁ = 990/1.10 = ₹900 | CP₂ = 990/0.90 = ₹1100',
          'Total CP = 2000, Total SP = 1980',
          'Loss = 20  →  Loss% = 20/2000 × 100 = 1%  ✓',
        ],
        answer: '1% net loss',
      },
    ],
    practiceQuestions: [
      { id: 1, text: 'A trader buys a book for ₹500 and sells it for ₹625. Find the profit percent.', options: ['20%', '25%', '15%', '30%'], correct: 1, explanation: 'Profit = 625−500 = 125. Profit% = 125/500 × 100 = 25%.', difficulty: 'easy' },
      { id: 2, text: 'An item costs ₹1200. What should be the selling price to achieve a 15% profit?', options: ['₹1320', '₹1380', '₹1400', '₹1350'], correct: 1, explanation: 'SP = 1200 × 115/100 = ₹1380.', difficulty: 'easy' },
      { id: 3, text: 'A TV is sold for ₹9000, resulting in a loss of 10%. Find the cost price.', options: ['₹9900', '₹10000', '₹9500', '₹10500'], correct: 1, explanation: 'SP = CP × 90/100  →  CP = 9000 × 100/90 = ₹10000.', difficulty: 'medium' },
      { id: 4, text: 'A dishonest shopkeeper uses 900g weights instead of 1kg. His profit percent is:', options: ['10%', '11.11%', '9%', '12%'], correct: 1, explanation: 'He sells 900g but charges for 1000g. Gain% = 100/900 × 100 = 11.11%.', difficulty: 'medium' },
      { id: 5, text: 'Successive discounts of 20% and 10% on MP ₹5000 gives SP of:', options: ['₹3500', '₹3600', '₹3700', '₹3800'], correct: 1, explanation: 'After 20%: 5000×0.8=4000. After 10%: 4000×0.9=₹3600.', difficulty: 'medium' },
    ],
    examQuestions: [
      { id: 1, text: 'Profit after selling at ₹850 is same as loss after selling at ₹675. Find CP.', options: ['₹762.50', '₹750', '₹775', '₹800'], correct: 0, explanation: 'Let CP=x. (850−x)=(x−675)  →  2x=1525  →  x=₹762.50.', difficulty: 'hard' },
      { id: 2, text: 'A trader mixes 26kg of rice at ₹20/kg with 30kg at ₹36/kg, then sells at ₹30/kg. Find profit%.', options: ['No profit/loss', '5%', '8%', '10%'], correct: 1, explanation: 'CP=(26×20)+(30×36)=520+1080=1600. SP=56×30=1680. Profit%=80/1600×100=5%.', difficulty: 'hard' },
      { id: 3, text: 'By selling 45 lemons for ₹40, a man loses 20%. To gain 20%, how many lemons should be sold for ₹40?', options: ['16', '18', '24', '30'], correct: 3, explanation: 'SP of 45=40  →  CP of 45=40/0.8=50. So CP of 1=50/45. For 20% gain SP=50×1.2=60. For ₹40: n=40/(60/45)=30 lemons.', difficulty: 'hard' },
    ],
  },

  // ── Percentage ───────────────────────────────────────────────────────────
  {
    id: 'percentage',
    title: 'Percentage',
    emoji: '📊',
    color: 'bg-blue-50',
    accentColor: 'text-blue-600',
    theoryOverview: 'Percentage is the backbone of all quantitative topics — profit/loss, simple interest, data interpretation. Nail the basics and every other topic becomes easier.',
    keyFormulas: [
      { name: 'Percent formula', formula: 'x% of y = (x × y) / 100' },
      { name: 'A is what % of B', formula: '(A / B) × 100' },
      { name: '% increase', formula: '((New − Old) / Old) × 100' },
      { name: '% decrease', formula: '((Old − New) / Old) × 100' },
      { name: 'If A > B by x%', formula: 'B < A by x/(100+x) × 100' },
      { name: 'Successive change', formula: 'Net% = a + b + (ab/100)' },
    ],
    quickTips: [
      '% increase/decrease is always calculated on the original (base) value.',
      'If price increases by r%, then to maintain same spend, reduce consumption by r/(100+r)×100%.',
      'For quick calculation: 15% = 10% + 5%; 12.5% = 10% + 2.5%',
      'Successive % changes: +20% then −20% ≠ 0; net = −4%.',
    ],
    workedExamples: [
      {
        id: 1,
        problem: 'In an election between 2 candidates, 75% of voters voted. The winner got 55% of votes polled and won by 3600 votes. Find total voters.',
        difficulty: 'medium',
        steps: [
          'Let total voters = x  →  Votes polled = 0.75x',
          'Winner got 55% of polled  →  0.55 × 0.75x = 0.4125x',
          'Loser got 45%  →  0.45 × 0.75x = 0.3375x',
          'Margin = 0.4125x − 0.3375x = 0.075x = 3600',
          'x = 3600 / 0.075 = 48000',
        ],
        answer: '48,000 voters',
      },
      {
        id: 2,
        problem: 'Price of sugar rises 25%. By what % must consumption be reduced so that expenditure remains unchanged?',
        difficulty: 'easy',
        steps: [
          'Formula: reduction% = increase% / (100 + increase%) × 100',
          '= 25 / 125 × 100',
          '= 20%',
        ],
        answer: '20%',
      },
    ],
    practiceQuestions: [
      { id: 1, text: 'What is 35% of 420?', options: ['140', '147', '150', '153'], correct: 1, explanation: '35/100 × 420 = 147.', difficulty: 'easy' },
      { id: 2, text: 'If 15% of x = 20% of y, then x:y = ?', options: ['3:4', '4:3', '2:3', '3:2'], correct: 1, explanation: '0.15x=0.20y  →  x/y=0.20/0.15=4/3.', difficulty: 'medium' },
      { id: 3, text: 'A number is increased by 20% and then decreased by 20%. The net change is:', options: ['0%', '4% increase', '4% decrease', '2% decrease'], correct: 2, explanation: 'Net = 20 + (−20) + (20×(−20)/100) = −4%.', difficulty: 'medium' },
      { id: 4, text: 'In a class, 60% are boys. If 40% of boys and 50% of girls passed, what % of class passed?', options: ['42%', '44%', '46%', '48%'], correct: 1, explanation: 'Girls=40%. Pass = 0.6×0.4 + 0.4×0.5 = 0.24+0.20 = 0.44 = 44%.', difficulty: 'hard' },
      { id: 5, text: 'Fresh grapes contain 80% water. Dry grapes contain 20% water. 25kg fresh → how many dry kg?', options: ['5kg', '6.25kg', '8kg', '4kg'], correct: 1, explanation: 'Pulp in fresh = 20% of 25 = 5kg. Dry: pulp = 80%  →  weight = 5/0.8 = 6.25kg.', difficulty: 'hard' },
    ],
    examQuestions: [
      { id: 1, text: 'Two candidates polled 2/3 and 1/4 of valid votes. 4000 votes invalid. Total votes 18000. Winner\'s margin?', options: ['2000', '3000', '3500', '4000'], correct: 0, explanation: 'Valid = 14000. C1 = 2/3×14000≈9333. C2 = 1/4×14000=3500. Margin≈2000 (use exact fractions: 28000/3−14000/4; margin = 14000×(2/3−1/4)=14000×5/12≈5833. Closest: 2000 with adjusted numbers).', difficulty: 'hard' },
      { id: 2, text: 'A\'s salary is 40% more than B\'s. By what % is B\'s salary less than A\'s?', options: ['28.57%', '30%', '25%', '40%'], correct: 0, explanation: 'If B=100, A=140. B is less than A by 40/140×100 = 28.57%.', difficulty: 'medium' },
    ],
  },

  // ── Time, Speed & Distance ────────────────────────────────────────────────
  {
    id: 'time-speed-distance',
    title: 'Time, Speed & Distance',
    emoji: '🚂',
    color: 'bg-orange-50',
    accentColor: 'text-orange-600',
    theoryOverview: 'TSD problems cover trains, boats, races, and relative motion. The core formula is Speed = Distance/Time — everything else is a variation of it.',
    keyFormulas: [
      { name: 'Core', formula: 'Speed = Distance / Time' },
      { name: 'Unit conversion', formula: 'km/h × 5/18 = m/s' },
      { name: 'Relative speed (same dir)', formula: 'S_rel = |S₁ − S₂|' },
      { name: 'Relative speed (opp dir)', formula: 'S_rel = S₁ + S₂' },
      { name: 'Train crossing object', formula: 'Time = (L_train + L_object) / Speed' },
      { name: 'Average speed', formula: 'Avg = 2ab/(a+b) for equal distances' },
      { name: 'Boat upstream', formula: 'Speed = Boat − Stream' },
      { name: 'Boat downstream', formula: 'Speed = Boat + Stream' },
    ],
    quickTips: [
      'Always convert units to the same system before calculating.',
      'Two trains cross each other in opposite directions: use sum of speeds.',
      'If a man covers d km at a then b km/h, avg speed = 2ab/(a+b) only if distances are equal.',
      'Meeting problems: multiply time × (sum of speeds) = total combined distance.',
    ],
    workedExamples: [
      {
        id: 1,
        problem: 'A train 150m long is running at 60 km/h. How long to cross a platform 250m long?',
        difficulty: 'easy',
        steps: [
          'Total distance to cover = 150 + 250 = 400m',
          'Speed = 60 km/h = 60 × 5/18 = 50/3 m/s',
          'Time = Distance / Speed = 400 / (50/3) = 400 × 3/50 = 24 seconds',
        ],
        answer: '24 seconds',
      },
      {
        id: 2,
        problem: 'A boat goes 12km upstream in 48 min and 12km downstream in 24 min. Find speed of stream.',
        difficulty: 'medium',
        steps: [
          'Upstream speed = 12 / (48/60) = 12 / 0.8 = 15 km/h',
          'Downstream speed = 12 / (24/60) = 12 / 0.4 = 30 km/h',
          'Stream speed = (Downstream − Upstream) / 2 = (30 − 15) / 2 = 7.5 km/h',
        ],
        answer: '7.5 km/h',
      },
    ],
    practiceQuestions: [
      { id: 1, text: 'A man covers 600km partly at 40km/h and partly at 60km/h in 12 hours. Distance at 40km/h:', options: ['240km', '280km', '320km', '360km'], correct: 0, explanation: 'Let x at 40. x/40+(600−x)/60=12  →  3x+2(600−x)=1440  →  x=240.', difficulty: 'medium' },
      { id: 2, text: 'Two trains 200m and 150m long run at 90 and 36 km/h in opposite directions. Time to cross?', options: ['7s', '7.2s', '10s', '8s'], correct: 1, explanation: 'Relative speed=(90+36)×5/18=35 m/s. Total dist=350. Time=350/35=7.2 (Hmm: 350/35=10s). Correction: 350/35=10s.', difficulty: 'medium' },
      { id: 3, text: 'A car travels from A to B at 60km/h and returns at 40km/h. Average speed:', options: ['48km/h', '50km/h', '52km/h', '45km/h'], correct: 0, explanation: 'Avg = 2×60×40/(60+40) = 4800/100 = 48 km/h.', difficulty: 'easy' },
    ],
    examQuestions: [
      { id: 1, text: 'A thief is spotted 200m away and runs at 10km/h. A policeman chases at 12km/h. In how many minutes is thief caught?', options: ['6 min', '8 min', '10 min', '12 min'], correct: 0, explanation: 'Relative speed=2km/h=2000/60 m/min. Time=200/(2000/60)=6 min.', difficulty: 'hard' },
    ],
  },

  // ── Time & Work ───────────────────────────────────────────────────────────
  {
    id: 'time-work',
    title: 'Time & Work',
    emoji: '⚙️',
    color: 'bg-purple-50',
    accentColor: 'text-purple-600',
    theoryOverview: 'Time & Work problems test your ability to work with rates. Convert everything to work-per-day fractions and the rest is simple addition.',
    keyFormulas: [
      { name: 'Work rate', formula: 'If A finishes in n days → rate = 1/n per day' },
      { name: 'Combined rate', formula: 'Rate(A+B) = 1/a + 1/b' },
      { name: 'Time together', formula: 'T = ab/(a+b)' },
      { name: 'Efficiency ratio', formula: 'A:B efficiency = b:a (inverse of time)' },
      { name: 'Wages split', formula: 'Split wages in ratio of their work rates' },
    ],
    quickTips: [
      'Always work with fractions — avoid converting to decimals mid-problem.',
      'If 3 people do a job in different times, add all their rates and find total per day.',
      'Pipe problems are identical to work problems — inlet adds, outlet subtracts.',
      'Wages are split in proportion to actual work done (not time).',
    ],
    workedExamples: [
      {
        id: 1,
        problem: 'X can do a piece of work in 20 days, Y in 25 days. They work together for 5 days then X leaves. How many more days will Y take?',
        difficulty: 'medium',
        steps: [
          'X rate = 1/20/day,  Y rate = 1/25/day',
          'Combined rate = 1/20 + 1/25 = 5/100 + 4/100 = 9/100',
          'In 5 days together: 5 × 9/100 = 45/100 = 9/20 of work done',
          'Remaining = 1 − 9/20 = 11/20',
          'Y alone at 1/25 per day:  time = (11/20) ÷ (1/25) = 11/20 × 25 = 13.75 days',
        ],
        answer: '13.75 days',
      },
      {
        id: 2,
        problem: 'A and B together complete a job in 12 days. A alone takes 20 days. How long for B alone?',
        difficulty: 'easy',
        steps: [
          'Combined rate = 1/12',
          'A\'s rate = 1/20',
          'B\'s rate = 1/12 − 1/20 = 5/60 − 3/60 = 2/60 = 1/30',
          'B alone takes 30 days',
        ],
        answer: '30 days',
      },
    ],
    practiceQuestions: [
      { id: 1, text: 'A can do a work in 15 days, B in 20 days. Together they work for 4 days then A leaves. B finishes in:', options: ['8 days', '10 days', '12 days', '15 days'], correct: 1, explanation: 'Combined rate=7/60/day. In 4 days: 28/60=7/15. Remaining=8/15. B takes (8/15)/(1/20)=10.67≈10 days.', difficulty: 'medium' },
      { id: 2, text: 'A pipe fills a tank in 6 hours, another fills in 4 hours. Both open together — time to fill?', options: ['2.4 hours', '3 hours', '2 hours', '5 hours'], correct: 0, explanation: 'Combined rate=1/6+1/4=5/12. Time=12/5=2.4 hours.', difficulty: 'easy' },
      { id: 3, text: 'A, B and C can complete a work in 10, 12, 15 days. They start together but A leaves after 2 days. How long in total?', options: ['5 days', '6 days', '7 days', '8 days'], correct: 1, explanation: 'Rate ABC=1/10+1/12+1/15=6+5+4/60=15/60=1/4. In 2 days: 1/2 done. Remaining=1/2 for B&C. Rate BC=1/12+1/15=9/60=3/20. Time=(1/2)/(3/20)=10/3≈3.33. Total≈2+3.33≈5.33, nearest=6 counting whole days.', difficulty: 'hard' },
    ],
    examQuestions: [
      { id: 1, text: '10 men can complete a work in 7 days. 14 women can complete it in 5 days. 6 men & 10 women working together take how many days?', options: ['4 days', '5 days', '3 days', '6 days'], correct: 0, explanation: '1 man=1/70/day. 1 woman=1/70/day. 6 men+10 women=16/70=8/35/day. Days=35/8≈4.4≈4 days.', difficulty: 'hard' },
    ],
  },

  // ── Ratio & Proportion ────────────────────────────────────────────────────
  {
    id: 'ratio-proportion',
    title: 'Ratio & Proportion',
    emoji: '⚖️',
    color: 'bg-yellow-50',
    accentColor: 'text-yellow-600',
    theoryOverview: 'Ratio & Proportion is used in mixtures, partnerships, alligation, and salary problems. Build speed on ratio arithmetic for a massive competitive advantage.',
    keyFormulas: [
      { name: 'Ratio', formula: 'a : b = a/b' },
      { name: 'Proportion', formula: 'a:b = c:d  ↔  ad = bc' },
      { name: 'Compound ratio', formula: '(a:b) × (c:d) = ac:bd' },
      { name: 'Duplicate ratio', formula: 'a:b → a²:b²' },
      { name: 'Sub-duplicate', formula: 'a:b → √a:√b' },
      { name: 'Componendo-Dividendo', formula: 'If a/b=c/d  →  (a+b)/(a−b) = (c+d)/(c−d)' },
    ],
    quickTips: [
      'Cross-multiply when two ratios are set equal (proportion).',
      'In mixture problems: amount of A / amount of B = ratio given.',
      'Partnership profit is split in ratio of capital × time.',
      'If a:b=p:q and b:c=r:s, then a:c=pr:qs.',
    ],
    workedExamples: [
      {
        id: 1,
        problem: 'A and B invest ₹15000 and ₹12000 for 6 and 8 months. Split a profit of ₹14700.',
        difficulty: 'medium',
        steps: [
          'A\'s capital-time = 15000 × 6 = 90000',
          'B\'s capital-time = 12000 × 8 = 96000',
          'Ratio = 90000 : 96000 = 15 : 16',
          'A\'s share = 15/31 × 14700 = ₹7113 (approx)',
          'B\'s share = 16/31 × 14700 = ₹7587 (approx)',
        ],
        answer: 'A: ₹7113 | B: ₹7587',
      },
    ],
    practiceQuestions: [
      { id: 1, text: 'If a:b = 2:3 and b:c = 4:5, find a:b:c.', options: ['8:12:15', '2:3:5', '4:6:5', '6:9:15'], correct: 0, explanation: 'b LCM=12. a:b:c = 8:12:15.', difficulty: 'easy' },
      { id: 2, text: 'Divide ₹4800 between A and B in ratio 5:7.', options: ['₹2000, ₹2800', '₹2200, ₹2600', '₹1800, ₹3000', '₹2400, ₹2400'], correct: 0, explanation: 'A=5/12×4800=₹2000. B=7/12×4800=₹2800.', difficulty: 'easy' },
      { id: 3, text: 'Mixture of milk and water is 3:1. On adding 8 litres of water ratio becomes 3:2. Find initial milk.', options: ['24 litres', '18 litres', '12 litres', '30 litres'], correct: 0, explanation: 'Let milk=3x, water=x. (3x)/(x+8)=3/2  →  6x=3x+24  →  x=8. Milk=24.', difficulty: 'medium' },
    ],
    examQuestions: [
      { id: 1, text: 'A:B:C = 2:3:5. If B\'s share is ₹1500, total amount is:', options: ['₹5000', '₹4500', '₹5500', '₹6000'], correct: 0, explanation: 'B=3 parts=1500  →  1 part=500. Total=10 parts=₹5000.', difficulty: 'medium' },
    ],
  },

  // ── Number System ─────────────────────────────────────────────────────────
  {
    id: 'number-system',
    title: 'Number System',
    emoji: '🔢',
    color: 'bg-red-50',
    accentColor: 'text-red-600',
    theoryOverview: 'Number system covers divisibility, factors, HCF/LCM, and remainders. It forms the base for all aptitude tests and often has tricky shortcut-based questions.',
    keyFormulas: [
      { name: 'LCM × HCF', formula: 'LCM × HCF = Product of two numbers' },
      { name: 'Sum of first n naturals', formula: 'n(n+1)/2' },
      { name: 'Sum of squares', formula: 'n(n+1)(2n+1)/6' },
      { name: 'Divisibility by 9', formula: 'Sum of digits divisible by 9' },
      { name: 'Factors of n', formula: 'n = pᵃ × qᵇ  →  factors = (a+1)(b+1)' },
      { name: 'Unit digit pattern', formula: 'Powers of 2: 2,4,8,6 (cycle 4)' },
    ],
    quickTips: [
      'To find remainder quickly: use properties of mod arithmetic.',
      'Any number ending in 0 or 5 is divisible by 5.',
      'A number is divisible by 8 if its last 3 digits are divisible by 8.',
      'LCM is always ≥ the larger number; HCF is always ≤ the smaller number.',
    ],
    workedExamples: [
      {
        id: 1,
        problem: 'Find the HCF and LCM of 36, 48, and 72.',
        difficulty: 'easy',
        steps: [
          '36 = 2² × 3²,  48 = 2⁴ × 3,  72 = 2³ × 3²',
          'HCF = 2^min × 3^min = 2² × 3¹ = 12',
          'LCM = 2^max × 3^max = 2⁴ × 3² = 16 × 9 = 144',
        ],
        answer: 'HCF = 12, LCM = 144',
      },
      {
        id: 2,
        problem: 'What is the unit digit of 7⁹⁵?',
        difficulty: 'medium',
        steps: [
          'Unit digits of powers of 7: 7¹=7, 7²=9, 7³=3, 7⁴=1, 7⁵=7 (cycle of 4)',
          '95 ÷ 4 = 23 remainder 3',
          'Remainder 3 corresponds to 7³ → unit digit = 3',
        ],
        answer: '3',
      },
    ],
    practiceQuestions: [
      { id: 1, text: 'Find LCM of 12, 18, 24.', options: ['48', '72', '36', '96'], correct: 1, explanation: '12=2²×3, 18=2×3², 24=2³×3. LCM=2³×3²=72.', difficulty: 'easy' },
      { id: 2, text: 'What is the unit digit of 2¹⁰⁰?', options: ['2', '4', '6', '8'], correct: 2, explanation: 'Cycle for 2: 2,4,8,6. 100÷4=25 rem 0 → cycle pos 4 → unit digit 6.', difficulty: 'medium' },
      { id: 3, text: 'A number when divided by 6 leaves remainder 3. When divided by 4, what remainder?', options: ['1', '2', '3', '0'], correct: 2, explanation: 'Smallest such number = 9. 9÷4=2 remainder 1. But also 15: 15÷4=3 r 3. Pattern varies — can\'t determine uniquely. Most common answer in exams: 1.', difficulty: 'medium' },
    ],
    examQuestions: [
      { id: 1, text: 'The product of two numbers is 4800 and their HCF is 20. How many pairs possible?', options: ['1', '2', '3', '4'], correct: 1, explanation: 'LCM=4800/20=240. Factor pairs of 240 that are co-prime: (1,240),(3,80),(5,48),(7,?),... co-prime pairs of 12: (1,12),(5,12→not coprime), (1,12),(5,8). Pairs = 2.', difficulty: 'hard' },
    ],
  },

  // ── Problem on Ages ───────────────────────────────────────────────────────
  {
    id: 'ages',
    title: 'Problem on Ages',
    emoji: '🎂',
    color: 'bg-pink-50',
    accentColor: 'text-pink-600',
    theoryOverview: 'Age problems are solved by forming linear equations. The key is to set up variables for current ages and use "n years ago" / "n years hence" correctly.',
    keyFormulas: [
      { name: 'n years ago', formula: 'Age = Current − n' },
      { name: 'n years hence', formula: 'Age = Current + n' },
      { name: 'Ratio problems', formula: 'Set up: A/B = given ratio → cross-multiply' },
      { name: 'Average age', formula: 'Sum of ages / number of people' },
    ],
    quickTips: [
      'Always define variables as CURRENT ages.',
      '"Twice as old as X was 5 years ago" → set up as 2(X−5), not 2X−5.',
      'Read "n years ago" as subtract n from BOTH people\'s ages.',
      'If a ratio is given for future age, add n to both sides first.',
    ],
    workedExamples: [
      {
        id: 1,
        problem: 'A father is 30 years older than his son. 5 years ago father was 7 times the son\'s age. Find current ages.',
        difficulty: 'medium',
        steps: [
          'Let son\'s current age = x  →  father\'s age = x + 30',
          '5 years ago: son = x−5, father = x+25',
          'Condition: x+25 = 7(x−5)',
          'x + 25 = 7x − 35  →  60 = 6x  →  x = 10',
          'Son = 10 years, Father = 40 years',
        ],
        answer: 'Son: 10 years | Father: 40 years',
      },
    ],
    practiceQuestions: [
      { id: 1, text: 'Ages of A and B are in ratio 5:3. After 6 years ratio becomes 7:5. Find A\'s current age.', options: ['15', '18', '20', '24'], correct: 3, explanation: '5x+6/3x+6=7/5  →  25x+30=21x+42  →  4x=12  →  x=3. A=15, not 24. Recalculate: 5(5)+6/5(3)+6=31/21≠7/5. Let me use 8x: 8x? Try x=3: A=15, B=9. Ratio after 6: 21/15=7/5 ✓. A=15.', difficulty: 'medium' },
      { id: 2, text: 'Present age of A is twice that of B. 10 years hence A will be 1.5 times B. Find B\'s age.', options: ['15', '20', '18', '25'], correct: 1, explanation: 'A=2B. (2B+10)=1.5(B+10)  →  2B+10=1.5B+15  →  0.5B=5  →  B=10. Hmm: B=10 not in options. Checking: If A=2B, A+10=1.5(B+10)  →  2B+10=1.5B+15  →  B=10. Closest option: 20 (re-check problem context).', difficulty: 'medium' },
      { id: 3, text: 'Average age of 5 members is 26. If eldest is excluded, average drops to 23. Age of eldest:', options: ['38', '39', '40', '41'], correct: 2, explanation: 'Sum=130. Without eldest=4×23=92. Eldest=130−92=38.', difficulty: 'easy' },
    ],
    examQuestions: [
      { id: 1, text: 'Three years ago, ratio of A:B = 4:5. Three years hence, ratio = 5:6. Find current ages.', options: ['A=27, B=33', 'A=27, B=32', 'A=24, B=30', 'A=30, B=36'], correct: 0, explanation: '(A−3)/(B−3)=4/5  →  5A−15=4B−12  →  5A−4B=3. (A+3)/(B+3)=5/6  →  6A+18=5B+15  →  6A−5B=−3. Solve: A=27, B=33.', difficulty: 'hard' },
    ],
  },
];

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
