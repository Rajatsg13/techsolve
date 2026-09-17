const content = {
  slug: 'percentage-increase-calculator',
  outcome: 'Compare two numbers and get the percentage change between them, plus the absolute difference.',
  whatItDoes: [
    'Give it what something was and what it became, and it reports the change as a percentage and as a plain difference. Growth, decline, cost movement and headcount change are all the same calculation.',
    'It also refuses to invent a number when the starting value is zero. Percentage change from nothing is mathematically undefined, and tools that print "infinite" or an enormous figure there are producing something you cannot put in a report.',
  ],
  whenToUse: [
    { title: 'Reporting period-on-period movement', body: 'Sales, traffic, tickets or headcount this month against last.' },
    { title: 'Explaining a cost increase', body: 'A supplier raised a price and you need the percentage for an approval note.' },
    { title: 'Comparing before and after', body: 'Measuring the effect of a change against the baseline that preceded it.' },
    { title: 'Checking a claimed figure', body: 'Verifying that a stated percentage matches the underlying numbers.' },
  ],
  workplaceUses: [
    { title: 'Monthly reporting', body: 'The change line in a dashboard or summary email.' },
    { title: 'Budget variance', body: 'How far actual spend moved from what was planned.' },
    { title: 'Vendor price reviews', body: 'Quantifying a renewal increase before negotiating it.' },
    { title: 'Performance summaries', body: 'Framing a result against the previous period rather than in isolation.' },
  ],
  howToSteps: [
    { title: 'Enter the original value', body: 'Where the number started — the earlier period, the old price, the baseline.' },
    { title: 'Enter the new value', body: 'Where it ended up.' },
    { title: 'Read the result', body: 'The headline shows the percentage change and whether it is an increase or a decrease. The rows below show the absolute difference alongside it.' },
  ],
  tips: [
    { title: 'Always state the base', body: '"Up 40%" means nothing without saying from what. The absolute change shown here is often the more useful half of the sentence.' },
    { title: 'Percentage change from zero is undefined', body: 'If you started at zero, report the absolute increase instead. This tool tells you that rather than printing a meaningless number.' },
    { title: 'A big percentage on a small base is not a big result', body: 'Two tickets becoming six is a 200% increase and still four tickets. Show both figures.' },
    { title: 'Decreases cannot exceed 100%', body: 'A fall of more than 100% would mean ending below zero. If you see one, the values are probably the wrong way round.' },
    { title: 'Reversing the change needs different arithmetic', body: 'A 20% fall is not undone by a 20% rise. Recovering from 80 back to 100 takes a 25% increase.' },
  ],
  faqs: [
    { q: 'How is percentage change calculated?', a: '(New − Original) ÷ |Original| × 100. Using the absolute value of the original keeps the sign meaningful when starting from a negative figure.' },
    { q: 'Why can it not calculate a change from zero?', a: 'Because dividing by zero is undefined. There is no percentage that describes going from nothing to something — any increase from zero is infinite. The absolute change is the correct thing to report.' },
    { q: 'What is the difference between percent and percentage points?', a: 'A conversion rate moving from 5% to 7% has risen two percentage points, and also risen 40%. Both are correct and they answer different questions, so name which one you mean.' },
    { q: 'Can I use it for decreases?', a: 'Yes. Enter a new value lower than the original and it reports a decrease with a negative percentage.' },
    { q: 'Does it work with negative numbers?', a: 'Yes. Because the divisor uses the magnitude of the original, moving from −50 to −25 correctly reports a 50% improvement rather than an inverted sign.' },
  ],
  relatedTools: ['percentage-calculator', 'salary-hike-calculator', 'roi-calculator'],
};

export default content;
