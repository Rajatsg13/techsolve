const content = {
  slug: 'percentage-calculator',
  outcome: 'Three everyday percentage questions answered, with the arithmetic shown so you can justify the number.',
  whatItDoes: [
    'Most percentage work at a desk is one of three questions: what is 15% of this, what share is this of that, or what does this become after adding or removing a percentage. Each is easy to get slightly wrong under time pressure, and the mistakes look plausible.',
    'Every result shows the formula it used, which matters when the number is going into a document someone else will check.',
  ],
  whenToUse: [
    { title: 'Applying a discount or commission', body: 'Work out the amount rather than the resulting price, when the amount is what you need to record.' },
    { title: 'Reporting a share', body: 'Turning "34 of 220 responses" into a percentage for a summary.' },
    { title: 'Adding a surcharge or removing a deduction', body: 'Getting to the figure after a percentage is applied in either direction.' },
    { title: 'Sanity-checking a spreadsheet', body: 'A quick independent check of a number a formula produced.' },
  ],
  workplaceUses: [
    { title: 'Working out a commission', body: 'The payable amount on a sale at an agreed rate.' },
    { title: 'Summarising survey results', body: 'Converting raw counts into the percentages a slide needs.' },
    { title: 'Applying a discount', body: 'Both the discount amount and the resulting price.' },
    { title: 'Checking a deduction', body: 'Confirming a percentage taken off an amount matches what was expected.' },
  ],
  howToSteps: [
    { title: 'Pick the question you are asking', body: 'The three tabs are: a percentage of a number, X is what percent of Y, and add or remove a percentage.' },
    { title: 'Enter the two numbers', body: 'The labels change to match the mode so it is clear which value goes where.' },
    { title: 'For the third mode, choose a direction', body: 'Add applies the percentage on top; Remove takes it off.' },
    { title: 'Read the result and the formula', body: 'The breakdown below shows each input and the arithmetic used.' },
  ],
  tips: [
    { title: 'Adding then removing the same percentage does not return you to the start', body: 'Add 10% to 100 and you get 110. Remove 10% from 110 and you get 99. The percentage applies to a different base each time — this is the single most common percentage error in business.' },
    { title: 'A percentage of a percentage is not a sum', body: 'A 10% discount followed by a further 10% is 19% off, not 20%, because the second applies to the already-reduced price.' },
    { title: 'Keep the base explicit when you report', body: '"15% higher" is ambiguous without saying higher than what. Write the base into the sentence.' },
    { title: 'Percentage points are not percent', body: 'A rate moving from 5% to 7% is a rise of two percentage points, and also a 40% increase. Both are true and they mean different things.' },
  ],
  faqs: [
    { q: 'How do I calculate a percentage of a number?', a: 'Divide the percentage by 100 and multiply by the number. 15% of 200 is 0.15 × 200 = 30. The first tab does this.' },
    { q: 'How do I find what percentage one number is of another?', a: 'Divide the part by the whole and multiply by 100. 30 out of 200 is 15%. The second tab does this, and guards against a total of zero, which has no meaningful percentage.' },
    { q: 'Why is removing a percentage not the reverse of adding it?', a: 'Because each is applied to a different base. Adding 10% to 100 gives 110; removing 10% from 110 removes 11, not 10, leaving 99. To reverse an increase you divide rather than subtract.' },
    { q: 'Can it handle negative numbers?', a: 'Yes. The arithmetic is applied as given, so a negative starting value produces a mathematically correct result — just check it means what you intend in context.' },
    { q: 'Is my input stored?', a: 'No. Everything is calculated in your browser as you type. Nothing is transmitted or saved.' },
  ],
  relatedTools: ['percentage-increase-calculator', 'gst-calculator', 'profit-margin-calculator', 'salary-hike-calculator'],
};

export default content;
