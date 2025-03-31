module.exports = {
    expo: {
        name: "volley-league-app",
        slug: "volley-league-app",
        scheme: "volley-league",
        "owner": "kronnosco",
        newArchEnabled: true,
        extra: {
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
            supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
            eas: {
                projectId: "c0c709b7-9547-4512-82f9-585b6a8b4697",
            },
        },
    },
};