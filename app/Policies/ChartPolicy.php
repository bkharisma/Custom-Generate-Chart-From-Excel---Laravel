<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Chart;
use App\Models\User;

class ChartPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Chart $chart): bool
    {
        return $user->role === Role::Admin || $user->id === $chart->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Chart $chart): bool
    {
        return $user->role === Role::Admin || $user->id === $chart->user_id;
    }

    public function delete(User $user, Chart $chart): bool
    {
        return $user->role === Role::Admin || $user->id === $chart->user_id;
    }
}
