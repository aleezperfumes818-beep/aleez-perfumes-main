--!strict
-- AFK Mode Manager: Anchors and marks players who are AFK

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Network = require(ReplicatedStorage.Shared.Network)
local OverheadManager = require(script.Parent.OverheadManager)

local AFKManager = {}

local afkStates = {}

function AFKManager.init()
    local toggleEvent = Network.getEvent("ToggleAFK")

    toggleEvent.OnServerEvent:Connect(function(player: Player)
        local currentState = afkStates[player.UserId] or false
        local newState = not currentState
        afkStates[player.UserId] = newState

        local character = player.Character
        if character then
            local root = character:FindFirstChild("HumanoidRootPart") :: BasePart?
            if root then
                root.Anchored = newState
            end

            -- Visual dimming
            for _, part in ipairs(character:GetDescendants()) do
                if part:IsA("BasePart") and part.Name ~= "HumanoidRootPart" then
                    part.Transparency = newState and 0.35 or 0
                end
            end
        end

        OverheadManager.setAFK(player, newState)

        local notifEvent = Network.getEvent("Notification")
        if newState then
            notifEvent:FireClient(player, "💤 You are now AFK (Anchored & Safe)")
        else
            notifEvent:FireClient(player, "👋 Welcome back! (AFK disabled)")
        end
    end)
end

return AFKManager
