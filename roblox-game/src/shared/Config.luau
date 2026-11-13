--!strict
-- Shared Configuration for Small Island Tamil Clubbing & Karaoke

local Config = {
    GameName = "Tamil Island Club & Karaoke 🌴🎤",
    
    -- Admins (UserIds who have full admin rights)
    -- Game Creator and Studio players are automatically given Admin rights!
    Admins = {
        0, -- Add friend UserIds here
    },

    -- Currency & Economy
    CurrencyName = "Vibes",
    PassiveRewardInterval = 60, -- Every 60 seconds
    PassiveRewardAmount = 15,   -- 15 Vibe Points per minute
    
    -- Island Map Settings
    IslandSize = 250, -- 250 x 250 studs
    OceanBoundaryDistance = 145, -- Beyond this distance from center, teleport back to beach

    -- Overhead Tags
    DefaultTag = "Island Clubber",
    DefaultTagColor = Color3.fromRGB(130, 210, 255),
    SingerTag = "🎤 On Stage (Singer)",
    SingerTagColor = Color3.fromRGB(255, 230, 80),
    DJTag = "🎧 Resident DJ",
    DJTagColor = Color3.fromRGB(0, 255, 230),
    AdminTag = "🛡️ Admin",
    AdminTagColor = Color3.fromRGB(0, 240, 140),
    CreatorTag = "👑 Island Owner",
    CreatorTagColor = Color3.fromRGB(255, 215, 0),
    AFKTag = "💤 Resting",
    AFKTagColor = Color3.fromRGB(255, 130, 130),

    -- Karaoke & Club Playlist with Line-by-Line Synchronized Lyrics!
    Playlist = {
        {
            Title = "Enjoy Enjaami - Dhee & Arivu (Tamil Hit)",
            AssetId = "rbxassetid://1837879082",
            Lyrics = {
                { Time = 0,  Text = "🎵 [Music Starts] Enjoy Enjaami..." },
                { Time = 5,  Text = "Cuckoo cuckoo... thaatha thaatha kala vettu" },
                { Time = 10, Text = "Cuckoo cuckoo... pondhula yaaru meen kothu" },
                { Time = 15, Text = "Enjoy, enjaami... vaango vaango onnaagi" },
                { Time = 20, Text = "Ammaani, ambaari... thaene vazhiye vellari" },
                { Time = 25, Text = "Paattan pootan kaatha boomi... aatam pottu paadum samy!" },
                { Time = 32, Text = "Kelee kelee en kiliye... kaatukulla paadum kuyile!" },
                { Time = 38, Text = "Enjoy, enjaami... vaango vaango onnaagi! 🌴" },
            }
        },
        {
            Title = "Vaathi Coming - Anirudh (Kuthu Anthem)",
            AssetId = "rbxassetid://1843404009",
            Lyrics = {
                { Time = 0,  Text = "⚡ [Beats Drop] Vaathi Coming Ottha!" },
                { Time = 6,  Text = "Kena paaru master vandeenga thaan da!" },
                { Time = 12, Text = "Adhira vidu gethu maari... aatam poda vaango da!" },
                { Time = 18, Text = "Vaathi raid-u... step-ah podu!" },
                { Time = 24, Text = "Tamil kuthu beat-la jora thaan aadu!" },
                { Time = 30, Text = "Mass-u thaan, class-u thaan... Vaathi Coming da! 🔥" },
            }
        },
        {
            Title = "Arabic Kuthu (Halamithi Habibo) - Anirudh",
            AssetId = "rbxassetid://9043887091",
            Lyrics = {
                { Time = 0,  Text = "✨ [Intro] Malama Pitha Pithadhey..." },
                { Time = 6,  Text = "Halamithi habibo... halamithi habibo!" },
                { Time = 12, Text = "Malama pitha pithadhey... halamithi habibo!" },
                { Time = 18, Text = "Holio holio... un vizhigal solliyo!" },
                { Time = 24, Text = "Jolly-o jolly-o... Chennai kuthu aadi-o! 💃" },
            }
        },
        {
            Title = "Rowdy Baby - Yuvan Shankar Raja (Party Jam)",
            AssetId = "rbxassetid://1839843634",
            Lyrics = {
                { Time = 0,  Text = "💥 [Party Beats] Hey en rowdy baby!" },
                { Time = 6,  Text = "Kettukka vaadi en thangame..." },
                { Time = 12, Text = "Rowdy baby... un kooda aada thonuthe!" },
                { Time = 18, Text = "Kuthu step-u poda vanthome... Island-la jolly pannuvom!" },
                { Time = 26, Text = "Gethu kaatu... Chennai kuthu paatu! 🌟" },
            }
        }
    },

    -- Club & Island Dance Animations
    Emotes = {
        { Name = "Kuthu Dance (Dappankuthu)", Category = "Dances", Id = "rbxassetid://507771019" },
        { Name = "Mass Step (Hero Walk)", Category = "Dances", Id = "rbxassetid://507771957" },
        { Name = "Vaathi Bounce", Category = "Dances", Id = "rbxassetid://507772104" },
        { Name = "Freestyle Kuthu", Category = "Dances", Id = "rbxassetid://507776879" },
        { Name = "Island Chill Sway", Category = "Dances", Id = "rbxassetid://507777268" },
        { Name = "Beach Lounger Relax", Category = "Poses", Id = "rbxassetid://507777826" },
        { Name = "Sand Sit Pose", Category = "Poses", Id = "rbxassetid://507776720" },
        { Name = "Palm Tree Lean", Category = "Poses", Id = "rbxassetid://507776043" },
        { Name = "Karaoke Singer Pose", Category = "Poses", Id = "rbxassetid://507770453" },
        { Name = "Whistle & Hype", Category = "Reactions", Id = "rbxassetid://507770677" },
        { Name = "Vanakkam (Namaste)", Category = "Reactions", Id = "rbxassetid://507770239" },
        { Name = "Beach Clapping", Category = "Reactions", Id = "rbxassetid://507770677" },
    },

    -- Beach Bar & Club Drinks
    Drinks = {
        { Name = "Fresh Tender Coconut 🥥", VibesBonus = 12 },
        { Name = "Madurai Jigarthanda 🍧", VibesBonus = 10 },
        { Name = "Island Neon Mocktail 🍹", VibesBonus = 8 },
        { Name = "Hot Kadai Chai ☕", VibesBonus = 5 },
    }
}

return Config
