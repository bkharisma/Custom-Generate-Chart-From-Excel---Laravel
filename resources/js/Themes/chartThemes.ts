export interface ChartTheme {
    name: string;
    colors: string[];
}

export const chartThemes: ChartTheme[] = [
    {
        name: 'Default',
        colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'],
    },
    {
        name: 'Ocean',
        colors: ['#1B9AAA', '#06D6A0', '#F4D06F', '#FF8C61', '#9B5DE5'],
    },
    {
        name: 'Forest',
        colors: ['#2D6A4F', '#52B788', '#95D5B2', '#FFE66D', '#FF9F1C'],
    },
    {
        name: 'Sunset',
        colors: ['#FF6B6B', '#FF8E72', '#FFC145', '#C9B1FF', '#8ECAE6'],
    },
    {
        name: 'Midnight',
        colors: ['#2B2D42', '#8D99AE', '#EDF2F4', '#EF233C', '#D90429'],
    },
    {
        name: 'Pastel',
        colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
    },
    {
        name: 'Berry',
        colors: ['#7209B7', '#B5179E', '#F72585', '#4CC9F0', '#4361EE'],
    },
    {
        name: 'Earth',
        colors: ['#BC6C25', '#DDA15E', '#FEFAE0', '#606C38', '#283618'],
    },
    {
        name: 'Neon',
        colors: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF'],
    },
    {
        name: 'Mono',
        colors: ['#212529', '#495057', '#6C757D', '#ADB5BD', '#E9ECEF'],
    },
];

export const defaultTheme = chartThemes[0];

export function getThemeByName(name: string): ChartTheme | undefined {
    return chartThemes.find((t) => t.name === name);
}
