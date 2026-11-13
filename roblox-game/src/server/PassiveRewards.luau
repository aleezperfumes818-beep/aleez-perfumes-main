--!strict
-- Passive Rewards Manager: Rewards players for hanging out

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local Network = require(ReplicatedStorage.Shared.Network)
local LeaderstatsManager = require(script.Parent.LeaderstatsManager)

local PassiveRewards = {}

function PassiveRewards.init()
    task.spawn(function()
        while true do
            task.wait(Config.PassiveRewardInterval)
            local notifEvent = Network.getEvent("Notification")
            
            for _, player in ipairs(Players:GetPlayers()) do
                LeaderstatsManager.addMinute(player)
                LeaderstatsManager.addVibes(player, Config.PassiveRewardAmount)

                -- Send reward popup in Tamil
                notifEvent:FireClient(player, "✨ +" .. Config.PassiveRewardAmount .. " " .. Config.CurrencyName .. "! சில் பண்ணுங்க நண்பா! 🌴")
            end
        end
    end)
end

return PassiveRewards
