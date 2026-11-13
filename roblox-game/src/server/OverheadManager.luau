--!strict
-- Overhead Tag & Title Manager (100% clean fonts, zero square box/tofu glitches)

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)

local OverheadManager = {}

local BILLBOARD_NAME = "HangoutOverhead"

function OverheadManager.init()
    Players.PlayerAdded:Connect(function(player)
        player.CharacterAdded:Connect(function(character)
            OverheadManager.applyOverhead(player, character)
        end)
    end)

    for _, player in ipairs(Players:GetPlayers()) do
        if player.Character then
            OverheadManager.applyOverhead(player, player.Character)
        end
        player.CharacterAdded:Connect(function(character)
            OverheadManager.applyOverhead(player, character)
        end)
    end
end

local function getRoleTag(player: Player): (string, Color3)
    local AdminManager = require(script.Parent.AdminManager)
    local DJManager = require(script.Parent.DJManager)

    if DJManager.getCurrentDJ() == player then
        return Config.DJTag, Config.DJTagColor
    elseif player.UserId == game.CreatorId then
        return Config.CreatorTag, Config.CreatorTagColor
    elseif AdminManager.isAdmin(player) then
        return Config.AdminTag, Config.AdminTagColor
    else
        return Config.DefaultTag, Config.DefaultTagColor
    end
end

function OverheadManager.applyOverhead(player: Player, character: Model)
    local head = character:WaitForChild("Head", 10)
    if not head then return end

    local existing = head:FindFirstChild(BILLBOARD_NAME)
    if existing then existing:Destroy() end

    local billboard = Instance.new("BillboardGui")
    billboard.Name = BILLBOARD_NAME
    billboard.Size = UDim2.new(0, 220, 0, 70)
    billboard.StudsOffset = Vector3.new(0, 2.8, 0)
    billboard.AlwaysOnTop = false
    billboard.MaxDistance = 65
    billboard.ResetOnSpawn = false
    billboard.Parent = head

    local frame = Instance.new("Frame")
    frame.Size = UDim2.new(1, 0, 1, 0)
    frame.BackgroundTransparency = 1
    frame.Parent = billboard

    local listLayout = Instance.new("UIListLayout")
    listLayout.FillDirection = Enum.FillDirection.Vertical
    listLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
    listLayout.VerticalAlignment = Enum.VerticalAlignment.Center
    listLayout.Padding = UDim.new(0, 2)
    listLayout.Parent = frame

    -- Status Tag
    local tagLabel = Instance.new("TextLabel")
    tagLabel.Name = "TagLabel"
    tagLabel.Size = UDim2.new(1, 0, 0, 20)
    tagLabel.BackgroundTransparency = 1
    tagLabel.Font = Enum.Font.GothamBlack
    tagLabel.TextSize = 14
    tagLabel.TextStrokeTransparency = 0.2
    tagLabel.TextStrokeColor3 = Color3.fromRGB(0, 0, 0)

    local tagText, tagColor = getRoleTag(player)
    tagLabel.Text = "[" .. tagText .. "]"
    tagLabel.TextColor3 = tagColor
    tagLabel.Parent = frame

    -- Player Name
    local nameLabel = Instance.new("TextLabel")
    nameLabel.Name = "NameLabel"
    nameLabel.Size = UDim2.new(1, 0, 0, 22)
    nameLabel.BackgroundTransparency = 1
    nameLabel.Font = Enum.Font.GothamBold
    nameLabel.TextSize = 16
    nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
    nameLabel.TextStrokeTransparency = 0.3
    nameLabel.TextStrokeColor3 = Color3.fromRGB(0, 0, 0)
    nameLabel.Text = player.DisplayName .. " (@" .. player.Name .. ")"
    nameLabel.Parent = frame

    -- Time Spent subtitle
    local timeLabel = Instance.new("TextLabel")
    timeLabel.Name = "TimeLabel"
    timeLabel.Size = UDim2.new(1, 0, 0, 16)
    timeLabel.BackgroundTransparency = 1
    timeLabel.Font = Enum.Font.GothamMedium
    timeLabel.TextSize = 12
    timeLabel.TextColor3 = Color3.fromRGB(0, 240, 255)
    timeLabel.TextStrokeTransparency = 0.5
    timeLabel.TextStrokeColor3 = Color3.fromRGB(0, 0, 0)
    timeLabel.Text = "Time: 0m"
    timeLabel.Parent = frame

    -- Update minutes live
    local leaderstats = player:WaitForChild("leaderstats", 10)
    if leaderstats then
        local minutesVal = leaderstats:WaitForChild("Minutes", 10) :: IntValue?
        if minutesVal then
            timeLabel.Text = "Time: " .. minutesVal.Value .. "m"
            minutesVal.Changed:Connect(function(newVal)
                timeLabel.Text = "Time: " .. newVal .. "m"
            end)
        end
    end
end

function OverheadManager.setAFK(player: Player, isAFK: boolean)
    local char = player.Character
    if not char then return end
    local head = char:FindFirstChild("Head")
    if not head then return end
    local overhead = head:FindFirstChild(BILLBOARD_NAME)
    if not overhead then return end
    local tagLabel = overhead:FindFirstChild("TagLabel", true) :: TextLabel?
    if not tagLabel then return end

    if isAFK then
        tagLabel.Text = "[" .. Config.AFKTag .. "]"
        tagLabel.TextColor3 = Config.AFKTagColor
    else
        local tagText, tagColor = getRoleTag(player)
        tagLabel.Text = "[" .. tagText .. "]"
        tagLabel.TextColor3 = tagColor
    end
end

return OverheadManager
