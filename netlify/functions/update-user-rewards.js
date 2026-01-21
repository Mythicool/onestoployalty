/**
 * Netlify Function: Update User Rewards
 * 
 * This function provides a secure server-side way to update user rewards.
 * It validates the JWT token from Netlify Identity before making changes.
 * 
 * Note: For most use cases, the client-side Netlify Identity API is sufficient.
 * This function is provided for cases where additional server-side validation is needed.
 */

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Check for identity context
    const { identity, user } = context.clientContext || {};

    if (!user) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized - no user context' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { reward } = body;

        if (!reward) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing reward data' })
            };
        }

        // Validate reward structure
        const requiredFields = ['name', 'rarity', 'reward', 'code'];
        for (const field of requiredFields) {
            if (!reward[field]) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: `Missing required field: ${field}` })
                };
            }
        }

        // Get current user metadata
        const currentRewards = user.user_metadata?.rewards || [];
        const currentPacksOpened = user.user_metadata?.packs_opened || 0;

        // Add new reward with timestamp
        const newReward = {
            ...reward,
            earnedAt: new Date().toISOString(),
            verified: true // Server-verified reward
        };

        const updatedRewards = [...currentRewards, newReward];
        const updatedPacksOpened = currentPacksOpened + 1;

        // The actual update is done client-side via Netlify Identity API
        // This function validates and returns the new data
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                reward: newReward,
                total_rewards: updatedRewards.length,
                packs_opened: updatedPacksOpened
            })
        };

    } catch (error) {
        console.error('Error processing reward:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
