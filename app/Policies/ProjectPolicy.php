<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Project $project): bool
    {
        return $user->role === Role::Admin || $user->id === $project->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Project $project): bool
    {
        return $user->role === Role::Admin || $user->id === $project->user_id;
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->role === Role::Admin || $user->id === $project->user_id;
    }
}
