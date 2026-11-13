--!strict
-- Karaoke UI: Queue Manager & Synchronized Floating Lyrics Widget

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local Network = require(ReplicatedStorage.Shared.Network)
local player = Players.LocalPlayer

local KaraokeUI = {}

local widgetFrame: Frame?
local singerLabel: TextLabel?
local lyricLabel: TextLabel?
local queueCountLabel: TextLabel?

function KaraokeUI.init()
    local playerGui = player:WaitForChild("PlayerGui")
    local screenGui = playerGui:WaitForChild("HangoutHUD") :: ScreenGui

    widgetFrame = Instance.new("Frame")
    widgetFrame.Name = "KaraokeQueueWidget"
    widgetFrame.Size = UDim2.new(0, 320, 0, 240)
    widgetFrame.Position = UDim2.new(0.5, -160, 0.25, 0)
    widgetFrame.BackgroundColor3 = Color3.fromRGB(18, 20, 28)
    widgetFrame.BackgroundTransparency = 0.12
    widgetFrame.BorderSizePixel = 0
    widgetFrame.Visible = false
    widgetFrame.Parent = screenGui

    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 14)
    corner.Parent = widgetFrame

    local stroke = Instance.new("UIStroke")
    stroke.Color = Color3.fromRGB(255, 215, 60) -- Golden Mic Glow
    stroke.Thickness = 1.5
    stroke.Parent = widgetFrame

    -- Header
    local header = Instance.new("Frame")
    header.Size = UDim2.new(1, 0, 0, 42)
    header.BackgroundColor3 = Color3.fromRGB(25, 28, 42)
    header.BorderSizePixel = 0
    header.Parent = widgetFrame

    local hCorner = Instance.new("UICorner")
    hCorner.CornerRadius = UDim.new(0, 14)
    hCorner.Parent = header

    local title = Instance.new("TextLabel")
    title.Size = UDim2.new(1, -50, 1, 0)
    title.Position = UDim2.new(0, 15, 0, 0)
    title.BackgroundTransparency = 1
    title.Font = Enum.Font.GothamBlack
    title.TextSize = 14
    title.TextColor3 = Color3.fromRGB(255, 220, 80)
    title.TextXAlignment = Enum.TextXAlignment.Left
    title.Text = "🎤 ISLAND KARAOKE QUEUE"
    title.Parent = header

    local closeBtn = Instance.new("TextButton")
    closeBtn.Size = UDim2.new(0, 30, 0, 30)
    closeBtn.Position = UDim2.new(1, -38, 0.5, -15)
    closeBtn.BackgroundColor3 = Color3.fromRGB(45, 50, 65)
    closeBtn.Font = Enum.Font.GothamBold
    closeBtn.TextSize = 14
    closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    closeBtn.Text = "✕"
    closeBtn.Parent = header

    local cCorner = Instance.new("UICorner")
    cCorner.CornerRadius = UDim.new(0, 6)
    cCorner.Parent = closeBtn

    closeBtn.MouseButton1Click:Connect(function()
        KaraokeUI.toggleVisible()
    end)

    -- Singer Info
    singerLabel = Instance.new("TextLabel")
    singerLabel.Size = UDim2.new(1, -20, 0, 25)
    singerLabel.Position = UDim2.new(0, 10, 0, 52)
    singerLabel.BackgroundTransparency = 1
    singerLabel.Font = Enum.Font.GothamBold
    singerLabel.TextSize = 14
    singerLabel.TextColor3 = Color3.fromRGB(0, 240, 255)
    singerLabel.Text = "🎤 Singer: None"
    singerLabel.Parent = widgetFrame

    -- Live Lyric Line Box
    lyricLabel = Instance.new("TextLabel")
    lyricLabel.Size = UDim2.new(1, -20, 0, 50)
    lyricLabel.Position = UDim2.new(0, 10, 0, 82)
    lyricLabel.BackgroundColor3 = Color3.fromRGB(28, 32, 46)
    lyricLabel.Font = Enum.Font.GothamBold
    lyricLabel.TextSize = 13
    lyricLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
    lyricLabel.TextWrapped = true
    lyricLabel.Text = "Step up to the mic to sing!"
    lyricLabel.Parent = widgetFrame

    local lCorner = Instance.new("UICorner")
    lCorner.CornerRadius = UDim.new(0, 8)
    lCorner.Parent = lyricLabel

    -- Queue Count Info
    queueCountLabel = Instance.new("TextLabel")
    queueCountLabel.Size = UDim2.new(1, -20, 0, 22)
    queueCountLabel.Position = UDim2.new(0, 10, 0, 140)
    queueCountLabel.BackgroundTransparency = 1
    queueCountLabel.Font = Enum.Font.Gotham
    queueCountLabel.TextSize = 12
    queueCountLabel.TextColor3 = Color3.fromRGB(180, 190, 210)
    queueCountLabel.Text = "Waiting in Queue: 0 players"
    queueCountLabel.Parent = widgetFrame

    -- Action Buttons (Join Queue / Leave Queue / Skip)
    local joinBtn = Instance.new("TextButton")
    joinBtn.Size = UDim2.new(0.48, 0, 0, 36)
    joinBtn.Position = UDim2.new(0, 10, 1, -48)
    joinBtn.BackgroundColor3 = Color3.fromRGB(220, 150, 30)
    joinBtn.Font = Enum.Font.GothamBold
    joinBtn.TextSize = 12
    joinBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    joinBtn.Text = "🎤 Join Queue"
    joinBtn.Parent = widgetFrame

    local jCorner = Instance.new("UICorner")
    jCorner.CornerRadius = UDim.new(0, 8)
    jCorner.Parent = joinBtn

    local skipBtn = Instance.new("TextButton")
    skipBtn.Size = UDim2.new(0.48, 0, 0, 36)
    skipBtn.Position = UDim2.new(0.52, -10, 1, -48)
    skipBtn.BackgroundColor3 = Color3.fromRGB(160, 45, 60)
    skipBtn.Font = Enum.Font.GothamBold
    skipBtn.TextSize = 12
    skipBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    skipBtn.Text = "⏭ Skip Turn"
    skipBtn.Parent = widgetFrame

    local sCorner = Instance.new("UICorner")
    sCorner.CornerRadius = UDim.new(0, 8)
    sCorner.Parent = skipBtn

    -- Wire Events
    local joinRemote = Network.getEvent("JoinKaraokeQueue")
    local skipRemote = Network.getEvent("SkipKaraokeSinger")
    local stateRemote = Network.getEvent("KaraokeStateSync")
    local lyricRemote = Network.getEvent("KaraokeLyricSync")

    joinBtn.MouseButton1Click:Connect(function()
        joinRemote:FireServer()
    end)

    skipBtn.MouseButton1Click:Connect(function()
        skipRemote:FireServer()
    end)

    stateRemote.OnClientEvent:Connect(function(data: { Singer: string, Queue: { string } })
        if singerLabel then
            singerLabel.Text = "🎤 Singer: " .. data.Singer
        end
        if queueCountLabel then
            queueCountLabel.Text = "Waiting in Queue: " .. #data.Queue .. " players"
        end
    end)

    lyricRemote.OnClientEvent:Connect(function(data: { SongTitle: string, SingerName: string, CurrentLine: string, NextLine: string })
        if lyricLabel then
            lyricLabel.Text = data.CurrentLine
        end
        if singerLabel then
            singerLabel.Text = "🎤 " .. data.SingerName .. " - " .. data.SongTitle
        end
    end)
end

function KaraokeUI.toggleVisible()
    if widgetFrame then
        widgetFrame.Visible = not widgetFrame.Visible
    end
end

return KaraokeUI
