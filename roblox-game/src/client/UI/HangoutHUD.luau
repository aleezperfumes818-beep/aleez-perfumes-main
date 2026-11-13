--!strict
-- Main HUD & Bottom Navigation Bar for Tropical Tamil Island

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

local Network = require(ReplicatedStorage.Shared.Network)
local MusicPlayer = require(script.Parent.MusicPlayer)
local KaraokeUI = require(script.Parent.KaraokeUI)
local EmotesMenu = require(script.Parent.EmotesMenu)
local AdminPanel = require(script.Parent.AdminPanel)

local player = Players.LocalPlayer
local HangoutHUD = {}

function HangoutHUD.init()
    local playerGui = player:WaitForChild("PlayerGui")
    local screenGui = playerGui:WaitForChild("HangoutHUD") :: ScreenGui

    local oldBar = screenGui:FindFirstChild("BottomActionBar")
    if oldBar then oldBar:Destroy() end

    -- Bottom Bar Container
    local bar = Instance.new("Frame")
    bar.Name = "BottomActionBar"
    bar.Size = UDim2.new(0, 560, 0, 52)
    bar.Position = UDim2.new(0.5, -280, 1, -70)
    bar.BackgroundColor3 = Color3.fromRGB(15, 17, 24)
    bar.BackgroundTransparency = 0.15
    bar.BorderSizePixel = 0
    bar.Parent = screenGui

    local barCorner = Instance.new("UICorner")
    barCorner.CornerRadius = UDim.new(0, 14)
    barCorner.Parent = bar

    local barStroke = Instance.new("UIStroke")
    barStroke.Color = Color3.fromRGB(0, 240, 255)
    barStroke.Thickness = 1.2
    barStroke.Parent = bar

    local layout = Instance.new("UIListLayout")
    layout.FillDirection = Enum.FillDirection.Horizontal
    layout.HorizontalAlignment = Enum.HorizontalAlignment.Center
    layout.VerticalAlignment = Enum.VerticalAlignment.Center
    layout.Padding = UDim.new(0, 8)
    layout.Parent = bar

    local function createActionButton(name: string, text: string, color: Color3, onClick: () -> ())
        local btn = Instance.new("TextButton")
        btn.Name = name .. "Btn"
        btn.Size = UDim2.new(0, 85, 0, 36)
        btn.BackgroundColor3 = color
        btn.Font = Enum.Font.GothamBold
        btn.TextSize = 12
        btn.TextColor3 = Color3.fromRGB(255, 255, 255)
        btn.Text = text
        btn.Parent = bar

        local corner = Instance.new("UICorner")
        corner.CornerRadius = UDim.new(0, 8)
        corner.Parent = btn

        btn.MouseEnter:Connect(function()
            TweenService:Create(btn, TweenInfo.new(0.15), { Size = UDim2.new(0, 89, 0, 38) }):Play()
        end)
        btn.MouseLeave:Connect(function()
            TweenService:Create(btn, TweenInfo.new(0.15), { Size = UDim2.new(0, 85, 0, 36) }):Play()
        end)

        btn.MouseButton1Click:Connect(onClick)
        return btn
    end

    -- 1. Music Button
    createActionButton("Music", "🎵 Music", Color3.fromRGB(40, 48, 70), function()
        MusicPlayer.toggleVisible()
    end)

    -- 2. Karaoke Queue & Lyrics Button
    createActionButton("Karaoke", "🎤 Karaoke", Color3.fromRGB(180, 120, 25), function()
        KaraokeUI.toggleVisible()
    end)

    -- 3. Emotes Button
    createActionButton("Emotes", "💃 Emotes", Color3.fromRGB(65, 40, 85), function()
        EmotesMenu.toggleVisible()
    end)

    -- 4. AFK Button
    createActionButton("AFK", "💤 AFK", Color3.fromRGB(75, 55, 105), function()
        local afkEvent = Network.getEvent("ToggleAFK")
        afkEvent:FireServer()
    end)

    -- 5. Ragdoll Button
    createActionButton("Ragdoll", "🤸 Flop", Color3.fromRGB(125, 45, 60), function()
        local ragdollEvent = Network.getEvent("ToggleRagdoll")
        ragdollEvent:FireServer()
    end)

    -- 6. Admin Panel Button
    local adminBtn = createActionButton("Admin", "🛡️ Admin", Color3.fromRGB(0, 160, 100), function()
        AdminPanel.toggleVisible()
    end)

    if RunService:IsStudio() or player.UserId == game.CreatorId then
        adminBtn.Visible = true
    else
        adminBtn.Visible = false
        local stateSync = Network.getEvent("AdminStateSync")
        stateSync.OnClientEvent:Connect(function(authorized: boolean)
            if authorized then
                adminBtn.Visible = true
            end
        end)
    end
end

return HangoutHUD
