const content = {
  slug: 'profit-margin-calculator',
  outcome: 'Find the margin and the markup on a sale, or the price you need to charge to hit a margin you have decided on.',
  whatItDoes: [
    'Margin and markup are both profit expressed as a percentage, but against different bases. Margin measures profit against the selling price; markup measures it against the cost. A 50% markup is a 33.3% margin, and treating them as interchangeable is one of the more expensive arithmetic mistakes a small business can make.',
    'Both are shown together for exactly that reason. The second mode works the other way round: give it a cost and the margin you need, and it returns the price that produces it.',
  ],
  whenToUse: [
    { title: 'Setting a price', body: 'You know what something costs and what margin the business needs to run on.' },
    { title: 'Reviewing a quote before sending it', body: 'Confirming the number you are about to send leaves enough on the table.' },
    { title: 'Deciding whether a discount is affordable', body: 'Seeing what a reduction does to the margin before agreeing to it.' },
    { title: 'Comparing products', body: 'Two items can carry very similar prices and very different margins.' },
  ],
  workplaceUses: [
    { title: 'Pricing a new product', body: 'Work from cost and a target margin to the price on the list.' },
    { title: 'Approving a discount request', body: 'Check the margin at the discounted price before saying yes.' },
    { title: 'Reviewing supplier costs', body: 'See what a cost increase does to margin if the price stays fixed.' },
    { title: 'Preparing a proposal', body: 'Confirm a project priced as a fixed fee still clears the margin it needs to.' },
  ],
  howToSteps: [
    { title: 'Choose what you know', body: 'Cost and price gives you the margin. Cost and target margin gives you the price.' },
    { title: 'Enter the cost per unit', body: 'What it costs you to make, buy or deliver one unit — include everything variable that you can attribute.' },
    { title: 'Enter the price or the target', body: 'Either the price you charge, or the margin percentage you want to achieve.' },
    { title: 'Read margin and markup together', body: 'Both are shown so the difference is visible rather than assumed.' },
  ],
  tips: [
    { title: 'Margin and markup are not the same number', body: 'Margin divides profit by price; markup divides it by cost. Buy at 60 and sell at 100 and you have a 40% margin and a 66.7% markup. Applying a markup when you meant a margin underprices the sale.' },
    { title: 'A 100% margin is impossible', body: 'It would require an infinite price. Markup, by contrast, has no upper limit. If a target margin is rejected here, that is why.' },
    { title: 'Decide which costs belong in "cost"', body: 'Gross margin usually counts only direct costs. Including overheads gives a different and lower figure — useful, but do not compare it against a gross margin benchmark.' },
    { title: 'Discounts hit margin harder than they look', body: 'On a 40% margin, a 10% discount removes a quarter of the profit, because the discount comes entirely out of the margin.' },
    { title: 'Percentages hide the amount', body: 'A high margin on a cheap item can be less money than a thin margin on an expensive one. The profit figure is shown alongside for that reason.' },
  ],
  faqs: [
    { q: 'What is the difference between margin and markup?', a: 'Margin is profit as a percentage of the selling price. Markup is profit as a percentage of the cost. Cost 60, price 100: margin 40%, markup 66.7%. Both are shown here so they cannot be confused.' },
    { q: 'How do I price for a specific margin?', a: 'Switch to the cost and target margin mode. Price = Cost ÷ (1 − Margin ÷ 100). For a 40% margin on a ₹60 cost, that is ₹100.' },
    { q: 'Why is a 100% margin rejected?', a: 'The formula divides by (1 − margin ÷ 100). At 100% that is a division by zero, meaning no finite price achieves it. Margins must stay below 100%.' },
    { q: 'What if I am selling at a loss?', a: 'It reports a negative profit and a negative margin rather than hiding it. That is usually the number you need to see.' },
    { q: 'Should cost include overheads?', a: 'That depends what you are measuring. Gross margin conventionally uses direct costs only. Including overheads gives a net figure, which is valid but not comparable to a gross margin benchmark.' },
  ],
  relatedWorkflows: [
    {
      title: 'Pricing something new',
      description: 'From cost to a price you can defend, and an invoice to send.',
      steps: [
        { slug: 'profit-margin-calculator', note: 'Set the price that delivers your target margin' },
        { slug: 'break-even-calculator', note: 'Check how many units that price needs to sell' },
        { slug: 'gst-calculator', note: 'Add GST for the customer-facing figure' },
      ],
    },
  ],
  relatedTools: ['break-even-calculator', 'gst-calculator', 'roi-calculator', 'percentage-calculator'],
};

export default content;
