export interface PersonalityOption {
  text: string;
  value: string;
}

export interface PersonalityQuestion {
  id: number;
  category: string;
  text: string;
  options: PersonalityOption[];
}

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  {
    id: 1,
    category: 'Innovation',
    text: 'When faced with a "tried and true" method that is slightly inefficient, my first instinct is to:',
    options: [
      { text: 'Follow the protocol to ensure 100% reliability', value: 'resilience' },
      { text: 'Look for immediate shortcuts to save time', value: 'execution' },
      { text: 'Brainstorm an entirely new system, even if it carries risk', value: 'creativity' }
    ]
  },
  {
    id: 2,
    category: 'Resilience',
    text: 'After a major project failure, I find that I am back to my full productivity levels after:',
    options: [
      { text: 'A few hours (I move on instantly)', value: 'high_resilience' },
      { text: 'A day or two (I need to process the data)', value: 'mid_resilience' },
      { text: 'A week (I analyze the failure deeply)', value: 'analytical' }
    ]
  },
  {
    id: 3,
    category: 'Logic',
    text: 'A manager gives you conflicting instructions. The most logical first step is:',
    options: [
      { text: 'Follow the most recent instruction', value: 'direct' },
      { text: 'Pause both and seek a synchronization meeting', value: 'strategic' },
      { text: 'Execute the one that provides the most business value', value: 'autonomous' }
    ]
  },
  {
    id: 4,
    category: 'Leadership',
    text: 'In a group project where no one is taking charge, I typically:',
    options: [
      { text: 'Wait for someone else to step up to avoid overstepping', value: 'team_player' },
      { text: 'Directly assign tasks to keep things moving', value: 'assertive' },
      { text: 'Ask questions that naturally lead the group to consensus', value: 'influencer' }
    ]
  },
  {
    id: 5,
    category: 'Adaptability',
    text: 'If my role changed completely tomorrow due to AI automation, I would:',
    options: [
      { text: 'Feel anxious about my long-term job security', value: 'stable' },
      { text: 'Immediately start learning the tools that replaced me', value: 'agile' },
      { text: 'See it as an opportunity to pivot into a new creative field', value: 'visionary' }
    ]
  },
  {
    id: 6,
    category: 'Stress Management',
    text: 'Under a tight 24-hour deadline, my performance usually:',
    options: [
      { text: 'Peaks as the pressure clarifies my focus', value: 'high_stress_performer' },
      { text: 'Remains steady but I might make minor errors', value: 'consistent' },
      { text: 'Declines as I worry about the quality of the output', value: 'quality_focused' }
    ]
  },
  {
    id: 7,
    category: 'Collaboration',
    text: 'When a teammate takes credit for my work during a meeting, I:',
    options: [
      { text: 'Let it go to maintain harmony in the group', value: 'harmonizer' },
      { text: 'Politely clarify my contribution during the discussion', value: 'direct' },
      { text: 'Speak to them privately afterward about boundaries', value: 'diplomatic' }
    ]
  },
  {
    id: 8,
    category: 'Growth Mindset',
    text: 'I prefer to receive feedback that is:',
    options: [
      { text: 'Validating and supportive of my progress', value: 'encouragement_seeker' },
      { text: 'Blunt and highlights my specific technical flaws', value: 'optimization_seeker' },
      { text: 'Focused on my potential for leadership', value: 'ambition_seeker' }
    ]
  },
  {
    id: 9,
    category: 'Decision Making',
    text: 'When making a high-stakes decision with 70% of the data available, I:',
    options: [
      { text: 'Trust my intuition and move forward immediately', value: 'intuitive' },
      { text: 'Wait for the remaining 30% even if it delays the project', value: 'precisionist' },
      { text: 'Build a fallback plan and execute with the 70%', value: 'risk_manager' }
    ]
  },
  {
    id: 10,
    category: 'Conflict Resolution',
    text: 'When two key stakeholders disagree, my instinct is to:',
    options: [
      { text: 'Stay out of it until they resolve it', value: 'hands_off' },
      { text: 'Act as a mediator to find common ground', value: 'mediator' },
      { text: 'Side with the logic that has the best ROI', value: 'pragmatic' }
    ]
  },
  {
    id: 11,
    category: 'Risk Tolerance',
    text: 'When investing time into a project with high payoff but only a 20% success rate, I feel:',
    options: [
      { text: 'Excited by the challenge of beating the odds', value: 'high_risk_seeker' },
      { text: 'Calculated; I check if I can afford the failure', value: 'rational_risk' },
      { text: 'Dread; I prefer guaranteed smaller wins', value: 'risk_averse' }
    ]
  },
  {
    id: 12,
    category: 'Team Dynamics',
    text: 'My ideal team is one where everyone:',
    options: [
      { text: 'Follows a strict hierarchy with clear roles', value: 'structuralist' },
      { text: 'Operates as individual experts with loose synergy', value: 'specialist_team' },
      { text: 'Brainstorms everything together in a flat structure', value: 'collaborative_flat' }
    ]
  },
  {
    id: 13,
    category: 'Information Processing',
    text: 'When reading a complex 50-page document, I tend to:',
    options: [
      { text: 'Read every word to ensure I miss zero details', value: 'meticulous' },
      { text: 'Scan for headings and bolded data points first', value: 'scanner' },
      { text: 'Jump to the conclusion to see the "bottom line" first', value: 'result_oriented' }
    ]
  },
  {
    id: 14,
    category: 'Persistence',
    text: 'When a technical bug takes more than 4 hours to solve, my mood:',
    options: [
      { text: 'Improves; I become obsessed with the "hunt"', value: 'dogged' },
      { text: 'Stays neutral; it is just part of the job', value: 'resilient' },
      { text: 'Worsens; I feel like my time is being wasted', value: 'efficiency_obsessed' }
    ]
  },
  {
    id: 15,
    category: 'Integrity',
    text: 'If I notice a small error in my performance that no one else saw, I usually:',
    options: [
      { text: 'Fix it silently and move on', value: 'self_correcting' },
      { text: 'Flag it to the team to ensure absolute transparency', value: 'high_integrity' },
      { text: 'Ignore it if it doesn\'t affect the final outcome', value: 'utilitarian' }
    ]
  },
  {
    id: 16,
    category: 'Work Ethic',
    text: 'For me, a "successful" day is one where I:',
    options: [
      { text: 'Cleared every single item on my to-do list', value: 'task_master' },
      { text: 'Had one breakthrough idea that changes the roadmap', value: 'visionary' },
      { text: 'Helped others on my team overcome their blocks', value: 'servant_leader' }
    ]
  },
  {
    id: 17,
    category: 'Organizing',
    text: 'My workspace is usually:',
    options: [
      { text: 'Perfectly organized and minimalist', value: 'disciplined' },
      { text: 'A "creative mess" that I understand perfectly', value: 'creative' },
      { text: 'Constantly changing depending on the project', value: 'adaptive' }
    ]
  },
  {
    id: 18,
    category: 'Logic Feedback',
    text: 'When someone strongly disagrees with my logic, my first response is to:',
    options: [
      { text: 'Argue my point until they see the logic', value: 'debater' },
      { text: 'Listen silently and look for where their logic is correct', value: 'empathetic_analytical' },
      { text: 'Propose a third alternative that combines both views', value: 'synthesizer' }
    ]
  },
  {
    id: 19,
    category: 'Future Focus',
    text: 'I think about the state of my career 5 years from now:',
    options: [
      { text: 'Daily; I have a specific roadmap I am following', value: 'planner' },
      { text: 'Occasionally; I focus more on the current quarter', value: 'pragmatist' },
      { text: 'Rarely; I believe in seizing opportunities as they come', value: 'opportunist' }
    ]
  },
  {
    id: 20,
    category: 'Authority',
    text: 'I respect a leader primarily because of their:',
    options: [
      { text: 'Title and established position of power', value: 'traditionalist' },
      { text: 'Extreme technical competence and skill', value: 'meritocrat' },
      { text: 'Ability to inspire and connect with the team', value: 'charismatic' }
    ]
  },
  {
    id: 21,
    category: 'Ambition',
    text: 'If offered a promotion that requires 50% more responsibility but only 10% more pay, I would:',
    options: [
      { text: 'Accept it for the growth and influence potential', value: 'high_ambition' },
      { text: 'Negotiate for more pay before accepting', value: 'pragmatic' },
      { text: 'Decline to maintain my current work-life balance', value: 'stable' }
    ]
  },
  {
    id: 22,
    category: 'Social Battery',
    text: 'After a full day of meetings and collaboration, I feel:',
    options: [
      { text: 'Energized and ready for more', value: 'extrovert' },
      { text: 'Productive but in need of quiet time to finish tasks', value: 'ambivert' },
      { text: 'Completely drained and need total isolation', value: 'introvert' }
    ]
  },
  {
    id: 23,
    category: 'Technological Interest',
    text: 'When a new AI tool is released in my field, I:',
    options: [
      { text: 'Experiment with it the day it launches', value: 'early_adopter' },
      { text: 'Wait for my company to vet and provide it', value: 'mainstream' },
      { text: 'Skeptically avoid it unless it becomes mandatory', value: 'traditionalist' }
    ]
  },
  {
    id: 24,
    category: 'Attention to Detail',
    text: 'In a final product review, I usually find:',
    options: [
      { text: 'Spacing or naming inconsistencies (1-pixel errors)', value: 'perfectionist' },
      { text: 'Logic flows or user experience friction points', value: 'ux_focused' },
      { text: 'Major missing features or high-level errors', value: 'macro_thinker' }
    ]
  },
  {
    id: 25,
    category: 'Ethical Dilemma',
    text: 'If asked to implement a feature that is bad for users but good for revenue:',
    options: [
      { text: 'Implement it—the business survival is priority', value: 'corporate' },
      { text: 'Try to find a middle ground that harms users less', value: 'balanced' },
      { text: 'Voice strong opposition or refuse to build it', value: 'idealist' }
    ]
  },
  {
    id: 26,
    category: 'Self-Directed Learning',
    text: 'I learn new skills most effectively by:',
    options: [
      { text: 'Enrolling in a structured certification course', value: 'structured' },
      { text: 'Building a project and "Googling" as I go', value: 'experimental' },
      { text: 'Reading documentation and theory cover-to-cover', value: 'theoretical' }
    ]
  },
  {
    id: 27,
    category: 'Emotional Intelligence',
    text: 'When a teammate is visibly stressed or crying, my reaction is to:',
    options: [
      { text: 'Offer immediate emotional support and listen', value: 'empath' },
      { text: 'Give them space and offer to handle their workload', value: 'practical_support' },
      { text: 'Pretend I didn\'t see it to value their privacy', value: 'reserved' }
    ]
  },
  {
    id: 28,
    category: 'Work Velocity',
    text: 'My coding/working style is best described as:',
    options: [
      { text: 'Fast and iterative (Break things, fix fast)', value: 'high_velocity' },
      { text: 'Slow and methodical (Do it once, do it right)', value: 'precision' },
      { text: 'Bursty (Periods of high focus, then rest)', value: 'sprint_based' }
    ]
  },
  {
    id: 29,
    category: 'Feedback loops',
    text: 'How often do I request a check-in on my performance?',
    options: [
      { text: 'Weekly or bi-weekly (I need frequent signal)', value: 'feedback_hungry' },
      { text: 'Quarterly (I trust my own metrics)', value: 'self_reliant' },
      { text: 'Only during formal annual reviews', value: 'autonomous' }
    ]
  },
  {
    id: 30,
    category: 'Information Sharing',
    text: 'When I learn a new productivity hack, I usually:',
    options: [
      { text: 'Keep it to myself to maintain a competitive edge', value: 'competitive' },
      { text: 'Post it in the team Slack channel immediately', value: 'knowledge_sharer' },
      { text: 'Tell only my closest 1-2 colleagues', value: 'selective_sharer' }
    ]
  },
  {
    id: 31,
    category: 'Remote Work Preference',
    text: 'In a fully remote environment, my biggest challenge is:',
    options: [
      { text: 'Loneliness and lack of social connection', value: 'social_seeker' },
      { text: 'Distinguishing work time from personal time', value: 'boundary_struggler' },
      { text: 'None; I am more productive without office noise', value: 'self_managed' }
    ]
  },
  {
    id: 32,
    category: 'Project Ownership',
    text: 'I feel most satisfied when I am:',
    options: [
      { text: 'The sole owner of a critical module', value: 'owner' },
      { text: 'Contributing a key part to a massive team effort', value: 'collaborator' },
      { text: 'Designing the architecture others build on', value: 'architect' }
    ]
  },
  {
    id: 33,
    category: 'Standardization',
    text: 'I believe that coding standards and linters are:',
    options: [
      { text: 'Essential for long-term project health', value: 'disciplined' },
      { text: 'Helpful suggestons but shouldn\'t block flow', value: 'flexible' },
      { text: 'Annoying hurdles that slow down delivery', value: 'delivery_focused' }
    ]
  },
  {
    id: 34,
    category: 'Curiosity',
    text: 'If I see code in a repo I don\'t understand, I:',
    options: [
      { text: 'Spend an hour debugging until I grasp it', value: 'highly_curious' },
      { text: 'Note it and look it up only if I need to change it', value: 'pragmatic' },
      { text: 'Ignore it—if it works, it works', value: 'focused' }
    ]
  },
  {
    id: 35,
    category: 'Communication Style',
    text: 'In meetings, my contribution is usually:',
    options: [
      { text: 'The first to speak and set the tone', value: 'vocal' },
      { text: 'Wait until I have a perfect, finalized thought', value: 'deliberate' },
      { text: 'Synthesize what everyone else said at the end', value: 'summarizer' }
    ]
  },
  {
    id: 36,
    category: 'Handling Ambiguity',
    text: 'When given a task with vague requirements:',
    options: [
      { text: 'I start building based on my best assumptions', value: 'action_oriented' },
      { text: 'I write a 2-page list of questions to clarify', value: 'clarifier' },
      { text: 'I ask for a meeting with the PM immediately', value: 'collaborative' }
    ]
  },
  {
    id: 37,
    category: 'Stress Relief',
    text: 'After an extremely stressful week, I recharge by:',
    options: [
      { text: 'Engaging in a high-energy hobby (sports, gym)', value: 'active_recharge' },
      { text: 'Sleeping and doing absolutely nothing', value: 'passive_recharge' },
      { text: 'Working on a personal project that I actually enjoy', value: 'passionate_recharge' }
    ]
  },
  {
    id: 38,
    category: 'Competitive Drive',
    text: 'When a colleague is promoted faster than me, I feel:',
    options: [
      { text: 'Motivated to work twice as hard to catch up', value: 'competitive' },
      { text: 'Happy for them and focus on my own path', value: 'inner_directed' },
      { text: 'Resentful and check for other job opportunities', value: 'extrinsic' }
    ]
  },
  {
    id: 39,
    category: 'Public Speaking',
    text: 'Being asked to present my work to 500 people makes me:',
    options: [
      { text: 'Anxious for weeks in advance', value: 'reserved' },
      { text: 'Excited for the visibility and influence', value: 'leader' },
      { text: 'Indifferent—it\'s just another task', value: 'detached' }
    ]
  },
  {
    id: 40,
    category: 'Meeting Preference',
    text: 'My opinion on recurring "Daily Standups" is:',
    options: [
      { text: 'They are the heartbeat of the team', value: 'social_synergy' },
      { text: 'They are useful but should be under 10 mins', value: 'efficiency' },
      { text: 'They are a waste of time; use Slack instead', value: 'async_focused' }
    ]
  },
  {
    id: 41,
    category: 'Quality vs Quantity',
    text: 'If I have to choose between a "hacky" fix that takes 5 mins and a "perfect" fix that takes 5 hours:',
    options: [
      { text: 'Always the hack if it solves the immediate fire', value: 'speed' },
      { text: 'Always the perfect fix—we avoid technical debt', value: 'quality' },
      { text: 'It depends entirely on the upcoming deadline', value: 'situational' }
    ]
  },
  {
    id: 42,
    category: 'Creative Outlets',
    text: 'Outside of work, I prefer activities that are:',
    options: [
      { text: 'Creative (painting, music, writing)', value: 'right_brain' },
      { text: 'Logical (gaming, puzzles, coding)', value: 'left_brain' },
      { text: 'Physical (hiking, yoga, lifting)', value: 'kinesthetic' }
    ]
  },
  {
    id: 43,
    category: 'Learning Orientation',
    text: 'I value a workplace most if it offers:',
    options: [
      { text: 'High compensation and bonuses', value: 'reward_driven' },
      { text: 'Mentorship from world-class experts', value: 'growth_driven' },
      { text: 'Absolute freedom to work how I want', value: 'autonomy_driven' }
    ]
  },
  {
    id: 44,
    category: 'Problem Solving',
    text: 'When I hit a "wall" on a problem, my first step is:',
    options: [
      { text: 'Step away from the screen for a walk', value: 'diffuse_thinker' },
      { text: 'Double down and stare at it until it breaks', value: 'focused_thinker' },
      { text: 'Ask a colleague for a "rubber ducky" session', value: 'social_thinker' }
    ]
  },
  {
    id: 45,
    category: 'Documentation',
    text: 'I think writing documentation is:',
    options: [
      { text: 'A gift to my future self and teammates', value: 'proactive' },
      { text: 'A necessary evil for maintenance', value: 'dutiful' },
      { text: 'Something I only do if someone asks', value: 'reactive' }
    ]
  },
  {
    id: 46,
    category: 'Team Celebration',
    text: 'When the team completes a massive project, I prefer:',
    options: [
      { text: 'A loud team party with drinks and music', value: 'celebratory' },
      { text: 'A quiet, high-end team dinner with discussion', value: 'reflective' },
      { text: 'Getting a "well done" email and a day off', value: 'utilitarian' }
    ]
  },
  {
    id: 47,
    category: 'Career Pivot',
    text: 'I would consider switching industries if:',
    options: [
      { text: 'The new industry has a higher social impact', value: 'missionary' },
      { text: 'The pay is significantly higher', value: 'mercenary' },
      { text: 'I find the current tech stack boring', value: 'nerd' }
    ]
  },
  {
    id: 48,
    category: 'Organizational Loyalty',
    text: 'I expect to stay at my next company for:',
    options: [
      { text: '1-2 years (I value diverse experiences)', value: 'explorer' },
      { text: '3-10 years (I want to see things through)', value: 'builder' },
      { text: 'Until I retire (I value stability)', value: 'loyalist' }
    ]
  },
  {
    id: 49,
    category: 'Risk Awareness',
    text: 'When a project is succeeding, my secret thought is:',
    options: [
      { text: 'Where is the hidden trap? (Cynical)', value: 'paranoid' },
      { text: 'How do we scale this 10x? (Ambitious)', value: 'visionary' },
      { text: 'I need to enjoy this moment. (Mindful)', value: 'balanced' }
    ]
  },
  {
    id: 50,
    category: 'Conclusion',
    text: 'I believe my greatest professional asset is my:',
    options: [
      { text: 'Technical depth and expertise', value: 'the_expert' },
      { text: 'Ability to lead and inspire others', value: 'the_leader' },
      { text: 'Speed of learning and adaptation', value: 'the_generalist' }
    ]
  }
];
