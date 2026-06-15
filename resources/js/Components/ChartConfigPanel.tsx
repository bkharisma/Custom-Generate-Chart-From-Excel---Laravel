import { useState } from 'react';

export interface ChartOptions {
    title?: { text?: string; subtext?: string };
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
    const [colors, setColors] = useState<string[]>(
        options.color || ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'],
    );

    const updateOption = (key: string, value: unknown) => {
        onChange({ ...options, [key]: value });
    };

    const updateTitle = () => {
        onChange({
            ...options,
            title: { ...(options.title || {}), text: options.title?.text ?? '' },
        });
    };

    const addColor = () => {
        const newColors = [...colors, '#000000'];
        setColors(newColors);
        onChange({ ...options, color: newColors });
    };

    const updateColor = (index: number, value: string) => {
        const newColors = [...colors];
        newColors[index] = value;
        setColors(newColors);
        onChange({ ...options, color: newColors });
    };

    const removeColor = (index: number) => {
        const newColors = colors.filter((_, i) => i !== index);
        setColors(newColors);
        onChange({ ...options, color: newColors });
    };

    return (
        <div className="space-y-4">
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
                    Colors
                </label>
                <div className="mt-2 space-y-2">
                    {colors.map((color, i) => (
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
                            {colors.length > 1 && (
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
            </div>
        </div>
    );
}
