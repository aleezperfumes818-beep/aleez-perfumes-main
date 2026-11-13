--!strict
-- Notification UI: Smooth sliding toasts for rewards and system alerts

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local player = Players.LocalPlayer

local NotificationUI = {}

local screenGui: ScreenGui
local notifContainer: Frame

function NotificationUI.init()
    local playerGui = player:WaitForChild("PlayerGui")
    
    screenGui = Instance.new("ScreenGui")
    screenGui.Name = "HangoutNotifications"
    screenGui.ResetOnSpawn = false
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
    screenGui.Parent = playerGui

    notifContainer = Instance.new("Frame")
    notifContainer.Name = "NotificationContainer"
    notifContainer.Size = UDim2.new(0, 320, 0, 50)
    notifContainer.Position = UDim2.new(0.5, -160, 0, -70) -- Off screen top
    notifContainer.BackgroundColor3 = Color3.fromRGB(25, 27, 36)
    notifContainer.BackgroundTransparency = 0.15
    notifContainer.BorderSizePixel = 0
    notifContainer.Parent = screenGui

    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 10)
    corner.Parent = notifContainer

    local stroke = Instance.new("UIStroke")
    stroke.Color = Color3.fromRGB(120, 200, 255)
    stroke.Thickness = 1.5
    stroke.Transparency = 0.3
    stroke.Parent = notifContainer

    local label = Instance.new("TextLabel")
    label.Name = "ToastLabel"
    label.Size = UDim2.new(1, -20, 1, 0)
    label.Position = UDim2.new(0, 10, 0, 0)
    label.BackgroundTransparency = 1
    label.Font = Enum.Font.GothamMedium
    label.TextSize = 14
    label.TextColor3 = Color3.fromRGB(240, 245, 255)
    label.TextWrapped = true
    label.Text = ""
    label.Parent = notifContainer
end

function NotificationUI.show(message: string)
    if not notifContainer then return end
    local label = notifContainer:FindFirstChild("ToastLabel") :: TextLabel?
    if not label then return end

    label.Text = message

    -- Slide down
    local slideDown = TweenService:Create(notifContainer, TweenInfo.new(0.4, Enum.EasingStyle.Back, Enum.EasingDirection.Out), {
        Position = UDim2.new(0.5, -160, 0, 25)
    })
    slideDown:Play()

    -- Slide back up after 3 seconds
    task.delay(3, function()
        local slideUp = TweenService:Create(notifContainer, TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.In), {
            Position = UDim2.new(0.5, -160, 0, -70)
        })
        slideUp:Play()
    end)
end

return NotificationUI
