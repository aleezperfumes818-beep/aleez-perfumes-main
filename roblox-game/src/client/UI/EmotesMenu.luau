--!strict
-- Enhanced Emotes & Poses Menu with Search & Categories for Tamil Clubbers

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)

local player = Players.LocalPlayer
local EmotesMenu = {}

local menuFrame: Frame
local scroll: ScrollingFrame
local currentTrack: AnimationTrack?
local emoteButtons = {}

function EmotesMenu.init()
    local playerGui = player:WaitForChild("PlayerGui")
    local screenGui = playerGui:WaitForChild("HangoutHUD") :: ScreenGui

    menuFrame = Instance.new("Frame")
    menuFrame.Name = "EmotesMenuWidget"
    menuFrame.Size = UDim2.new(0, 270, 0, 380)
    menuFrame.Position = UDim2.new(1, -290, 0.5, -190)
    menuFrame.BackgroundColor3 = Color3.fromRGB(16, 18, 26)
    menuFrame.BackgroundTransparency = 0.12
    menuFrame.BorderSizePixel = 0
    menuFrame.Visible = false
    menuFrame.Parent = screenGui

    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 14)
    corner.Parent = menuFrame

    local stroke = Instance.new("UIStroke")
    stroke.Color = Color3.fromRGB(255, 60, 160) -- Neon Pink Glow
    stroke.Thickness = 1.2
    stroke.Parent = menuFrame

    -- Header Title
    local title = Instance.new("TextLabel")
    title.Size = UDim2.new(1, 0, 0, 36)
    title.BackgroundTransparency = 1
    title.Font = Enum.Font.GothamBlack
    title.TextSize = 14
    title.TextColor3 = Color3.fromRGB(255, 230, 245)
    title.Text = "💃 TAMIL CLUB DANCES & POSES"
    title.Parent = menuFrame

    -- Search Bar
    local searchBox = Instance.new("TextBox")
    searchBox.Size = UDim2.new(1, -20, 0, 30)
    searchBox.Position = UDim2.new(0, 10, 0, 38)
    searchBox.BackgroundColor3 = Color3.fromRGB(26, 28, 40)
    searchBox.Font = Enum.Font.Gotham
    searchBox.TextSize = 12
    searchBox.TextColor3 = Color3.fromRGB(255, 255, 255)
    searchBox.PlaceholderText = "🔍 Search Dance / தேடு..."
    searchBox.PlaceholderColor3 = Color3.fromRGB(130, 140, 160)
    searchBox.Parent = menuFrame

    local sCorner = Instance.new("UICorner")
    sCorner.CornerRadius = UDim.new(0, 6)
    sCorner.Parent = searchBox

    -- Scrolling Frame for Emotes
    scroll = Instance.new("ScrollingFrame")
    scroll.Size = UDim2.new(1, -16, 1, -130)
    scroll.Position = UDim2.new(0, 8, 0, 78)
    scroll.BackgroundTransparency = 1
    scroll.ScrollBarThickness = 4
    scroll.ScrollBarImageColor3 = Color3.fromRGB(255, 60, 160)
    scroll.CanvasSize = UDim2.new(0, 0, 0, #Config.Emotes * 38)
    scroll.Parent = menuFrame

    local list = Instance.new("UIListLayout")
    list.FillDirection = Enum.FillDirection.Vertical
    list.Padding = UDim.new(0, 6)
    list.Parent = scroll

    for _, emote in ipairs(Config.Emotes) do
        local btn = Instance.new("TextButton")
        btn.Size = UDim2.new(1, -6, 0, 32)
        btn.BackgroundColor3 = Color3.fromRGB(32, 35, 50)
        btn.Font = Enum.Font.GothamMedium
        btn.TextSize = 12
        btn.TextColor3 = Color3.fromRGB(235, 240, 250)
        btn.Text = emote.Name
        btn.Parent = scroll

        local btnCorner = Instance.new("UICorner")
        btnCorner.CornerRadius = UDim.new(0, 6)
        btnCorner.Parent = btn

        btn.MouseButton1Click:Connect(function()
            EmotesMenu.playAnimation(emote.Id)
        end)

        table.insert(emoteButtons, { Button = btn, Name = string.lower(emote.Name) })
    end

    -- Search Filter handler
    searchBox:GetPropertyChangedSignal("Text"):Connect(function()
        local query = string.lower(searchBox.Text)
        local visibleCount = 0
        for _, item in ipairs(emoteButtons) do
            local matches = (#query == 0) or string.find(item.Name, query) ~= nil
            item.Button.Visible = matches
            if matches then visibleCount += 1 end
        end
        scroll.CanvasSize = UDim2.new(0, 0, 0, visibleCount * 38)
    end)

    -- Stop Emote Button
    local stopBtn = Instance.new("TextButton")
    stopBtn.Size = UDim2.new(1, -16, 0, 34)
    stopBtn.Position = UDim2.new(0, 8, 1, -44)
    stopBtn.BackgroundColor3 = Color3.fromRGB(190, 45, 65)
    stopBtn.Font = Enum.Font.GothamBold
    stopBtn.TextSize = 13
    stopBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    stopBtn.Text = "⏹ Stop Dance (நிறுத்து)"
    stopBtn.Parent = menuFrame

    local stopCorner = Instance.new("UICorner")
    stopCorner.CornerRadius = UDim.new(0, 8)
    stopCorner.Parent = stopBtn

    stopBtn.MouseButton1Click:Connect(function()
        EmotesMenu.stopAnimation()
    end)

    -- Auto-cancel when walking
    player.CharacterAdded:Connect(function(char)
        local hum = char:WaitForChild("Humanoid", 10) :: Humanoid?
        if hum then
            hum.Running:Connect(function(speed)
                if speed > 0.5 then
                    EmotesMenu.stopAnimation()
                end
            end)
        end
    end)
end

function EmotesMenu.playAnimation(id: string)
    local char = player.Character
    if not char then return end
    local hum = char:FindFirstChildOfClass("Humanoid")
    local animator = hum and hum:FindFirstChildOfClass("Animator")
    if not animator then return end

    EmotesMenu.stopAnimation()

    local anim = Instance.new("Animation")
    anim.AnimationId = id

    local success, track = pcall(function()
        return animator:LoadAnimation(anim)
    end)

    if success and track then
        currentTrack = track
        track:Play()
    end
end

function EmotesMenu.stopAnimation()
    if currentTrack then
        currentTrack:Stop()
        currentTrack = nil
    end
end

function EmotesMenu.toggleVisible()
    if menuFrame then
        menuFrame.Visible = not menuFrame.Visible
    end
end

return EmotesMenu
