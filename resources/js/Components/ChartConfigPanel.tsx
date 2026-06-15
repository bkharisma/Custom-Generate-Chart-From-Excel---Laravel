import { useState } from 'react';
import { chartThemes, defaultTheme } from '@/Themes/chartThemes';

export interface ChartOptions {
    title?: { text?: string; subtext?: string };
    theme?: string;
    color?: string[];
    legend?: { show?: boolean; top?: string; bottom?: string };
    tooltip?: Record<string, unknown>;
    showAllLabels?: boolean;
}

interface ChartConfigPanelProps {
    options: ChartOptions;
    onChange: (options: ChartOptions) => void;
}

export default function ChartConfigPanel({
    options,
    onChange,
}: ChartConfigPanelProps) {
    const selectedTheme = options.theme || defaultTheme.name;
    const currentColors = options.color || defaultTheme.colors;
    const [showCustom, setShowCustom] = useState(false);

    const selectTheme = (name: string) => {
        const theme = chartThemes.find((t) => t.name === name);
        if (theme) {
            onChange({ ...options, theme: name, color: [...theme.colors] });
        }
    };

    const updateColor = (index: number, value: string) => {
        const newColors = [...currentColors];
        newColors[index] = value;
        onChange({ ...options, color: newColors });
    };

    const addColor = () => {
        const newColors = [...currentColors, '#000000'];
        onChange({ ...options, color: newColors });
    };

    const removeColor = (index: number) => {
        const newColors = currentColors.filter((_, i) => i !== index);
        onChange({ ...options, color: newColors });
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chart Title
                </label>
                <input
                    type="text"
                    value={options.title?.text ?? ''}
                    onChange={(e) =>
                        onChange({
                            ...options,
                            title: { ...options.title, text: e.target.value },
                        })
                    }
                    placeholder="Enter chart title"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subtitle
                </label>
                <input
                    type="text"
                    value={options.title?.subtext ?? ''}
                    onChange={(e) =>
                        onChange({
                            ...options,
                            title: { ...options.title, subtext: e.target.value },
                        })
                    }
                    placeholder="Enter subtitle"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Legend
                </label>
                <select
                    value={String(options.legend?.show !== false)}
                    onChange={(e) =>
                        onChange({
                            ...options,
                            legend: {
                                ...options.legend,
                                show: e.target.value === 'true',
                            },
                        })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:text-sm"
                >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show All Labels
                </label>
                <select
                    value={String(options.showAllLabels === true)}
                    onChange={(e) =>
                        onChange({
                            ...options,
                            showAllLabels: e.target.value === 'true',
                        })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:text-sm"
                >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Color Theme
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {chartThemes.map((theme) => (
                        <button
                            key={theme.name}
                            type="button"
                            onClick={() => selectTheme(theme.name)}
                            className={`rounded-lg border-2 p-2 text-left transition-all ${
                                selectedTheme === theme.name
                                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200 dark:border-indigo-400 dark:bg-indigo-900/40 dark:ring-indigo-600'
                                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                            }`}
                        >
                            <div className="mb-1.5 flex gap-0.5">
                                {theme.colors.map((c, i) => (
                                    <span
                                        key={i}
                                        className="h-4 flex-1 rounded-sm"
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {theme.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => setShowCustom(!showCustom)}
                    className="flex w-full items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                >
                    <span>Customize Colors</span>
                    <svg
                        className={`h-4 w-4 transition-transform ${showCustom ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>

                {showCustom && (
                    <div className="mt-3 space-y-2">
                        {currentColors.map((color, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) =>
                                        updateColor(i, e.target.value)
                                    }
                                    className="h-8 w-8 cursor-pointer rounded border border-gray-300"
                                />
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) =>
                                        updateColor(i, e.target.value)
                                    }
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:text-sm"
                                />
                                {currentColors.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeColor(i)}
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addColor}
                            className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            + Add color
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
