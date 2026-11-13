--!strict
-- Server Orchestrator for Tamil Island Club & Karaoke (Clean & Optimized)

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

print("🌴 [Server] Starting Tamil Island Club & Karaoke...")

-- Clean up any legacy objects if lingering
for _, obj in ipairs(Workspace:GetChildren()) do
    if obj.Name == "MarinaNeonClub" or obj.Name == "TimePlayedThumbnailLeaderboard" or obj.Name == "LeaderboardBoard" then
        obj:Destroy()
    end
end

-- 1. Initialize Network Remotes
local Network = require(ReplicatedStorage.Shared.Network)
Network.init()

-- 2. Initialize Creator Store Auto-Loader (HD Admin)
local CreatorStoreLoader = require(script.CreatorStoreLoader)
CreatorStoreLoader.init()

-- 3. Initialize Club Visual FX
local ClubFX = require(script.ClubFX)

-- 4. Initialize DJ Manager
local DJManager = require(script.DJManager)
DJManager.init()

-- 5. Initialize Karaoke Server (Singing Queue & Sync Lyrics)
local KaraokeServer = require(script.KaraokeServer)
KaraokeServer.init()

-- 6. Initialize Global Music Server
local MusicServer = require(script.MusicServer)
MusicServer.init()

-- 7. Build the 250x250 Tropical Island, Nightclub, Beach Loungers & Fireworks
local IslandBuilder = require(script.IslandBuilder)
IslandBuilder.init()

-- 8. Start Club FX loops
ClubFX.init()

-- 9. Initialize Admin System & Tools
local AdminManager = require(script.AdminManager)
AdminManager.init()

-- 10. Initialize Player Stats & Social Mechanics
local LeaderstatsManager = require(script.LeaderstatsManager)
LeaderstatsManager.init()

local OverheadManager = require(script.OverheadManager)
OverheadManager.init()

local PassiveRewards = require(script.PassiveRewards)
PassiveRewards.init()

local AFKManager = require(script.AFKManager)
AFKManager.init()

local RagdollManager = require(script.RagdollManager)
RagdollManager.init()

print("✅ [Server] Island Clubbing & Karaoke Fully Ready!")
