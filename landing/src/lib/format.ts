const compact = new Intl.NumberFormat('en', {notation: 'compact', maximumFractionDigits: 1});

export const formatCount = (value: number) => compact.format(value);
