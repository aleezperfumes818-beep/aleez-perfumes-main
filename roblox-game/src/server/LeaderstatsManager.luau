--!strict
-- Leaderstats & DataStore Manager for Hangout Game

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local RunService = game:GetService("RunService")

local LeaderstatsManager = {}

local DATA_STORE_NAME = "HangoutPlayerData_v1"
local playerDataStore

-- Only initialize DataStore if not in mock/restricted environment
pcall(function()
    playerDataStore = DataStoreService:GetDataStore(DATA_STORE_NAME)
end)

local sessionData = {}

function LeaderstatsManager.init()
    Players.PlayerAdded:Connect(function(player)
        LeaderstatsManager.onPlayerAdded(player)
    end)

    Players.PlayerRemoving:Connect(function(player)
        LeaderstatsManager.onPlayerRemoving(player)
    end)

    -- Handle players already present (e.g. fast Studio load)
    for _, player in ipairs(Players:GetPlayers()) do
        task.spawn(LeaderstatsManager.onPlayerAdded, player)
    end

    -- Auto-save before server shutdown
    game:BindToClose(function()
        for _, player in ipairs(Players:GetPlayers()) do
            LeaderstatsManager.saveData(player)
        end
    end)
end

function LeaderstatsManager.onPlayerAdded(player: Player)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local minutesValue = Instance.new("IntValue")
    minutesValue.Name = "Minutes"
    minutesValue.Value = 0
    minutesValue.Parent = leaderstats

    local vibesValue = Instance.new("IntValue")
    vibesValue.Name = "Vibes"
    vibesValue.Value = 0
    vibesValue.Parent = leaderstats

    -- Load saved data
    local key = "Player_" .. player.UserId
    local loadedData = nil

    if playerDataStore then
        local success, result = pcall(function()
            return playerDataStore:GetAsync(key)
        end)
        if success and type(result) == "table" then
            loadedData = result
        end
    end

    if loadedData then
        minutesValue.Value = loadedData.Minutes or 0
        vibesValue.Value = loadedData.Vibes or 0
    end

    sessionData[player.UserId] = {
        JoinTime = os.time(),
        Minutes = minutesValue,
        Vibes = vibesValue
    }
end

function LeaderstatsManager.onPlayerRemoving(player: Player)
    LeaderstatsManager.saveData(player)
    sessionData[player.UserId] = nil
end

function LeaderstatsManager.saveData(player: Player)
    local data = sessionData[player.UserId]
    if not data or not playerDataStore then return end

    local key = "Player_" .. player.UserId
    local payload = {
        Minutes = data.Minutes.Value,
        Vibes = data.Vibes.Value
    }

    pcall(function()
        playerDataStore:SetAsync(key, payload)
    end)
end

function LeaderstatsManager.addVibes(player: Player, amount: number)
    local data = sessionData[player.UserId]
    if data and data.Vibes then
        data.Vibes.Value += amount
    end
end

function LeaderstatsManager.addMinute(player: Player)
    local data = sessionData[player.UserId]
    if data and data.Minutes then
        data.Minutes.Value += 1
    end
end

return LeaderstatsManager
