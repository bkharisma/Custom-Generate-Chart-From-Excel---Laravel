<?php

namespace App\Enums;

enum ChartType: string
{
    case Bar = 'bar';
    case BarY = 'bar_y';
    case Line = 'line';
    case Pie = 'pie';
    case Scatter = 'scatter';
    case Area = 'area';
    case Radar = 'radar';
}
