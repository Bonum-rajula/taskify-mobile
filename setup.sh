#!/usr/bin/bash
# Clean up the default Expo template files we don't need
rm -rf app/tabs app/\+not-found.tsx components constants hooks

# Create the primary src directories
mkdir -p src/api src/components/ui src/components/tasks src/hooks/queries src/store src/utils src/types src/constants

# Create API client and route files
touch src/api/client.ts src/api/auth.ts src/api/tasks.ts src/api/user.ts

# Create UI primitives and feature components
touch src/components/ui/Button.tsx src/components/ui/Typography.tsx src/components/ui/Input.tsx
touch src/components/tasks/TaskCard.tsx src/components/tasks/SwipeableRow.tsx

# Create Custom Hooks and Store
touch src/hooks/queries/useTasks.ts src/hooks/queries/useProfile.ts src/hooks/useAuth.ts
touch src/store/authStore.ts

# Create Utilities and Types
touch src/utils/secureStore.ts src/utils/date.ts src/utils/validation.ts src/utils/notifications.ts src/utils/markdown.ts
touch src/types/api.ts src/types/models.ts
touch src/constants/theme.ts src/constants/config.ts

# Rebuild the Expo Router structure
mkdir -p app/\(auth\) app/\(app\)/tasks app/\(app\)/profile
touch app/_layout.tsx app/\(auth\)/login.tsx app/\(auth\)/register.tsx
touch app/\(app\)/_layout.tsx app/\(app\)/tasks/index.tsx app/\(app\)/tasks/[id].tsx app/\(app\)/profile/index.tsx
