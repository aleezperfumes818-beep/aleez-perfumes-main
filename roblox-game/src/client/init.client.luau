--!strict
-- Client Orchestrator for Tropical Tamil Island Club & Karaoke

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

print("🌟 [Client] Initializing Tropical Tamil Island Client...")

local player = Players.LocalPlayer
local Network = require(ReplicatedStorage.Shared.Network)

-- Wait safely for UI folder
local uiFolder = script:WaitForChild("UI", 15) :: Folder
if not uiFolder then
    error("Critical: UI folder not found under Client script!")
end

local NotificationUI = require(uiFolder:WaitForChild("NotificationUI"))
local MusicPlayer = require(uiFolder:WaitForChild("MusicPlayer"))
local KaraokeUI = require(uiFolder:WaitForChild("KaraokeUI"))
local EmotesMenu = require(uiFolder:WaitForChild("EmotesMenu"))
local AdminPanel = require(uiFolder:WaitForChild("AdminPanel"))
local HangoutHUD = require(uiFolder:WaitForChild("HangoutHUD"))

-- 1. Initialize Notification System
NotificationUI.init()

-- 2. Initialize Global Club Music Widget
MusicPlayer.init()

-- 3. Initialize Karaoke Queue & Lyrics Widget
KaraokeUI.init()

-- 4. Initialize Emotes & Poses Menu with Live Search
EmotesMenu.init()

-- 5. Initialize Admin Panel
AdminPanel.init()

-- 6. Initialize Main Bottom Navigation HUD
HangoutHUD.init()

-- 7. Query server for Admin rights
task.spawn(function()
    local adminEvent = Network.getEvent("AdminCommand")
    adminEvent:FireServer("query")
end)

-- 8. Listen for Server Notifications (Toasts)
task.spawn(function()
    local notifEvent = Network.getEvent("Notification")
    notifEvent.OnClientEvent:Connect(function(message: string)
        NotificationUI.show(message)
    end)
end)

NotificationUI.show("🌴 Welcome to Tamil Island Club & Karaoke! Grab a coconut & sing!")
print("✅ [Client] All Island Clubbing & Karaoke Systems Loaded Successfully!")
