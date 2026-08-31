const content = {
  slug: 'roi-calculator',
  outcome: 'Measure what a business spend returned, and see it annualised so it can be compared with anything else.',
  whatItDoes: [
    'ROI expresses what you got back as a percentage of what you put in. It is the standard way to compare a campaign against a hire against a piece of equipment, because it strips away the absolute sizes and leaves the efficiency.',
    'A raw ROI figure hides time, though. Adding the holding period produces the annualised rate — the compound return per year — which is the only fair way to compare a return earned over three months with one earned over three years.',
  ],
  whenToUse: [
    { title: 'Reviewing a campaign', body: 'Spend against attributable revenue, in a form a manager can compare.' },
    { title: 'Justifying a purchase', body: 'Showing the return on equipment or software against its cost.' },
    { title: 'Comparing two options', body: 'Ranking initiatives of different sizes on efficiency rather than absolute return.' },
    { title: 'Reporting on a completed project', body: 'Closing the loop on what was spent and what came back.' },
  ],
  workplaceUses: [
    { title: 'Marketing spend review', body: 'Return on a campaign, channel or event.' },
    { title: 'Software business case', body: 'Licence cost against the time or headcount it saves.' },
    { title: 'Training investment', body: 'Course cost against measurable output change.' },
    { title: 'Equipment purchase', body: 'Capital cost against additional capacity or reduced waste.' },
  ],
  howToSteps: [
    { title: 'Enter the amount invested', body: 'The full cost. Include setup, licences and staff time if you can put a figure on it — leaving them out flatters the result.' },
    { title: 'Enter the value returned', body: 'Revenue, savings or value you can attribute to the spend. Be honest about attribution.' },
    { title: 'Optionally enter the period', body: 'In years. Adding it produces the annualised rate, which is what makes different durations comparable.' },
    { title: 'Read both figures', body: 'Total ROI answers "was it worth it". Annualised answers "how does it compare".' },
  ],
  tips: [
    { title: 'A total ROI without a period is close to meaningless for comparison', body: '40% over one year and 40% over five are very different investments. Always annualise before ranking anything.' },
    { title: 'Attribution is the weak link', body: 'The arithmetic is trivial; deciding which revenue belongs to which spend is not. State your assumption alongside the number.' },
    { title: 'Include the hidden costs', body: 'Staff time, onboarding and disruption are real costs. Leaving them out is the most common way ROI gets overstated.' },
    { title: 'ROI ignores risk entirely', body: 'A 30% return that was nearly certain and a 30% return that was a gamble score identically here. Judgement has to supply that context.' },
    { title: 'Returned value, not profit', body: 'Enter the total value that came back, not the gain. The tool works out the gain itself — entering the profit instead understates the investment base.' },
  ],
  faqs: [
    { q: 'How is ROI calculated?', a: '(Value returned − Amount invested) ÷ Amount invested × 100. A ₹250,000 spend returning ₹340,000 gives a 36% ROI.' },
    { q: 'What does annualised return mean?', a: 'The compound rate per year that would produce the same total over the period. It is calculated as (Returned ÷ Invested) raised to the power of (1 ÷ years), minus one. It lets you compare returns earned over different lengths of time.' },
    { q: 'Why is the annualised figure lower than the total ROI?', a: 'Because the total is spread across more than one year. A 36% return over two years is roughly 16.6% a year compounded — the same money, described per year rather than in total.' },
    { q: 'Can ROI be negative?', a: 'Yes. If the value returned is less than the amount invested, the result is negative and shown as a loss rather than hidden.' },
    { q: 'Is this investment advice?', a: 'No. It performs a calculation on figures you supply, for business decisions. It does not know your risk, tax position or alternatives, and it is not a recommendation about any investment.' },
    { q: 'Should I include my own time as cost?', a: 'If the decision depends on it, yes. Time has a cost even when no invoice is raised, and excluding it is the most common way a business case is made to look better than it is.' },
  ],
  relatedTools: ['break-even-calculator', 'profit-margin-calculator', 'percentage-increase-calculator'],
};

export default content;
