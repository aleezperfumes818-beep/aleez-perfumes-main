--!strict
-- Admin Panel UI for Marina Neon Lounge

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local Network = require(ReplicatedStorage.Shared.Network)
local player = Players.LocalPlayer

local AdminPanel = {}

local panelFrame: Frame?
local isAuthorized = false

function AdminPanel.init()
    local playerGui = player:WaitForChild("PlayerGui")
    local screenGui = playerGui:WaitForChild("HangoutHUD") :: ScreenGui

    -- Listen for authorization
    local stateSync = Network.getEvent("AdminStateSync")
    stateSync.OnClientEvent:Connect(function(authorized: boolean)
        isAuthorized = authorized
    end)

    panelFrame = Instance.new("Frame")
    panelFrame.Name = "AdminPanelWidget"
    panelFrame.Size = UDim2.new(0, 340, 0, 380)
    panelFrame.Position = UDim2.new(0.5, -170, 0.5, -190)
    panelFrame.BackgroundColor3 = Color3.fromRGB(16, 18, 26)
    panelFrame.BackgroundTransparency = 0.1
    panelFrame.BorderSizePixel = 0
    panelFrame.Visible = false
    panelFrame.Parent = screenGui

    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 14)
    corner.Parent = panelFrame

    local stroke = Instance.new("UIStroke")
    stroke.Color = Color3.fromRGB(0, 230, 140) -- Emerald Admin Glow
    stroke.Thickness = 1.5
    stroke.Parent = panelFrame

    -- Header
    local header = Instance.new("Frame")
    header.Size = UDim2.new(1, 0, 0, 42)
    header.BackgroundColor3 = Color3.fromRGB(22, 26, 38)
    header.BorderSizePixel = 0
    header.Parent = panelFrame

    local hCorner = Instance.new("UICorner")
    hCorner.CornerRadius = UDim.new(0, 14)
    hCorner.Parent = header

    local title = Instance.new("TextLabel")
    title.Size = UDim2.new(1, -50, 1, 0)
    title.Position = UDim2.new(0, 15, 0, 0)
    title.BackgroundTransparency = 1
    title.Font = Enum.Font.GothamBlack
    title.TextSize = 14
    title.TextColor3 = Color3.fromRGB(0, 240, 160)
    title.TextXAlignment = Enum.TextXAlignment.Left
    title.Text = "🛡️ ADMIN PANEL | அட்மின்"
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
        AdminPanel.toggleVisible()
    end)

    -- Scrolling Actions List
    local scroll = Instance.new("ScrollingFrame")
    scroll.Size = UDim2.new(1, -24, 1, -54)
    scroll.Position = UDim2.new(0, 12, 0, 48)
    scroll.BackgroundTransparency = 1
    scroll.ScrollBarThickness = 4
    scroll.CanvasSize = UDim2.new(0, 0, 0, 380)
    scroll.Parent = panelFrame

    local list = Instance.new("UIListLayout")
    list.FillDirection = Enum.FillDirection.Vertical
    list.Padding = UDim.new(0, 8)
    list.Parent = scroll

    local function createAdminButton(text: string, color: Color3, onClick: () -> ())
        local btn = Instance.new("TextButton")
        btn.Size = UDim2.new(1, -4, 0, 34)
        btn.BackgroundColor3 = color
        btn.Font = Enum.Font.GothamBold
        btn.TextSize = 12
        btn.TextColor3 = Color3.fromRGB(255, 255, 255)
        btn.Text = text
        btn.Parent = scroll

        local bCorner = Instance.new("UICorner")
        bCorner.CornerRadius = UDim.new(0, 6)
        bCorner.Parent = btn

        btn.MouseButton1Click:Connect(onClick)
    end

    local adminEvent = Network.getEvent("AdminCommand")

    -- 1. WalkSpeed Toggle
    createAdminButton("⚡ Super Speed (36 WalkSpeed)", Color3.fromRGB(45, 80, 140), function()
        adminEvent:FireServer("speed", 36)
    end)

    -- 2. Normal Speed
    createAdminButton("🚶 Reset Speed (16 WalkSpeed)", Color3.fromRGB(40, 45, 60), function()
        adminEvent:FireServer("speed", 16)
    end)

    -- 3. Super Jump
    createAdminButton("🦘 High Jump (120 JumpPower)", Color3.fromRGB(120, 60, 140), function()
        adminEvent:FireServer("jump", 120)
    end)

    -- 4. Give Vibes
    createAdminButton("💎 Free +1,000 Vibes", Color3.fromRGB(0, 160, 120), function()
        adminEvent:FireServer("vibes", 1000)
    end)

    -- 5. Smoke Blast
    createAdminButton("💨 Blast Stage Smoke Jets", Color3.fromRGB(200, 70, 70), function()
        adminEvent:FireServer("smokeblast")
    end)

    -- 6. Time of Day Controls
    createAdminButton("🌙 Set Midnight (Party Mode)", Color3.fromRGB(50, 40, 80), function()
        adminEvent:FireServer("time", "night")
    end)
    createAdminButton("🌅 Set Sunset (Chill Vibe)", Color3.fromRGB(160, 90, 40), function()
        adminEvent:FireServer("time", "sunset")
    end)

    -- 7. Server Announcement Box
    local announceBox = Instance.new("TextBox")
    announceBox.Size = UDim2.new(1, -4, 0, 34)
    announceBox.BackgroundColor3 = Color3.fromRGB(28, 32, 46)
    announceBox.Font = Enum.Font.Gotham
    announceBox.TextSize = 12
    announceBox.TextColor3 = Color3.fromRGB(255, 255, 255)
    announceBox.PlaceholderText = "Type announcement (அறிவிப்பு)..."
    announceBox.PlaceholderColor3 = Color3.fromRGB(140, 150, 170)
    announceBox.Parent = scroll

    local aCorner = Instance.new("UICorner")
    aCorner.CornerRadius = UDim.new(0, 6)
    aCorner.Parent = announceBox

    createAdminButton("📢 Broadcast Announcement (அறிவி)", Color3.fromRGB(220, 140, 30), function()
        if #announceBox.Text > 0 then
            adminEvent:FireServer("announce", announceBox.Text)
            announceBox.Text = ""
        end
    end)
end

function AdminPanel.toggleVisible()
    if panelFrame then
        panelFrame.Visible = not panelFrame.Visible
    end
end

function AdminPanel.isUserAdmin(): boolean
    return isAuthorized
end

return AdminPanel
