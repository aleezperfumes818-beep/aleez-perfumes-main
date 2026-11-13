--!strict
-- Global Club Music Player UI (Synced with the entire club)

local SoundService = game:GetService("SoundService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local Players = game:GetService("Players")

local Config = require(ReplicatedStorage.Shared.Config)
local Network = require(ReplicatedStorage.Shared.Network)
local player = Players.LocalPlayer

local MusicPlayer = {}

local bgmSound: Sound
local isMuted = false
local playerFrame: Frame

function MusicPlayer.init()
    -- Create ambient sound in SoundService
    bgmSound = Instance.new("Sound")
    bgmSound.Name = "ClubGlobalBGM"
    bgmSound.Volume = 0.5
    bgmSound.Looped = true
    bgmSound.Parent = SoundService

    local playerGui = player:WaitForChild("PlayerGui")
    local screenGui = playerGui:WaitForChild("HangoutHUD") :: ScreenGui

    playerFrame = Instance.new("Frame")
    playerFrame.Name = "MusicPlayerWidget"
    playerFrame.Size = UDim2.new(0, 310, 0, 130)
    playerFrame.Position = UDim2.new(0, 20, 0, 20)
    playerFrame.BackgroundColor3 = Color3.fromRGB(18, 20, 28)
    playerFrame.BackgroundTransparency = 0.15
    playerFrame.BorderSizePixel = 0
    playerFrame.Visible = true
    playerFrame.Parent = screenGui

    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 12)
    corner.Parent = playerFrame

    local stroke = Instance.new("UIStroke")
    stroke.Color = Color3.fromRGB(0, 240, 255) -- Cyber Cyan
    stroke.Thickness = 1.2
    stroke.Parent = playerFrame

    -- Song Title Label
    local titleLabel = Instance.new("TextLabel")
    titleLabel.Name = "TrackTitle"
    titleLabel.Size = UDim2.new(1, -20, 0, 24)
    titleLabel.Position = UDim2.new(0, 10, 0, 8)
    titleLabel.BackgroundTransparency = 1
    titleLabel.Font = Enum.Font.GothamBold
    titleLabel.TextSize = 13
    titleLabel.TextColor3 = Color3.fromRGB(255, 235, 200)
    titleLabel.TextXAlignment = Enum.TextXAlignment.Left
    titleLabel.TextTruncate = Enum.TextTruncate.AtEnd
    titleLabel.Text = "🎵 Loading Club Beats..."
    titleLabel.Parent = playerFrame

    -- Control Buttons Bar
    local controls = Instance.new("Frame")
    controls.Size = UDim2.new(1, -20, 0, 30)
    controls.Position = UDim2.new(0, 10, 0, 36)
    controls.BackgroundTransparency = 1
    controls.Parent = playerFrame

    local layout = Instance.new("UIListLayout")
    layout.FillDirection = Enum.FillDirection.Horizontal
    layout.HorizontalAlignment = Enum.HorizontalAlignment.Left
    layout.VerticalAlignment = Enum.VerticalAlignment.Center
    layout.Padding = UDim.new(0, 8)
    layout.Parent = controls

    local prevBtn = Instance.new("TextButton")
    prevBtn.Size = UDim2.new(0, 34, 0, 28)
    prevBtn.BackgroundColor3 = Color3.fromRGB(38, 42, 58)
    prevBtn.Font = Enum.Font.GothamBold
    prevBtn.TextSize = 14
    prevBtn.TextColor3 = Color3.fromRGB(230, 235, 245)
    prevBtn.Text = "⏮"
    prevBtn.Parent = controls
    local prevCorner = Instance.new("UICorner")
    prevCorner.CornerRadius = UDim.new(0, 6)
    prevCorner.Parent = prevBtn

    local playBtn = Instance.new("TextButton")
    playBtn.Name = "PlayPauseBtn"
    playBtn.Size = UDim2.new(0, 34, 0, 28)
    playBtn.BackgroundColor3 = Color3.fromRGB(220, 70, 140) -- Neon Pink
    playBtn.Font = Enum.Font.GothamBold
    playBtn.TextSize = 14
    playBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    playBtn.Text = "⏸"
    playBtn.Parent = controls
    local playCorner = Instance.new("UICorner")
    playCorner.CornerRadius = UDim.new(0, 6)
    playCorner.Parent = playBtn

    local nextBtn = Instance.new("TextButton")
    nextBtn.Size = UDim2.new(0, 34, 0, 28)
    nextBtn.BackgroundColor3 = Color3.fromRGB(38, 42, 58)
    nextBtn.Font = Enum.Font.GothamBold
    nextBtn.TextSize = 14
    nextBtn.TextColor3 = Color3.fromRGB(230, 235, 245)
    nextBtn.Text = "⏭"
    nextBtn.Parent = controls
    local nextCorner = Instance.new("UICorner")
    nextCorner.CornerRadius = UDim.new(0, 6)
    nextCorner.Parent = nextBtn

    local muteBtn = Instance.new("TextButton")
    muteBtn.Name = "MuteBtn"
    muteBtn.Size = UDim2.new(0, 70, 0, 28)
    muteBtn.BackgroundColor3 = Color3.fromRGB(38, 42, 58)
    muteBtn.Font = Enum.Font.GothamMedium
    muteBtn.TextSize = 12
    muteBtn.TextColor3 = Color3.fromRGB(230, 235, 245)
    muteBtn.Text = "🔊 சத்தம்"
    muteBtn.Parent = controls
    local muteCorner = Instance.new("UICorner")
    muteCorner.CornerRadius = UDim.new(0, 6)
    muteCorner.Parent = muteBtn

    -- Custom Song ID Bar
    local customBar = Instance.new("Frame")
    customBar.Size = UDim2.new(1, -20, 0, 34)
    customBar.Position = UDim2.new(0, 10, 0, 76)
    customBar.BackgroundColor3 = Color3.fromRGB(28, 30, 42)
    customBar.Parent = playerFrame

    local customCorner = Instance.new("UICorner")
    customCorner.CornerRadius = UDim.new(0, 6)
    customCorner.Parent = customBar

    local idInput = Instance.new("TextBox")
    idInput.Size = UDim2.new(1, -80, 1, 0)
    idInput.Position = UDim2.new(0, 8, 0, 0)
    idInput.BackgroundTransparency = 1
    idInput.Font = Enum.Font.Gotham
    idInput.TextSize = 12
    idInput.TextColor3 = Color3.fromRGB(255, 255, 255)
    idInput.PlaceholderColor3 = Color3.fromRGB(150, 160, 180)
    idInput.PlaceholderText = "Tamil Song ID (பாட்டு ID)..."
    idInput.ClearTextOnFocus = false
    idInput.Text = ""
    idInput.Parent = customBar

    local playCustomBtn = Instance.new("TextButton")
    playCustomBtn.Size = UDim2.new(0, 70, 0, 26)
    playCustomBtn.Position = UDim2.new(1, -74, 0.5, -13)
    playCustomBtn.BackgroundColor3 = Color3.fromRGB(0, 180, 140)
    playCustomBtn.Font = Enum.Font.GothamBold
    playCustomBtn.TextSize = 11
    playCustomBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    playCustomBtn.Text = "Play போடு"
    playCustomBtn.Parent = customBar

    local playCustomCorner = Instance.new("UICorner")
    playCustomCorner.CornerRadius = UDim.new(0, 4)
    playCustomCorner.Parent = playCustomBtn

    local changeRemote = Network.getEvent("ChangeClubMusic")
    local syncRemote = Network.getEvent("ClubMusicSync")

    -- Listen to Global Server Sync
    syncRemote.OnClientEvent:Connect(function(data: { AssetId: string, Title: string, IsPlaying: boolean })
        bgmSound.SoundId = data.AssetId
        titleLabel.Text = "🎵 " .. data.Title
        if data.IsPlaying and not isMuted then
            bgmSound:Play()
            playBtn.Text = "⏸"
        else
            bgmSound:Pause()
            playBtn.Text = "▶"
        end
    end)

    -- Button Interactions
    prevBtn.MouseButton1Click:Connect(function()
        changeRemote:FireServer("skip", -1)
    end)

    nextBtn.MouseButton1Click:Connect(function()
        changeRemote:FireServer("skip", 1)
    end)

    playBtn.MouseButton1Click:Connect(function()
        changeRemote:FireServer("pause")
    end)

    muteBtn.MouseButton1Click:Connect(function()
        isMuted = not isMuted
        bgmSound.Volume = isMuted and 0 or 0.5
        muteBtn.Text = isMuted and "🔈 Muted" or "🔊 சத்தம்"
    end)

    playCustomBtn.MouseButton1Click:Connect(function()
        local rawText = idInput.Text
        local num = tonumber(string.match(rawText, "%d+"))
        if num then
            changeRemote:FireServer("custom", num)
            idInput.Text = ""
        end
    end)
end

function MusicPlayer.toggleVisible()
    if playerFrame then
        playerFrame.Visible = not playerFrame.Visible
    end
end

return MusicPlayer
