const content = {
  slug: 'working-days-calculator',
  outcome: 'Count the working days between two dates, with weekends and any holidays you list taken out.',
  whatItDoes: [
    'Calendar days and working days are rarely the same number, and the difference is what deadlines actually run on. This counts every date in a range, keeps the ones that fall on your working days, and removes any holidays you supply.',
    'The working week is configurable rather than assumed. A six-day week, a Sunday–Thursday week, or a four-day week are all selectable, because Monday–Friday is a convention rather than a rule.',
  ],
  whenToUse: [
    { title: 'Setting a realistic deadline', body: 'A twenty-working-day task is a calendar month, not four weeks.' },
    { title: 'Calculating leave', body: 'How many working days a period of absence actually consumes.' },
    { title: 'Checking a notice period', body: 'Converting a contractual period into dates.' },
    { title: 'Planning capacity', body: 'How many working days a team really has in a month with holidays removed.' },
  ],
  workplaceUses: [
    { title: 'Project scheduling', body: 'Turning an estimate in working days into a delivery date.' },
    { title: 'Leave approval', body: 'Confirming how many working days a request covers.' },
    { title: 'SLA tracking', body: 'Measuring elapsed business days rather than calendar days.' },
    { title: 'Payroll and contractor periods', body: 'Counting billable days in a period.' },
    { title: 'Invoice payment terms', body: 'When terms are stated in business days rather than calendar days.' },
  ],
  howToSteps: [
    { title: 'Pick a start and end date', body: 'Use the date pickers so the format is always right.' },
    { title: 'Set your working week', body: 'Monday to Friday is preselected. Tap any day to include or exclude it — add Saturday for a six-day week, or shift the pattern entirely.' },
    { title: 'Decide about the end date', body: 'Counting the end date is right for leave requests and project spans. Turn it off when you are measuring a gap between two events.' },
    { title: 'Add holidays if relevant', body: 'One date per line as YYYY-MM-DD. A holiday that falls on a non-working day is ignored rather than double-counted.' },
  ],
  tips: [
    { title: 'Decide whether the end date counts before you start', body: 'Leave from Monday to Friday is five days, not four. A gap between two events is usually exclusive. Getting this wrong is an off-by-one that reaches payroll.' },
    { title: 'Holidays vary by state and by company', body: 'There is no national list this tool could apply safely, especially in India where holidays differ by state. Paste your own organisation’s list.' },
    { title: 'A holiday on a Sunday changes nothing', body: 'It was already excluded. The count of holidays actually applied is shown separately so the arithmetic is visible.' },
    { title: 'Business days and working days can differ', body: 'Contracts sometimes define business days to exclude bank holidays specifically. Check the contract wording before relying on a count.' },
    { title: 'Daylight saving cannot skew this', body: 'Dates are handled in UTC, so a clock change inside the range does not add or drop a day. Naive implementations get this wrong twice a year.' },
  ],
  faqs: [
    { q: 'Does it include the start and end dates?', a: 'The start date is always included. The end date is included by default, which suits leave and project spans, and can be switched off when you are measuring a gap.' },
    { q: 'Can I set a working week other than Monday to Friday?', a: 'Yes. Every day is individually selectable, so a six-day week, a Sunday-start week or a four-day week all work.' },
    { q: 'Are public holidays included automatically?', a: 'No, deliberately. Holidays differ by country, by state and by employer — in India especially. Guessing would produce confidently wrong answers, so you supply the list.' },
    { q: 'What format do holidays need?', a: 'YYYY-MM-DD, one per line or comma-separated. Anything not in that format is ignored, and you are told how many entries were skipped.' },
    { q: 'What if the end date is before the start date?', a: 'It tells you rather than returning zero or a negative number, so a transposed pair of dates cannot pass unnoticed.' },
    { q: 'Does it handle leap years and month lengths?', a: 'Yes. It walks the actual calendar rather than approximating with a fixed month length, so February and leap years are correct.' },
  ],
  relatedTools: ['percentage-calculator', 'roi-calculator'],
};

export default content;
