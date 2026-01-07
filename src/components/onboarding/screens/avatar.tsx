'use client';

/**
 * Avatar Selection Screen
 * 
 * Allows users to pick their profile avatar during onboarding.
 * Uses the shared AvatarPicker component.
 */

import { motion } from 'framer-motion';
import {
    QuestionScreen,
    QuestionHeader,
    ContinueButton,
    useKeyboardNavigation,
} from '../ui';
import { AvatarPicker } from '@/components/ui/AvatarPicker';
import { AvatarId, AVATAR_OPTIONS, DEFAULT_AVATAR_ID, parseAvatarId } from '@/domain/user/avatars';

interface AvatarSelectionScreenProps {
    value: AvatarId | null;
    onChange: (avatarId: AvatarId) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function AvatarSelectionScreen({
    value,
    onChange,
    onContinue,
    onBack
}: AvatarSelectionScreenProps) {
    const selectedId = value || DEFAULT_AVATAR_ID;
    const selectedAvatar = AVATAR_OPTIONS.find(a => a.id === selectedId);

    useKeyboardNavigation({
        onEnter: onContinue,
        onBack,
        onNumber: (num) => {
            const avatar = AVATAR_OPTIONS[num - 1];
            if (avatar) {
                onChange(avatar.id);
            }
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Choose your avatar"
                subtitle="Pick the runner that represents you."
            />

            <div className="mb-8">
                <AvatarPicker
                    value={selectedId}
                    onChange={onChange}
                    columns={3}
                    size="lg"
                />
            </div>

            {/* Selected avatar name with fade transition */}
            <motion.p
                key={selectedId}
                className="text-center mb-6 v3-body-sm"
                style={{ color: 'var(--text-muted)' }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {selectedAvatar?.name}
            </motion.p>

            <ContinueButton
                onClick={() => {
                    // Ensure we have a selection before continuing
                    if (!value) onChange(DEFAULT_AVATAR_ID);
                    onContinue();
                }}
            />
        </QuestionScreen>
    );
}
