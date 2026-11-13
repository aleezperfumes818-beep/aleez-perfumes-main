--!strict
-- DJ Booth Manager: Allows players to claim the DJ Deck and control the crowd

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Network = require(ReplicatedStorage.Shared.Network)
local OverheadManager = require(script.Parent.OverheadManager)
local ClubFX = require(script.Parent.ClubFX)

local DJManager = {}

local currentDJ: Player? = nil

function DJManager.init()
    Players.PlayerRemoving:Connect(function(player)
        if currentDJ == player then
            currentDJ = nil
        end
    end)
end

function DJManager.claimDJ(player: Player)
    if currentDJ == player then
        local notif = Network.getEvent("Notification")
        notif:FireClient(player, "🎧 நீங்க ஏற்கனவே DJ Deck-ல தான் இருக்கீங்க! (You're already the DJ)")
        return
    end

    currentDJ = player

    -- Broadcast announcement
    local notif = Network.getEvent("Notification")
    notif:FireAllClients("🎧 DJ " .. player.DisplayName .. " (@" .. player.Name .. ") IS NOW ON THE DECKS! மாஸ் பண்ணுங்க! 🔥")

    -- Give DJ Smoke Cannon Remote Tool
    local backpack = player:FindFirstChild("Backpack")
    if backpack and not backpack:FindFirstChild("💨 Smoke Blast") then
        local tool = Instance.new("Tool")
        tool.Name = "💨 Smoke Blast"
        tool.ToolTip = "Blast Stage Smoke Cannons"

        local handle = Instance.new("Part")
        handle.Name = "Handle"
        handle.Size = Vector3.new(1, 1, 1)
        handle.Material = Enum.Material.Neon
        handle.Color = Color3.fromRGB(0, 240, 255)
        handle.Parent = tool

        tool.Activated:Connect(function()
            ClubFX.blastSmoke()
            notif:FireAllClients("💨 DJ " .. player.DisplayName .. " FIRED THE SMOKE JETS! ⚡")
        end)

        tool.Parent = backpack
    end
end

function DJManager.getCurrentDJ(): Player?
    return currentDJ
end

return DJManager
