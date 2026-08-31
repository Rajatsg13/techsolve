const content = {
  slug: 'break-even-calculator',
  outcome: 'Find how many units you have to sell before a product, service or venture stops losing money.',
  whatItDoes: [
    'Break-even is the point where total revenue equals total cost. It depends on three things: the fixed costs you carry regardless of sales, the price each sale brings in, and the variable cost each sale incurs. The gap between price and variable cost is the contribution — the amount each sale puts towards the fixed costs.',
    'It also tells you when there is no break-even point at all. If the contribution is zero or negative, no volume ever covers the fixed costs, and selling more makes the position worse rather than better.',
  ],
  whenToUse: [
    { title: 'Before launching something', body: 'Knowing the volume required makes it obvious whether the plan is plausible.' },
    { title: 'Testing a price', body: 'Seeing how far the required volume moves when the price changes.' },
    { title: 'Considering a fixed cost', body: 'A new hire or a bigger space raises the fixed base — this shows by how much in units.' },
    { title: 'Setting a sales target', body: 'The target-profit input turns a profit goal into a unit number.' },
  ],
  workplaceUses: [
    { title: 'Building a business case', body: 'Turning an idea into the volume it needs to work.' },
    { title: 'Evaluating a subscription price', body: 'How many subscribers cover the cost of running the service.' },
    { title: 'Deciding on equipment', body: 'How much extra output is needed to justify a purchase.' },
    { title: 'Planning an event', body: 'Venue and staffing are fixed; tickets are the contribution. The tool gives the attendance you need.' },
  ],
  howToSteps: [
    { title: 'Enter fixed costs', body: 'Everything that does not change with volume over the period — rent, salaries, software, insurance. Use one consistent period.' },
    { title: 'Enter the selling price per unit', body: 'What one sale brings in, before tax.' },
    { title: 'Enter the variable cost per unit', body: 'What one sale costs you — materials, packaging, payment fees, delivery.' },
    { title: 'Optionally add a target profit', body: 'Leave blank for break-even alone, or enter a figure to see the volume needed to earn it.' },
  ],
  tips: [
    { title: 'Keep the period consistent', body: 'Monthly fixed costs give a monthly break-even. Mixing annual fixed costs with monthly volumes is the usual source of a wrong answer.' },
    { title: 'Contribution is the number that matters', body: 'Price minus variable cost. If it is small, break-even volume climbs steeply and small cost increases become dangerous.' },
    { title: 'A negative contribution cannot be fixed by volume', body: 'If each sale loses money, more sales lose more money. The price or the cost has to change first — the tool says so rather than printing a number.' },
    { title: 'Raising price moves break-even faster than cutting cost', body: 'Price increases flow straight into contribution. It is usually the shorter route, if the market allows it.' },
    { title: 'Treat the answer as a floor, not a plan', body: 'Break-even is where you stop losing money, not where the business is viable. Use the target-profit field for the number that actually matters.' },
  ],
  faqs: [
    { q: 'How is break-even calculated?', a: 'Fixed costs ÷ (Price per unit − Variable cost per unit). The denominator is the contribution per unit. Break-even revenue is that unit figure multiplied by the price.' },
    { q: 'What counts as a fixed cost?', a: 'Anything that does not change with how much you sell: rent, permanent salaries, software subscriptions, insurance. Costs that rise with each sale are variable.' },
    { q: 'Why does it say my product never breaks even?', a: 'Because the price is at or below the variable cost, so each sale contributes nothing towards fixed costs. No volume solves that — the price or the variable cost has to change.' },
    { q: 'Should I include GST in the price?', a: 'No. Use the net figure you keep. GST is collected on behalf of the government and is not revenue, so including it overstates your contribution.' },
    { q: 'What is contribution margin?', a: 'Contribution per unit expressed as a percentage of the price. It tells you what proportion of each sale is available to cover fixed costs and profit.' },
    { q: 'How do I find the volume for a profit target?', a: 'Enter the profit you want in the optional field. It calculates (Fixed costs + Target profit) ÷ Contribution per unit.' },
  ],
  relatedWorkflows: [
    {
      title: 'Assessing a new product',
      description: 'From cost and price to whether the required volume is realistic.',
      steps: [
        { slug: 'profit-margin-calculator', note: 'Set a price that carries the margin you need' },
        { slug: 'break-even-calculator', note: 'Find the volume that price requires' },
        { slug: 'roi-calculator', note: 'Check the return on the money going in' },
      ],
    },
  ],
  relatedTools: ['profit-margin-calculator', 'roi-calculator', 'gst-calculator'],
};

export default content;
